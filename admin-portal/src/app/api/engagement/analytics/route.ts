import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const supabase = createAdminClient();

        const [enrolledRes, messagesRes, deliveredRes, readRes, convertedRes, failedRes] = await Promise.all([
            supabase.from("engagement_enrollments").select("id", { count: "exact", head: true }),
            supabase.from("engagement_messages").select("id", { count: "exact", head: true }),
            supabase.from("engagement_messages").select("id", { count: "exact", head: true }).eq("status", "delivered"),
            supabase.from("engagement_messages").select("id", { count: "exact", head: true }).eq("status", "read"),
            supabase.from("engagement_conversions").select("id", { count: "exact", head: true }),
            supabase.from("engagement_messages").select("id", { count: "exact", head: true }).eq("status", "failed"),
        ]);

        const [providerBreakdownRes, dailyRes] = await Promise.all([
            supabase.from("engagement_messages").select("provider,status"),
            supabase
                .from("engagement_messages")
                .select("created_at,status")
                .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        ]);

        const providerStats = (providerBreakdownRes.data ?? []).reduce<Record<string, { total: number; delivered: number; failed: number }>>(
            (acc, row) => {
                const key = row.provider ?? "unknown";
                if (!acc[key]) acc[key] = { total: 0, delivered: 0, failed: 0 };
                acc[key].total += 1;
                if (row.status === "delivered" || row.status === "read") acc[key].delivered += 1;
                if (row.status === "failed") acc[key].failed += 1;
                return acc;
            },
            {}
        );

        const dailySeries = (dailyRes.data ?? []).reduce<Record<string, { sent: number; failed: number }>>((acc, row) => {
            const day = row.created_at.slice(0, 10);
            if (!acc[day]) acc[day] = { sent: 0, failed: 0 };
            acc[day].sent += 1;
            if (row.status === "failed") acc[day].failed += 1;
            return acc;
        }, {});

        return NextResponse.json({
            summary: {
                enrolled: enrolledRes.count ?? 0,
                attempted: messagesRes.count ?? 0,
                delivered: deliveredRes.count ?? 0,
                read: readRes.count ?? 0,
                converted: convertedRes.count ?? 0,
                failed: failedRes.count ?? 0,
            },
            providerStats,
            dailySeries,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "analytics_fetch_failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
