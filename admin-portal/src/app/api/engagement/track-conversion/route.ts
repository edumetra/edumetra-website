import { NextRequest, NextResponse } from "next/server";
import { trackConversion } from "@/lib/engagement/engine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const userId = body.userId as string | undefined;
        const conversionEvent = body.conversionEvent as string | undefined;
        const revenue = body.revenue as number | undefined;

        if (!userId || !conversionEvent) {
            return NextResponse.json({ error: "userId and conversionEvent are required" }, { status: 400 });
        }

        const result = await trackConversion(userId, conversionEvent, revenue);
        return NextResponse.json({ ok: true, result });
    } catch (error) {
        const message = error instanceof Error ? error.message : "track_conversion_failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
