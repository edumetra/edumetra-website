import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import {
    GraduationCap,
    Users,
    MessageSquare,
    Clock,
    Plus,
    Shield,
    BarChart2,
    Briefcase,
    Eye,
    TrendingUp,
    FileEdit,
    ArrowRight,
} from "lucide-react";

export default async function AdminDashboard() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const [
        collegesRes,
        reviewsRes,
        pendingRes,
        usersRes,
        recentCollegesRes,
    ] = await Promise.all([
        supabase.from("colleges").select("id, visibility", { count: "exact" }),
        supabase.from("reviews").select("id", { count: "exact", head: true }),
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("moderation_status", "pending"),
        supabase.from("user_profiles").select("id", { count: "exact", head: true }),
        supabase.from("colleges").select("id, name, visibility, location_city, location_state, created_at").order("created_at", { ascending: false }).limit(6),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const colleges = (collegesRes.data as any[]) ?? [];
    const publicCount = colleges.filter((c) => c.visibility === "public").length;
    const draftCount = colleges.filter((c) => c.visibility === "draft" || !c.visibility).length;
    const hiddenCount = colleges.filter((c) => c.visibility === "hidden").length;
    const totalColleges = collegesRes.count ?? 0;
    const totalReviews = reviewsRes.count ?? 0;
    const pendingReviews = pendingRes.count ?? 0;
    const totalUsers = usersRes.count ?? 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recentColleges = (recentCollegesRes.data as any[]) ?? [];

    const visibilityBar = totalColleges > 0 ? [
        { label: "Public", value: publicCount, pct: Math.round((publicCount / totalColleges) * 100), color: "bg-emerald-500" },
        { label: "Draft", value: draftCount, pct: Math.round((draftCount / totalColleges) * 100), color: "bg-amber-500" },
        { label: "Hidden", value: hiddenCount, pct: Math.round((hiddenCount / totalColleges) * 100), color: "bg-slate-600" },
    ] : [];

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
                    <p className="text-slate-400 text-sm">Overview of platform activity. Head to <Link href="/colleges" className="text-red-400 hover:underline font-medium">Colleges</Link> to manage institutions.</p>
                </div>
                <Link
                    href="/colleges/new"
                    className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-500 transition-all font-medium shadow-lg shadow-red-900/20"
                >
                    <Plus className="w-4 h-4" />
                    Add College
                </Link>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Total Colleges", value: totalColleges, icon: GraduationCap, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", href: "/colleges" },
                    { label: "Total Reviews", value: totalReviews, icon: MessageSquare, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", href: "/reviews" },
                    { label: "Pending Review", value: pendingReviews, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", href: "/moderation" },
                    { label: "Registered Users", value: totalUsers, icon: Users, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", href: "/users" },
                ].map((stat) => (
                    <Link key={stat.label} href={stat.href} className={`p-5 rounded-xl border ${stat.bg} hover:brightness-110 transition-all block`}>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                        <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visibility Breakdown */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-slate-400" />
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Visibility</h2>
                        </div>
                        <Link href="/colleges" className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                            Manage <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {totalColleges === 0 ? (
                        <p className="text-slate-600 text-sm">No colleges yet.</p>
                    ) : (
                        <>
                            <div className="flex h-3 rounded-full overflow-hidden mb-4 bg-slate-800">
                                {visibilityBar.map((v) => (
                                    <div key={v.label} className={`${v.color} transition-all`} style={{ width: `${v.pct}%` }} title={`${v.label}: ${v.value}`} />
                                ))}
                            </div>
                            <div className="space-y-2">
                                {visibilityBar.map((v) => (
                                    <div key={v.label} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${v.color}`} />
                                            <span className="text-xs text-slate-400">{v.label}</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-300">{v.value} <span className="text-slate-600 font-normal">({v.pct}%)</span></span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <TrendingUp className="w-4 h-4 text-slate-400" />
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Quick Actions</h2>
                    </div>
                    <div className="space-y-2">
                        {[
                            { href: "/colleges", label: "Manage Colleges", icon: GraduationCap, color: "text-red-400 bg-red-500/10 border-red-500/20 hover:bg-red-500/20" },
                            { href: "/colleges/new", label: "Add New College", icon: Plus, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20" },
                            { href: "/moderation", label: `Moderation Queue${pendingReviews > 0 ? ` (${pendingReviews})` : ""}`, icon: Shield, color: "text-amber-400 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20" },
                            { href: "/users", label: "Manage Users", icon: Users, color: "text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20" },
                            { href: "/analytics", label: "View Analytics", icon: BarChart2, color: "text-purple-400 bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20" },
                            { href: "/careers", label: "Career Applications", icon: Briefcase, color: "text-slate-400 bg-slate-800 border-slate-700 hover:bg-slate-700" },
                        ].map((action) => (
                            <Link
                                key={action.href}
                                href={action.href}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${action.color}`}
                            >
                                <action.icon className="w-4 h-4 shrink-0" />
                                {action.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent Colleges */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <FileEdit className="w-4 h-4 text-slate-400" />
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recently Added</h2>
                        </div>
                        <Link href="/colleges" className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                            View all <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {recentColleges.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-slate-600 text-sm">No colleges yet.</p>
                            <Link href="/colleges/new" className="text-red-400 hover:text-red-300 text-xs mt-2 inline-block">Add first college →</Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentColleges.map((college) => (
                                <Link key={college.id} href={`/colleges/${college.id}`} className="flex items-center gap-3 group">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/20 flex items-center justify-center shrink-0">
                                        <GraduationCap className="w-4 h-4 text-red-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-200 group-hover:text-red-400 transition-colors truncate">
                                            {college.name}
                                        </p>
                                        <p className="text-xs text-slate-600 truncate">
                                            {college.location_city}, {college.location_state}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${college.visibility === "public" ? "bg-emerald-500/10 text-emerald-400" :
                                            college.visibility === "hidden" ? "bg-slate-700 text-slate-400" :
                                                "bg-amber-500/10 text-amber-400"
                                        }`}>
                                        {college.visibility ?? "draft"}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
