import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const userId = body.userId as string | undefined;
        const channel = body.channel as "email" | "sms" | "whatsapp" | undefined;

        if (!userId || !channel) {
            return NextResponse.json({ error: "userId and channel are required" }, { status: 400 });
        }

        const supabase = createAdminClient();
        const update: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        if (channel === "email") update.email_opt_in = false;
        if (channel === "sms") update.sms_opt_in = false;
        if (channel === "whatsapp") update.whatsapp_opt_in = false;
        update.unsubscribed_at = new Date().toISOString();

        await supabase.from("user_channel_preferences").upsert({
            user_id: userId,
            ...update,
        });

        await supabase
            .from("engagement_enrollments")
            .update({
                status: "exited",
                exited_at: new Date().toISOString(),
                exit_reason: `unsubscribed_${channel}`,
                updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId)
            .eq("status", "active");

        return NextResponse.json({ ok: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : "unsubscribe_failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
