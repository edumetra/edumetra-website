"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import {
    Briefcase,
    Search,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    Download,
    Loader2,
} from "lucide-react";

type AppStatus = "pending" | "under_review" | "accepted" | "rejected";

type CareerApplication = {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    role: string | null;
    position: string | null;
    message: string | null;
    resume_url: string | null;
    status: AppStatus;
    created_at: string;
};

const STATUS_CONFIG: Record<AppStatus, { label: string; bg: string; text: string; border: string; icon: React.ElementType }> = {
    pending: { label: "Pending", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", icon: Clock },
    under_review: { label: "Under Review", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", icon: Eye },
    accepted: { label: "Accepted", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", icon: CheckCircle },
    rejected: { label: "Rejected", bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", icon: XCircle },
};

function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function exportCSV(apps: CareerApplication[]) {
    const headers = ["Full Name", "Email", "Phone", "Role/Position", "Status", "Applied On"];
    const rows = apps.map((a) => [
        a.full_name || "",
        a.email || "",
        a.phone || "",
        a.role || a.position || "",
        a.status,
        a.created_at ? new Date(a.created_at).toLocaleDateString("en-GB") : "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `career-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

export default function CareersPage() {
    const supabase = createClient();
    const [apps, setApps] = useState<CareerApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<AppStatus | "all">("all");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<string | null>(null);

    const fetchApps = async () => {
        setLoading(true);
        setError(null);

        const { data, error: err } = await supabase
            .from("career_applications")
            .select("*")
            .order("created_at", { ascending: false });

        if (err) {
            setError("Could not fetch career applications. Ensure the career_applications table exists.");
        } else {
            setApps((data ?? []) as CareerApplication[]);
        }
        setLoading(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchApps(); }, []);

    const handleStatusChange = async (id: string, status: AppStatus) => {
        setActionLoading(id);
        const { error: err } = await supabase
            .from("career_applications")
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .update({ status } as unknown as never)
            .eq("id", id);
        if (!err) {
            setApps((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
        }
        setActionLoading(null);
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return apps.filter((a) => {
            const matchStatus = statusFilter === "all" || a.status === statusFilter;
            const matchSearch =
                !q ||
                a.full_name?.toLowerCase().includes(q) ||
                a.email?.toLowerCase().includes(q) ||
                a.role?.toLowerCase().includes(q) ||
                a.position?.toLowerCase().includes(q);
            return matchStatus && matchSearch;
        });
    }, [apps, search, statusFilter]);

    const counts = {
        total: apps.length,
        pending: apps.filter((a) => a.status === "pending").length,
        under_review: apps.filter((a) => a.status === "under_review").length,
        accepted: apps.filter((a) => a.status === "accepted").length,
        rejected: apps.filter((a) => a.status === "rejected").length,
    };

    const STATUS_TABS: { value: AppStatus | "all"; label: string }[] = [
        { value: "all", label: "All" },
        { value: "pending", label: "Pending" },
        { value: "under_review", label: "Under Review" },
        { value: "accepted", label: "Accepted" },
        { value: "rejected", label: "Rejected" },
    ];

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                        <Briefcase className="w-7 h-7 text-red-400" /> Career Applications
                    </h1>
                    <p className="text-slate-400 text-sm">Review all applications submitted via the careers form.</p>
                </div>
                <button
                    onClick={() => exportCSV(filtered)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-sm font-medium transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {[
                    { key: "total", label: "Total", value: counts.total, color: "text-white", bg: "bg-slate-800 border-slate-700" },
                    { key: "pending", label: "Pending", value: counts.pending, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                    { key: "under_review", label: "Under Review", value: counts.under_review, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                    { key: "accepted", label: "Accepted", value: counts.accepted, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                    { key: "rejected", label: "Rejected", value: counts.rejected, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
                ].map((s) => (
                    <div key={s.key} className={`p-4 rounded-xl border ${s.bg}`}>
                        <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">{s.label}</div>
                    </div>
                ))}
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or role…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                    />
                </div>
                <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1 flex-wrap">
                    {STATUS_TABS.map((t) => (
                        <button
                            key={t.value}
                            onClick={() => setStatusFilter(t.value)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${statusFilter === t.value ? "bg-red-600 text-white" : "text-slate-400 hover:text-white"
                                }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Applications table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-800">
                        <thead className="bg-slate-950/50">
                            <tr>
                                {["Applicant", "Role / Position", "Status", "Applied On", "Actions"].map((h) => (
                                    <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center">
                                        <Loader2 className="w-6 h-6 text-slate-500 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center">
                                        <Briefcase className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                                        <p className="text-slate-400 font-medium">No applications found</p>
                                        <p className="text-slate-600 text-sm mt-1">Applications submitted through the careers form will appear here.</p>
                                    </td>
                                </tr>
                            ) : filtered.map((app) => {
                                const cfg = STATUS_CONFIG[app.status ?? "pending"];
                                const StatusIcon = cfg.icon;
                                return (
                                    <>
                                        <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                                            {/* Applicant */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600/20 to-slate-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                        {(app.full_name || app.email || "?").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-200">{app.full_name || "—"}</div>
                                                        <div className="text-xs text-slate-500">{app.email}</div>
                                                        {app.phone && <div className="text-xs text-slate-600">{app.phone}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Role */}
                                            <td className="px-5 py-4">
                                                <span className="text-sm text-slate-300 font-medium">
                                                    {app.role || app.position || <span className="text-slate-600">—</span>}
                                                </span>
                                            </td>
                                            {/* Status badge */}
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            {/* Date */}
                                            <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                                                {formatDate(app.created_at)}
                                            </td>
                                            {/* Actions */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={app.status ?? "pending"}
                                                        disabled={actionLoading === app.id}
                                                        onChange={(e) => handleStatusChange(app.id, e.target.value as AppStatus)}
                                                        className="bg-slate-800 border border-slate-700 text-xs font-semibold rounded-lg px-2 py-1.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500/50 cursor-pointer disabled:opacity-50"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="under_review">Under Review</option>
                                                        <option value="accepted">Accepted</option>
                                                        <option value="rejected">Rejected</option>
                                                    </select>
                                                    {app.resume_url && (
                                                        <a
                                                            href={app.resume_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-colors"
                                                        >
                                                            <Eye className="w-3 h-3" /> Resume
                                                        </a>
                                                    )}
                                                    {app.message && (
                                                        <button
                                                            onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                                                            className="text-xs text-slate-500 hover:text-slate-300 underline transition-colors"
                                                        >
                                                            {expanded === app.id ? "Less" : "Message"}
                                                        </button>
                                                    )}
                                                    {actionLoading === app.id && (
                                                        <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        {/* Expanded message row */}
                                        {expanded === app.id && app.message && (
                                            <tr key={`${app.id}-msg`} className="bg-slate-900/80">
                                                <td colSpan={5} className="px-5 py-4">
                                                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Cover Letter / Message</p>
                                                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{app.message}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {!loading && (
                    <div className="px-5 py-3 border-t border-slate-800 text-xs text-slate-500">
                        {filtered.length} application{filtered.length !== 1 ? "s" : ""}
                    </div>
                )}
            </div>
        </div>
    );
}
