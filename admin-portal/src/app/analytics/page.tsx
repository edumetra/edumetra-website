"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Users, Star, MessageSquare, GraduationCap, TrendingUp, Clock, Trophy, BarChart2 } from "lucide-react";

type DailyStat = { date: string; count: number };
type TopCollege = { name: string; review_count: number; rating: number };
type TimeRange = "7d" | "30d" | "90d";
type EngagementSummary = {
    enrolled: number;
    attempted: number;
    delivered: number;
    read: number;
    converted: number;
    failed: number;
};

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

function BarChart({ data, maxVal, color = "bg-red-600/70 hover:bg-red-500" }: { data: DailyStat[]; maxVal: number; color?: string }) {
    return (
        <div className="flex items-end gap-1 h-36">
            {data.map((d) => (
                <div
                    key={d.date}
                    className="flex-1 flex flex-col items-center justify-end group"
                    title={`${d.date}: ${d.count}`}
                >
                    <div
                        className={`w-full ${color} rounded-t transition-all`}
                        style={{
                            height: d.count > 0 ? `${Math.max((d.count / maxVal) * 100, 4)}%` : "2px",
                            opacity: d.count === 0 ? 0.15 : 1,
                        }}
                    />
                </div>
            ))}
        </div>
    );
}

export default function AnalyticsPage() {
    const supabase = createClient();
    const [stats, setStats] = useState({ totalColleges: 0, totalReviews: 0, pendingReviews: 0, totalUsers: 0, avgRating: 0 });
    const [topColleges, setTopColleges] = useState<TopCollege[]>([]);
    const [reviewDailyStats, setReviewDailyStats] = useState<DailyStat[]>([]);
    const [userDailyStats, setUserDailyStats] = useState<DailyStat[]>([]);
    const [ratingDist, setRatingDist] = useState<{ rating: number; count: number }[]>([]);
    const [engagementSummary, setEngagementSummary] = useState<EngagementSummary>({
        enrolled: 0,
        attempted: 0,
        delivered: 0,
        read: 0,
        converted: 0,
        failed: 0,
    });
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<TimeRange>("30d");

    const daysMap: Record<TimeRange, number> = { "7d": 7, "30d": 30, "90d": 90 };

    const buildDailySeries = (dates: string[], days: number): DailyStat[] => {
        const byDate: Record<string, number> = {};
        dates.forEach((d) => { const key = d.slice(0, 10); byDate[key] = (byDate[key] ?? 0) + 1; });
        const result: DailyStat[] = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(Date.now() - i * 86400000);
            const key = d.toISOString().slice(0, 10);
            result.push({ date: key, count: byDate[key] ?? 0 });
        }
        return result;
    };

    const fetchAll = useCallback(async () => {
        setLoading(true);
        const days = daysMap[timeRange];
        const since = new Date(Date.now() - days * 86400000).toISOString();

        const [collegesRes, reviewsRes, pendingRes, usersRes, topRes, reviewDatesRes, userDatesRes, ratingRes] = await Promise.all([
            supabase.from("colleges").select("id", { count: "exact", head: true }),
            supabase.from("reviews").select("id", { count: "exact", head: true }),
            supabase.from("reviews").select("id", { count: "exact", head: true }).eq("moderation_status", "pending"),
            supabase.from("user_profiles").select("id", { count: "exact", head: true }),
            supabase.from("colleges").select("name, review_count, rating").eq("visibility", "public").order("review_count", { ascending: false }).limit(10),
            supabase.from("reviews").select("created_at").gte("created_at", since),
            supabase.from("user_profiles").select("created_at").gte("created_at", since),
            supabase.from("reviews").select("rating"),
        ]);

        // Average rating
        const allRatings = ratingRes.data ?? [];
        const avg = allRatings.length ? (allRatings.reduce((sum, r) => sum + (r.rating ?? 0), 0) / allRatings.length) : 0;

        // Rating distribution
        const dist = [1, 2, 3, 4, 5].map((r) => ({
            rating: r,
            count: allRatings.filter((x) => Math.round(x.rating ?? 0) === r).length,
        }));

        setStats({
            totalColleges: collegesRes.count ?? 0,
            totalReviews: reviewsRes.count ?? 0,
            pendingReviews: pendingRes.count ?? 0,
            totalUsers: usersRes.count ?? 0,
            avgRating: Math.round(avg * 10) / 10,
        });

        // @ts-expect-error - Database types are nullable, UI expects non-nullable
        setTopColleges(topRes.data ?? []);
        setReviewDailyStats(buildDailySeries((reviewDatesRes.data ?? []).map((r: { created_at: string }) => r.created_at), days));
        setUserDailyStats(buildDailySeries((userDatesRes.data ?? []).map((r: { created_at: string }) => r.created_at), days));
        setRatingDist(dist);

        try {
            const engagementRes = await fetch("/api/engagement/analytics");
            if (engagementRes.ok) {
                const engagementData = await engagementRes.json();
                if (engagementData.summary) {
                    setEngagementSummary(engagementData.summary);
                }
            }
        } catch {
            // Best-effort: don't block core analytics UI.
        }

        setLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeRange]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const maxReviews = Math.max(...reviewDailyStats.map((d) => d.count), 1);
    const maxUsers = Math.max(...userDailyStats.map((d) => d.count), 1);
    const maxRating = Math.max(...ratingDist.map((d) => d.count), 1);

    const timeRanges: TimeRange[] = ["7d", "30d", "90d"];

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                        <TrendingUp className="w-7 h-7 text-red-400" /> Analytics Dashboard
                    </h1>
                    <p className="text-slate-400 text-sm">Platform-wide insights and performance metrics.</p>
                </div>
                {/* Time range selector */}
                <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1">
                    {timeRanges.map((r) => (
                        <button
                            key={r}
                            onClick={() => setTimeRange(r)}
                            className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${timeRange === r
                                    ? "bg-red-600 text-white shadow-sm"
                                    : "text-slate-400 hover:text-white"
                                }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <StatCard icon={Users} label="Total Users" value={loading ? "—" : stats.totalUsers} color="bg-blue-500/10 text-blue-400" />
                <StatCard icon={MessageSquare} label="Total Reviews" value={loading ? "—" : stats.totalReviews} color="bg-amber-500/10 text-amber-400" />
                <StatCard icon={Clock} label="Pending" value={loading ? "—" : stats.pendingReviews} color="bg-red-500/10 text-red-400" />
                <StatCard icon={GraduationCap} label="Colleges" value={loading ? "—" : stats.totalColleges} color="bg-emerald-500/10 text-emerald-400" />
                <StatCard icon={Star} label="Avg Rating" value={loading ? "—" : stats.avgRating} color="bg-purple-500/10 text-purple-400" />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
                <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Engagement Funnel</h2>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    <StatCard icon={Users} label="Enrolled" value={loading ? "—" : engagementSummary.enrolled} color="bg-indigo-500/10 text-indigo-400" />
                    <StatCard icon={MessageSquare} label="Attempted" value={loading ? "—" : engagementSummary.attempted} color="bg-sky-500/10 text-sky-400" />
                    <StatCard icon={TrendingUp} label="Delivered" value={loading ? "—" : engagementSummary.delivered} color="bg-emerald-500/10 text-emerald-400" />
                    <StatCard icon={BarChart2} label="Read" value={loading ? "—" : engagementSummary.read} color="bg-amber-500/10 text-amber-400" />
                    <StatCard icon={Trophy} label="Converted" value={loading ? "—" : engagementSummary.converted} color="bg-purple-500/10 text-purple-400" />
                    <StatCard icon={Clock} label="Failed" value={loading ? "—" : engagementSummary.failed} color="bg-rose-500/10 text-rose-400" />
                </div>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Reviews chart */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2 uppercase tracking-wider">
                        <MessageSquare className="w-4 h-4 text-red-400" /> Reviews — Last {timeRange}
                    </h2>
                    <p className="text-xs text-slate-500 mb-5">Daily review submissions</p>
                    {loading ? (
                        <div className="h-36 animate-pulse bg-slate-800 rounded-xl" />
                    ) : (
                        <BarChart data={reviewDailyStats} maxVal={maxReviews} color="bg-red-600/70 hover:bg-red-500" />
                    )}
                    <div className="flex justify-between mt-2 text-xs text-slate-600">
                        <span>{reviewDailyStats[0]?.date.slice(5)}</span>
                        <span>Today</span>
                    </div>
                </div>

                {/* Users signups chart */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2 uppercase tracking-wider">
                        <Users className="w-4 h-4 text-blue-400" /> User Signups — Last {timeRange}
                    </h2>
                    <p className="text-xs text-slate-500 mb-5">New registrations per day</p>
                    {loading ? (
                        <div className="h-36 animate-pulse bg-slate-800 rounded-xl" />
                    ) : (
                        <BarChart data={userDailyStats} maxVal={maxUsers} color="bg-blue-600/70 hover:bg-blue-500" />
                    )}
                    <div className="flex justify-between mt-2 text-xs text-slate-600">
                        <span>{userDailyStats[0]?.date.slice(5)}</span>
                        <span>Today</span>
                    </div>
                </div>
            </div>

            {/* Rating distribution + Top colleges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rating distribution */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h2 className="text-sm font-bold text-white mb-5 flex items-center gap-2 uppercase tracking-wider">
                        <BarChart2 className="w-4 h-4 text-amber-400" /> Rating Distribution
                    </h2>
                    {loading ? (
                        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-slate-800 rounded animate-pulse" />)}</div>
                    ) : (
                        <div className="space-y-3">
                            {[...ratingDist].reverse().map((d) => (
                                <div key={d.rating} className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 w-12 shrink-0">
                                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                        <span className="text-xs font-bold text-slate-300">{d.rating}</span>
                                    </div>
                                    <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-amber-500/70 rounded-full transition-all"
                                            style={{ width: `${Math.round((d.count / maxRating) * 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-slate-500 w-8 text-right shrink-0">{d.count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top colleges */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h2 className="text-sm font-bold text-white mb-5 flex items-center gap-2 uppercase tracking-wider">
                        <Trophy className="w-4 h-4 text-amber-400" /> Top Colleges by Reviews
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
        </div>
    );
}
