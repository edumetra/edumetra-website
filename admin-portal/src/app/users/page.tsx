"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { Shield, ShieldOff, User, Crown, Star, CheckCircle, XCircle, Search, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import UserDetailModal from "@/components/UserDetailModal";

type AccountType = "free" | "premium" | "pro";
type BanFilter = "all" | "active" | "banned";

type UserProfile = {
    id: string;
    email: string;
    full_name: string;
    phone: string;
    account_type: AccountType;
    is_banned: boolean;
    banned_at: string | null;
    last_sign_in_at: string | null;
    created_at: string;
};

const ACCOUNT_TYPE_CONFIG: Record<AccountType, { label: string; icon: typeof Star; color: string; bg: string; border: string }> = {
    free: { label: "Free", icon: User, color: "text-slate-400", bg: "bg-slate-700/50", border: "border-slate-600/40" },
    premium: { label: "Premium", icon: Star, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    pro: { label: "Pro", icon: Crown, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
};

function formatDate(d: string | null) {
    if (!d) return <span className="text-slate-600">—</span>;
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function exportCSV(users: UserProfile[]) {
    const headers = ["Full Name", "Email", "Phone", "Account Type", "Status", "Last Login", "Joined"];
    const rows = users.map((u) => [
        u.full_name || "",
        u.email || "",
        u.phone || "",
        u.account_type,
        u.is_banned ? "Banned" : "Active",
        u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString("en-GB") : "",
        u.created_at ? new Date(u.created_at).toLocaleDateString("en-GB") : "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

export default function UsersPage() {
    const supabase = createClient();
    const router = useRouter();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [accountFilter, setAccountFilter] = useState<AccountType | "all">("all");
    const [banFilter, setBanFilter] = useState<BanFilter>("all");
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return router.push("/login");

        const { data: adminData } = await supabase.from("admins").select("role").eq("id", user.id).single();
        if ((adminData as { role: string } | null)?.role === "mini_admin") {
            return router.push("/");
        }

        const { data: profiles, error: profileErr } = await supabase
            .from("user_profiles")
            .select("*")
            .order("created_at", { ascending: false });

        if (profileErr) {
            setError("Failed to load users. Ensure user_profiles table exists.");
            setLoading(false);
            return;
        }

        setUsers((profiles ?? []) as UserProfile[]);
        setLoading(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchUsers(); }, []);

    const handleBan = async (id: string, ban: boolean) => {
        setActionLoading(id);
        const { error } = await supabase
            .from("user_profiles")
            .update({ is_banned: ban, banned_at: ban ? new Date().toISOString() : null } as unknown as never)
            .eq("id", id);
        if (!error) {
            const update = { is_banned: ban, banned_at: ban ? new Date().toISOString() : null };
            setUsers((prev) => prev.map((u) => u.id === id ? { ...u, ...update } : u));
            setSelectedUser((prev) => prev?.id === id ? { ...prev, ...update } : prev);
        }
        setActionLoading(null);
    };

    const handleAccountTypeChange = async (id: string, type: AccountType) => {
        const { error } = await supabase
            .from("user_profiles")
            .update({ account_type: type } as unknown as never)
            .eq("id", id);
        if (!error) {
            setUsers((prev) => prev.map((u) => u.id === id ? { ...u, account_type: type } : u));
            setSelectedUser((prev) => prev?.id === id ? { ...prev, account_type: type } : prev);
        }
    };

    const filtered = useMemo(() => {
        return users.filter((u) => {
            const q = search.toLowerCase();
            const matchSearch = !q || (u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.includes(q));
            const matchAccount = accountFilter === "all" || u.account_type === accountFilter;
            const matchBan =
                banFilter === "all" ? true :
                    banFilter === "banned" ? u.is_banned :
                        !u.is_banned;
            return matchSearch && matchAccount && matchBan;
        });
    }, [users, search, accountFilter, banFilter]);

    const stats = {
        total: users.length,
        free: users.filter((u) => u.account_type === "free").length,
        paid: users.filter((u) => u.account_type !== "free").length,
        banned: users.filter((u) => u.is_banned).length,
    };

    const ACCOUNT_TABS: { value: AccountType | "all"; label: string }[] = [
        { value: "all", label: "All" },
        { value: "free", label: "Free" },
        { value: "premium", label: "Premium" },
        { value: "pro", label: "Pro" },
    ];

    return (
        <>
            <div className="p-6 md:p-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-1">Users Management</h1>
                    <p className="text-slate-400 text-sm">View all registered users, manage account tiers, and moderate access.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: "Total Users", value: stats.total, color: "text-white", bg: "bg-slate-800 border-slate-700" },
                        { label: "Free", value: stats.free, color: "text-slate-400", bg: "bg-slate-800 border-slate-700" },
                        { label: "Premium / Pro", value: stats.paid, color: "text-amber-400", bg: "bg-amber-500/8 border-amber-500/20" },
                        { label: "Banned", value: stats.banned, color: "text-red-400", bg: "bg-red-500/8 border-red-500/20" },
                    ].map((s) => (
                        <div key={s.label} className={`p-4 rounded-xl border ${s.bg}`}>
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
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                        />
                    </div>

                    {/* Account type tabs */}
                    <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1">
                        {ACCOUNT_TABS.map((t) => (
                            <button
                                key={t.value}
                                onClick={() => setAccountFilter(t.value)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${accountFilter === t.value ? "bg-red-600 text-white" : "text-slate-400 hover:text-white"
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Ban filter */}
                    <select
                        value={banFilter}
                        onChange={(e) => setBanFilter(e.target.value as BanFilter)}
                        className="bg-slate-900 border border-slate-700 text-sm text-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active Only</option>
                        <option value="banned">Banned Only</option>
                    </select>

                    {/* CSV Export */}
                    <button
                        onClick={() => exportCSV(filtered)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-800">
                            <thead className="bg-slate-950/50">
                                <tr>
                                    {["User", "Phone", "Account Type", "Status", "Last Login", "Joined", "Actions"].map((h) => (
                                        <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {loading ? (
                                    <tr><td colSpan={7} className="py-12 text-center text-slate-500">Loading users...</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center">
                                            <p className="text-slate-400 font-medium">No users found</p>
                                            <p className="text-slate-600 text-sm mt-1">Try adjusting your search or filters.</p>
                                        </td>
                                    </tr>
                                ) : filtered.map((u) => {
                                    const cfg = ACCOUNT_TYPE_CONFIG[u.account_type ?? "free"];
                                    return (
                                        <tr key={u.id} onClick={() => setSelectedUser(u)} className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${u.is_banned ? "opacity-60" : ""}`}>
                                            {/* User */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                        {(u.full_name || u.email || "?").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-200">{u.full_name || "—"}</div>
                                                        <div className="text-xs text-slate-500">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Phone */}
                                            <td className="px-5 py-4 text-sm text-slate-400">{u.phone || <span className="text-slate-600">—</span>}</td>
                                            {/* Account Type */}
                                            <td className="px-5 py-4">
                                                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-semibold ${cfg.color} ${cfg.bg} ${cfg.border} mb-1`}>
                                                    <cfg.icon className="w-3 h-3" />
                                                    {cfg.label}
                                                </div>
                                                <select
                                                    value={u.account_type}
                                                    onChange={(e) => handleAccountTypeChange(u.id, e.target.value as AccountType)}
                                                    className="block mt-1 bg-slate-800 border border-slate-700 text-xs font-semibold rounded-lg px-2 py-1 text-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500/50 cursor-pointer"
                                                >
                                                    <option value="free">Free</option>
                                                    <option value="premium">Premium</option>
                                                    <option value="pro">Pro</option>
                                                </select>
                                            </td>
                                            {/* Status */}
                                            <td className="px-5 py-4">
                                                {u.is_banned ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                                                        <XCircle className="w-3 h-3" /> Banned
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        <CheckCircle className="w-3 h-3" /> Active
                                                    </span>
                                                )}
                                            </td>
                                            {/* Last Login */}
                                            <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">{formatDate(u.last_sign_in_at)}</td>
                                            {/* Joined */}
                                            <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">{formatDate(u.created_at)}</td>
                                            {/* Actions */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                {u.is_banned ? (
                                                    <button
                                                        onClick={() => handleBan(u.id, false)}
                                                        disabled={actionLoading === u.id}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        <Shield className="w-3.5 h-3.5" />
                                                        {actionLoading === u.id ? "..." : "Unban"}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleBan(u.id, true)}
                                                        disabled={actionLoading === u.id}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        <ShieldOff className="w-3.5 h-3.5" />
                                                        {actionLoading === u.id ? "..." : "Ban"}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {/* Footer count */}
                    {!loading && (
                        <div className="px-5 py-3 border-t border-slate-800 text-xs text-slate-500">
                            Showing {filtered.length} of {users.length} users
                        </div>
                    )}
                </div>
            </div>

            {
                selectedUser && (
                    <UserDetailModal
                        user={selectedUser}
                        onClose={() => setSelectedUser(null)}
                        onBanChange={handleBan}
                        onTierChange={handleAccountTypeChange}
                    />
                )
            }
        </>
    );
}
