import { NextRequest, NextResponse } from "next/server";
import { enrollUser } from "@/lib/engagement/engine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const userId = body.userId as string | undefined;
        const campaignSlug = body.campaignSlug as string | undefined;
        const metadata = (body.metadata ?? {}) as Record<string, unknown>;

        if (!userId) {
            return NextResponse.json({ error: "userId is required" }, { status: 400 });
        }

        const enrollment = await enrollUser({ userId, campaignSlug, metadata });
        return NextResponse.json({ ok: true, enrollment });
    } catch (error) {
        const message = error instanceof Error ? error.message : "failed_to_enroll";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
