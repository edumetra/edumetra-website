"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";
import {
    ScrollText, Search, ShieldAlert,
    Clock, Database, Plus, Edit2, Trash2, Settings, UserCog
} from "lucide-react";
import { Loader2 } from "lucide-react";

type ActionType = "CREATE" | "UPDATE" | "DELETE" | "BULK_UPDATE" | "OTHER";

interface AuditLog {
    id: string;
    admin_id: string;
    admin_email: string;
    action_type: ActionType;
    entity_type: string;
    entity_id: string | null;
    details: Record<string, any> | null;
    created_at: string;
}

const ACTION_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
    CREATE: { icon: Plus, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    UPDATE: { icon: Edit2, color: "text-blue-400", bg: "bg-blue-500/10" },
    DELETE: { icon: Trash2, color: "text-red-400", bg: "bg-red-500/10" },
    BULK_UPDATE: { icon: Settings, color: "text-amber-400", bg: "bg-amber-500/10" },
    OTHER: { icon: ShieldAlert, color: "text-slate-400", bg: "bg-slate-500/10" },
};

export default function AuditLogsPage() {
    const supabase = createClient();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [actionFilter, setActionFilter] = useState<ActionType | "ALL">("ALL");

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        // We order by created_at DESC (recent first) and limit to 500 for performance
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from("audit_logs")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(500);

        if (!error && data) {
            setLogs(data as AuditLog[]);
        } else {
            console.error("Failed to load audit logs:", error);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const displayedLogs = useMemo(() => {
        return logs.filter((log) => {
            const matchesSearch = !search
                || log.admin_email.toLowerCase().includes(search.toLowerCase())
                || log.entity_type.toLowerCase().includes(search.toLowerCase())
                || (log.entity_id && log.entity_id.toLowerCase().includes(search.toLowerCase()));

            const matchesAction = actionFilter === "ALL" || log.action_type === actionFilter;

            return matchesSearch && matchesAction;
        });
    }, [logs, search, actionFilter]);

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <ScrollText className="w-8 h-8 text-blue-500" />
                        Audit Logs
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        A chronological record of administrative actions taken across the platform.
                    </p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700 text-sm font-semibold shadow-lg"
                >
                    <Clock className="w-4 h-4" /> Refresh Trail
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by Admin Email, Entity ID, or Table..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                </div>
                <select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value as any)}
                    className="bg-slate-800 border border-slate-700 text-sm text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                    <option value="ALL">All Actions</option>
                    <option value="CREATE">Creates</option>
                    <option value="UPDATE">Updates</option>
                    <option value="BULK_UPDATE">Bulk Updates</option>
                    <option value="DELETE">Deletions</option>
                    <option value="OTHER">Other/System</option>
                </select>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-800/60">
                        <thead className="bg-slate-950/50">
                            <tr>
                                <th className="px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-48">Timestamp</th>
                                <th className="px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Admin</th>
                                <th className="px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-40">Action</th>
                                <th className="px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Entity Target</th>
                                <th className="px-5 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-16 text-center">
                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
                                        <p className="text-slate-400 font-semibold text-sm">Loading audit trail...</p>
                                    </td>
                                </tr>
                            ) : displayedLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-16 text-center">
                                        <ShieldAlert className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                                        <p className="text-slate-400 font-semibold">No logs found</p>
                                        <p className="text-slate-600 text-xs mt-1">Try adjusting your filters or wait for events to occur.</p>
                                    </td>
                                </tr>
                            ) : (
                                displayedLogs.map((log) => {
                                    const cfg = ACTION_CONFIG[log.action_type] || ACTION_CONFIG.OTHER;
                                    const Icon = cfg.icon;
                                    return (
                                        <tr key={log.id} className="hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-slate-300">
                                                    {format(new Date(log.created_at), "MMM d, yyyy")}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    {format(new Date(log.created_at), "HH:mm:ss a")}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                                                        <UserCog className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-200">{log.admin_email}</div>
                                                        <div className="text-xs text-slate-500 font-mono">UID: {log.admin_id.substring(0, 8)}...</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border border-transparent ${cfg.bg} ${cfg.color}`}>
                                                    <Icon className="w-3.5 h-3.5" />
                                                    {log.action_type}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col gap-0.5 max-w-xs">
                                                    <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-300">
                                                        <Database className="w-3.5 h-3.5 text-blue-400" />
                                                        {log.entity_type.toUpperCase()}
                                                    </span>
                                                    {log.entity_id && (
                                                        <span className="text-xs text-slate-500 font-mono truncate" title={log.entity_id}>
                                                            ID: {log.entity_id}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap text-right">
                                                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                                                    Logged
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
