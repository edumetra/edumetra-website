import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { enrollUser } from "@/lib/engagement/engine";

export const dynamic = "force-dynamic";

const ENROLLMENT_EVENTS = new Set(["signup_inactive_24h", "user_dormant_7d", "activation_incomplete"]);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const userId = body.userId as string | undefined;
        const eventName = body.eventName as string | undefined;
        const metadata = (body.metadata ?? {}) as Record<string, unknown>;

        if (!userId || !eventName) {
            return NextResponse.json({ error: "userId and eventName are required" }, { status: 400 });
        }

        const supabase = createAdminClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("engagement_event_log").insert({
            user_id: userId,
            event_name: eventName,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            metadata: metadata as any,
        });

        let enrollment = null;
        if (ENROLLMENT_EVENTS.has(eventName)) {
            enrollment = await enrollUser({ userId, metadata });
        }

        return NextResponse.json({ ok: true, enrollmentTriggered: !!enrollment, enrollment });
    } catch (error) {
        const message = error instanceof Error ? error.message : "engagement_event_failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
