"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Users, Star, MessageSquare, GraduationCap, TrendingUp, Clock, Trophy } from "lucide-react";

type DailyStat = { date: string; count: number };
type TopCollege = { name: string; review_count: number; rating: number };

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: number | string; color: string }) {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="text-sm text-slate-400">{label}</div>
        </div>
    );
}

export default function AnalyticsPage() {
    const supabase = createClient();
    const [stats, setStats] = useState({
        totalColleges: 0,
        totalReviews: 0,
        pendingReviews: 0,
        totalUsers: 0,
    });
    const [topColleges, setTopColleges] = useState<TopCollege[]>([]);
    const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAll = async () => {
        setLoading(true);

        // Parallel queries
        const [collegesRes, reviewsRes, pendingRes, usersRes, topRes] = await Promise.all([
            supabase.schema("public").from("colleges").select("id", { count: "exact", head: true }),
            supabase.schema("public").from("reviews").select("id", { count: "exact", head: true }),
            supabase.schema("public").from("reviews").select("id", { count: "exact", head: true }).eq("moderation_status", "pending"),
            supabase.schema("public").from("user_profiles").select("id", { count: "exact", head: true }),
            supabase.schema("public").from("colleges").select("name, review_count, rating").eq("visibility", "public").order("review_count", { ascending: false }).limit(10),
        ]);

        setStats({
            totalColleges: collegesRes.count ?? 0,
            totalReviews: reviewsRes.count ?? 0,
            pendingReviews: pendingRes.count ?? 0,
            totalUsers: usersRes.count ?? 0,
        });

        setTopColleges((topRes.data ?? []) as TopCollege[]);

        // Daily reviews for last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { data: reviewDates } = await supabase
            .schema("public")
            .from("reviews")
            .select("created_at")
            .gte("created_at", thirtyDaysAgo);

        // Group by date
        const byDate: Record<string, number> = {};
        (reviewDates ?? []).forEach(r => {
            const day = r.created_at.slice(0, 10);
            byDate[day] = (byDate[day] ?? 0) + 1;
        });

        // Fill last 30 days
        const days: DailyStat[] = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const key = d.toISOString().slice(0, 10);
            days.push({ date: key, count: byDate[key] ?? 0 });
        }
        setDailyStats(days);
        setLoading(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchAll(); }, []);

    const maxCount = Math.max(...dailyStats.map(d => d.count), 1);

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                    <TrendingUp className="w-7 h-7 text-red-400" /> Analytics Dashboard
                </h1>
                <p className="text-slate-400 text-sm">Platform-wide insights and performance metrics.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard icon={Users} label="Total Users" value={loading ? "—" : stats.totalUsers} color="bg-blue-500/10 text-blue-400" />
                <StatCard icon={MessageSquare} label="Total Reviews" value={loading ? "—" : stats.totalReviews} color="bg-amber-500/10 text-amber-400" />
                <StatCard icon={Clock} label="Pending Moderation" value={loading ? "—" : stats.pendingReviews} color="bg-red-500/10 text-red-400" />
                <StatCard icon={GraduationCap} label="Total Colleges" value={loading ? "—" : stats.totalColleges} color="bg-emerald-500/10 text-emerald-400" />
            </div>

            {/* Reviews per day chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-red-400" /> Reviews per Day (Last 30 Days)
                </h2>
                {loading ? (
                    <div className="h-32 animate-pulse bg-slate-800 rounded-xl" />
                ) : (
                    <div className="flex items-end gap-1 h-32">
                        {dailyStats.map(d => (
                            <div key={d.date} className="flex-1 flex flex-col items-center justify-end group" title={`${d.date}: ${d.count} reviews`}>
                                <div
                                    className="w-full bg-red-600/70 hover:bg-red-500 rounded-t transition-all"
                                    style={{ height: d.count > 0 ? `${Math.max((d.count / maxCount) * 100, 4)}%` : "2px", opacity: d.count === 0 ? 0.15 : 1 }}
                                />
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex justify-between mt-2 text-xs text-slate-600">
                    <span>{dailyStats[0]?.date.slice(5)}</span>
                    <span>Today</span>
                </div>
            </div>

            {/* Top Colleges by Reviews */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" /> Top Colleges by Review Count
                </h2>
                {loading ? (
                    [...Array(5)].map((_, i) => <div key={i} className="h-10 bg-slate-800 rounded-lg mb-2 animate-pulse" />)
                ) : (
                    <div className="space-y-3">
                        {topColleges.map((c, i) => (
                            <div key={i} className="flex items-center gap-4 py-2 border-b border-slate-800/60 last:border-0">
                                <span className="text-slate-600 font-bold text-sm w-6 text-right shrink-0">#{i + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-slate-200 font-semibold text-sm truncate">{c.name}</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-slate-400 text-sm"><span className="font-bold text-white">{c.review_count ?? 0}</span> reviews</span>
                                    <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">
                                        <Star className="w-3.5 h-3.5 fill-current" />{c.rating ?? "—"}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {topColleges.length === 0 && <p className="text-slate-600 text-sm">No data yet.</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
