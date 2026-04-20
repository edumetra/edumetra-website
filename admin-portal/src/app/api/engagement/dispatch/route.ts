import { NextRequest, NextResponse } from "next/server";
import { runDispatcher } from "@/lib/engagement/engine";

export const dynamic = "force-dynamic";

const validateCron = (req: NextRequest) => {
    const expected = process.env.ENGAGEMENT_CRON_SECRET;
    if (!expected) return true;
    const actual = req.headers.get("x-cron-secret");
    return actual === expected;
};

export async function POST(req: NextRequest) {
    if (!validateCron(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const processed = await runDispatcher();
        return NextResponse.json({ ok: true, processedCount: processed.length, processed });
    } catch (error) {
        const message = error instanceof Error ? error.message : "dispatch_failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
