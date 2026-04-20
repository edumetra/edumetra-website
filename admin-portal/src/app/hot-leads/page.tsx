"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Flame, User, Mail, Eye, Clock, RefreshCw } from "lucide-react";

type Lead = {
    identifier: string;
    user_id: string | null;
    email: string | null;
    pricing_views: number;
    last_seen: string;
    created_at: string;
};

const HOT_THRESHOLD = 3;

function formatRelative(ts: string) {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function HotLeadsPage() {
    const supabase = createClient();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"hot" | "all">("hot");
    const [search, setSearch] = useState("");

    const fetchLeads = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("lead_scores")
            .select("*")
            .order("pricing_views", { ascending: false })
            .limit(200);

        if (!error && data) setLeads(data);
        setLoading(false);
    };

    useEffect(() => { fetchLeads(); }, []);

    const visible = leads.filter((l) => {
        if (filter === "hot" && l.pricing_views < HOT_THRESHOLD) return false;
        if (search) {
            const q = search.toLowerCase();
            return (l.email || l.identifier).toLowerCase().includes(q);
        }
        return true;
    });

    const hotCount = leads.filter((l) => l.pricing_views >= HOT_THRESHOLD).length;

    return (
        <div className="p-6 lg:p-10 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-orange-500/10 rounded-xl">
                            <Flame className="w-6 h-6 text-orange-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Hot Leads</h1>
                        {hotCount > 0 && (
                            <span className="px-2.5 py-1 bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold rounded-full">
                                {hotCount} hot
                            </span>
                        )}
                    </div>
                    <p className="text-slate-400 text-sm ml-14">
                        Free users who visited the pricing page {HOT_THRESHOLD}+ times
                    </p>
                </div>
                <button
                    onClick={fetchLeads}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Total Tracked", value: leads.length, color: "text-slate-300" },
                    { label: "Hot Leads (3+)", value: hotCount, color: "text-orange-400" },
                    { label: "Avg Views", value: leads.length ? (leads.reduce((s, l) => s + l.pricing_views, 0) / leads.length).toFixed(1) : "—", color: "text-blue-400" },
                    { label: "Top Views", value: leads[0]?.pricing_views ?? "—", color: "text-red-400" },
                ].map((s) => (
                    <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                        <div className={`text-3xl font-bold mb-1 ${s.color}`}>{s.value}</div>
                        <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
                    {(["hot", "all"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${filter === f
                                ? "bg-orange-600 text-white shadow"
                                : "text-slate-400 hover:text-white"
                            }`}
                        >
                            {f === "hot" ? "🔥 Hot Only" : "All"}
                        </button>
                    ))}
                </div>
                <input
                    type="text"
                    placeholder="Search by email or ID…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 min-w-[200px] bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-orange-500/40"
                />
            </div>

            {/* Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48 text-slate-500">Loading…</div>
                ) : visible.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-500 gap-2">
                        <Flame className="w-10 h-10 opacity-30" />
                        <p className="text-sm">No leads yet. They appear when users visit the pricing page.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px] tracking-wider">
                                <th className="px-5 py-3 text-left">User / Guest</th>
                                <th className="px-4 py-3 text-left">Email</th>
                                <th className="px-4 py-3 text-center">Views</th>
                                <th className="px-4 py-3 text-right">Last Seen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {visible.map((lead) => {
                                const isHot = lead.pricing_views >= HOT_THRESHOLD;
                                return (
                                    <tr key={lead.identifier} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${lead.user_id ? "bg-blue-500/15 text-blue-400" : "bg-slate-800 text-slate-500"}`}>
                                                    <User className="w-3.5 h-3.5" />
                                                </div>
                                                <div>
                                                    <span className="text-slate-300 font-medium truncate max-w-[140px] block">
                                                        {lead.user_id ? "Member" : "Guest"}
                                                    </span>
                                                    <span className="text-slate-600 text-[10px] font-mono truncate max-w-[140px] block">{lead.identifier.slice(0, 16)}…</span>
                                                </div>
                                                {isHot && <Flame className="w-4 h-4 text-orange-400 shrink-0" />}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {lead.email ? (
                                                <div className="flex items-center gap-1.5 text-slate-300">
                                                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                                                    <a href={`mailto:${lead.email}`} className="hover:text-white transition-colors">{lead.email}</a>
                                                </div>
                                            ) : (
                                                <span className="text-slate-600">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${isHot
                                                ? "bg-orange-500/15 border-orange-500/30 text-orange-400"
                                                : "bg-slate-800 border-slate-700 text-slate-400"
                                            }`}>
                                                <Eye className="w-3 h-3" /> {lead.pricing_views}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5 text-slate-500">
                                                <Clock className="w-3.5 h-3.5" />
                                                {formatRelative(lead.last_seen)}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
