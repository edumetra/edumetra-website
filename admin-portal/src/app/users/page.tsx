"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Shield, ShieldOff, User, Crown, Star, CheckCircle, XCircle } from "lucide-react";

type AccountType = "free" | "premium" | "pro";

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

export default function UsersPage() {
    const supabase = createClient();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);

        // Fetch user profiles with joined auth data via a view or direct table
        const { data: profiles, error: profileErr } = await supabase
            .from("user_profiles")
            .select("*")
            .order("created_at", { ascending: false });

        if (profileErr) {
            setError("Failed to load users. Ensure migration 04 has been run and user_profiles table exists.");
            setLoading(false);
            return;
        }

        // Get Supabase auth user info (email, last login) via admin API
        // For client-side, we use a workaround: list from auth.users with service role isn't possible in browser.
        // Instead we pull what is stored in user_metadata during signup.
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
            setUsers(prev => prev.map(u => u.id === id ? { ...u, is_banned: ban, banned_at: ban ? new Date().toISOString() : null } : u));
        }
        setActionLoading(null);
    };

    const handleAccountTypeChange = async (id: string, type: AccountType) => {
        const { error } = await supabase
            .from("user_profiles")
            .update({ account_type: type } as unknown as never)
            .eq("id", id);

        if (!error) {
            setUsers(prev => prev.map(u => u.id === id ? { ...u, account_type: type } : u));
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-1">Users Management</h1>
                <p className="text-slate-400 text-sm">View all registered users, manage account tiers, and moderate access.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Total Users", value: users.length, color: "text-white", bg: "bg-slate-800 border-slate-700" },
                    { label: "Free", value: users.filter(u => u.account_type === "free").length, color: "text-slate-400", bg: "bg-slate-800 border-slate-700" },
                    { label: "Premium / Pro", value: users.filter(u => u.account_type !== "free").length, color: "text-amber-400", bg: "bg-amber-500/8 border-amber-500/20" },
                    { label: "Banned", value: users.filter(u => u.is_banned).length, color: "text-red-400", bg: "bg-red-500/8 border-red-500/20" },
                ].map(s => (
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

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-800">
                        <thead className="bg-slate-950/50">
                            <tr>
                                {["User", "Phone", "Account Type", "Status", "Joined", "Actions"].map(h => (
                                    <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {loading ? (
                                <tr><td colSpan={6} className="py-12 text-center text-slate-500">Loading users...</td></tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center">
                                        <p className="text-slate-400 font-medium">No users yet</p>
                                        <p className="text-slate-600 text-sm mt-1">Users appear here after signing up on the Colleges Platform.</p>
                                    </td>
                                </tr>
                            ) : users.map(u => (
                                <tr key={u.id} className={`hover:bg-slate-800/40 transition-colors ${u.is_banned ? "opacity-60" : ""}`}>
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
                                    {/* Account Type with inline changer */}
                                    <td className="px-5 py-4">
                                        <select
                                            value={u.account_type}
                                            onChange={e => handleAccountTypeChange(u.id, e.target.value as AccountType)}
                                            className="bg-slate-800 border border-slate-700 text-xs font-semibold rounded-lg px-2 py-1.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500/50 cursor-pointer"
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
