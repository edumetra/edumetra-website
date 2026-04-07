import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

/**
 * POST /api/track-pricing-view
 * Body: { user_id?: string, email?: string, identifier: string }
 *
 * Call this from the public website's PricingPage on mount.
 * identifier = user_id (if logged in) OR a guest fingerprint.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { identifier, user_id, email } = body as {
            identifier: string;
            user_id?: string;
            email?: string;
        };

        if (!identifier) {
            return NextResponse.json({ error: "identifier required" }, { status: 400 });
        }

        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        // Upsert: increment view count and update last_seen
        const { error } = await supabase.rpc("upsert_lead_score", {
            p_identifier: identifier,
            p_user_id: user_id || null,
            p_email: email || null,
        });

        if (error) {
            console.error("lead_score upsert error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
