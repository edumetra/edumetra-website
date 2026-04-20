import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

const verifySignature = (req: NextRequest, rawBody: string, provider: string): boolean => {
    const secretMap: Record<string, string | undefined> = {
        otp_sms:  process.env.OTP_SMS_WEBHOOK_SECRET,
        rcs:      process.env.RCS_WEBHOOK_SECRET,
        whatsapp: process.env.WHATSAPP_WEBHOOK_SECRET,
        email:    process.env.ENGAGEMENT_EMAIL_WEBHOOK_SECRET,
    };

    const secret = secretMap[provider];
    // Fail closed: if no secret is configured, reject the request entirely
    if (!secret) return false;

    const header = req.headers.get("x-signature") ?? req.headers.get("x-hub-signature-256") ?? "";
    if (!header) return false;

    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    // Support both raw hex and "sha256=..." prefix (used by Meta/WhatsApp)
    const normalized = header.replace(/^sha256=/, "");
    return expected === normalized;
};

const mapStatus = (eventType: string) => {
    const normalized = eventType.toLowerCase();
    if (normalized.includes("delivered")) return "delivered";
    if (normalized.includes("read")) return "read";
    if (normalized.includes("failed")) return "failed";
    if (normalized.includes("sent")) return "sent";
    return "queued";
};

export async function POST(req: NextRequest, context: { params: Promise<{ provider: string }> }) {
    const { provider } = await context.params;
    const rawBody = await req.text();

    if (!verifySignature(req, rawBody, provider)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let payload: Record<string, unknown> = {};
    try {
        payload = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const providerMessageId = String(payload.message_id ?? payload.id ?? "");
    const eventType = String(payload.event_type ?? payload.status ?? "queued");
    const supabase = createAdminClient();

    const { data: message } = await supabase
        .from("engagement_messages")
        .select("id")
        .eq("provider_message_id", providerMessageId)
        .maybeSingle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("provider_delivery_events").insert({
        message_id: message?.id ?? null,
        provider,
        provider_message_id: providerMessageId || null,
        event_type: eventType,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        raw_payload: payload as any,
    });

    if (message?.id) {
        const mapped = mapStatus(eventType);
        await supabase
            .from("engagement_messages")
            .update({
                status: mapped,
                delivered_at: mapped === "delivered" ? new Date().toISOString() : null,
                read_at: mapped === "read" ? new Date().toISOString() : null,
                error_message: mapped === "failed" ? String(payload.error_message ?? "provider_failed") : null,
            })
            .eq("id", message.id);
    }

    return NextResponse.json({ ok: true });
}
