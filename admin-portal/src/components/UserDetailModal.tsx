"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
    X, User, Mail, Phone, Calendar, Clock, Star,
    Shield, ShieldOff, Crown, CheckCircle, XCircle,
    BookOpen, MessageSquare, Loader2,
} from "lucide-react";

type AccountType = "free" | "premium" | "pro";

type UserProfile = {
    id: string;
    email: string;
    full_name: string | null;
    phone_number: string | null;
    account_type: AccountType;
    is_banned: boolean;
    banned_at: string | null;
    last_sign_in_at: string | null;
    created_at: string;
};

type ActivityStats = {
    savedColleges: number;
    reviews: number;
    recentReviews: { college_name: string; rating: number; review_text: string; created_at: string }[];
};

type Props = {
    user: UserProfile;
    onClose: () => void;
    onBanChange: (id: string, ban: boolean) => void;
    onTierChange: (id: string, tier: AccountType) => void;
};

const TIER_CONFIG: Record<AccountType, { label: string; color: string; bg: string; border: string; icon: typeof Star }> = {
    free: { label: "Free", color: "text-slate-400", bg: "bg-slate-700/50", border: "border-slate-600", icon: User },
    premium: { label: "Premium", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: Star },
    pro: { label: "Pro", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", icon: Crown },
};

function fmt(d: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function fmtTime(d: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function UserDetailModal({ user, onClose, onBanChange, onTierChange }: Props) {
    const supabase = createClient();
    const [activity, setActivity] = useState<ActivityStats | null>(null);
    const [loadingActivity, setLoadingActivity] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const cfg = TIER_CONFIG[user.account_type ?? "free"];

    useEffect(() => {
        const load = async () => {
            setLoadingActivity(true);

            // Saved colleges (from saved_colleges or wishlists table)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { count: savedCount } = await (supabase.from("saved_colleges") as any)
                .select("id", { count: "exact", head: true })
                .eq("user_id", user.id);

            // Reviews
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { count: reviewCount, data: reviewData } = await (supabase.from("reviews") as any)
                .select("rating, review_text, created_at, colleges(name)", { count: "exact" })
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(3);

            setActivity({
                savedColleges: savedCount ?? 0,
                reviews: reviewCount ?? 0,
                recentReviews: (reviewData ?? []).map((r: { rating: number; review_text: string; created_at: string; colleges?: { name: string } | null }) => ({
                    college_name: r.colleges?.name ?? "Unknown",
                    rating: r.rating,
                    review_text: r.review_text,
                    created_at: r.created_at,
                })),
            });

            setLoadingActivity(false);
        };
        load();
    }, [user.id]); // eslint-disable-line

    const handleBan = async (ban: boolean) => {
        setActionLoading(true);
        await onBanChange(user.id, ban);
        setActionLoading(false);
    };

    const handleTier = async (tier: AccountType) => {
        await onTierChange(user.id, tier);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl my-8">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-slate-700 flex items-center justify-center text-white font-bold text-base">
                            {((user.full_name || user.email || "?")[0]).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold text-white">{user.full_name || "No Name"}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    {/* Status + Tier badges */}
                    <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                            <cfg.icon className="w-3.5 h-3.5" /> {cfg.label}
                        </span>
                        {user.is_banned ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                                <XCircle className="w-3.5 h-3.5" /> Banned {user.banned_at ? `· ${fmt(user.banned_at)}` : ""}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle className="w-3.5 h-3.5" /> Active
                            </span>
                        )}
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: Mail, label: "Email", value: user.email },
                            { icon: Phone, label: "Phone", value: user.phone_number || "—" },
                            { icon: Calendar, label: "Joined", value: fmt(user.created_at) },
                            { icon: Clock, label: "Last Login", value: fmtTime(user.last_sign_in_at) },
                        ].map((f) => (
                            <div key={f.label} className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
                                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                                    <f.icon className="w-3 h-3" /> {f.label}
                                </div>
                                <p className="text-sm text-slate-200 font-medium break-all">{f.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Activity */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Activity</h3>
                        {loadingActivity ? (
                            <div className="flex items-center gap-2 text-slate-600 text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" /> Loading activity...
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex items-center gap-3">
                                        <BookOpen className="w-5 h-5 text-blue-400 shrink-0" />
                                        <div>
                                            <p className="text-lg font-black text-white">{activity?.savedColleges ?? "—"}</p>
                                            <p className="text-xs text-slate-500">Saved Colleges</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex items-center gap-3">
                                        <MessageSquare className="w-5 h-5 text-amber-400 shrink-0" />
                                        <div>
                                            <p className="text-lg font-black text-white">{activity?.reviews ?? "—"}</p>
                                            <p className="text-xs text-slate-500">Reviews Written</p>
                                        </div>
                                    </div>
                                </div>

                                {activity && activity.recentReviews.length > 0 && (
                                    <div>
                                        <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider mb-2">Recent Reviews</p>
                                        <div className="space-y-2">
                                            {activity.recentReviews.map((r, i) => (
                                                <div key={i} className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3 text-sm">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-semibold text-slate-300 text-xs">{r.college_name}</span>
                                                        <div className="flex gap-0.5">
                                                            {[1, 2, 3, 4, 5].map((s) => (
                                                                <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "text-amber-400 fill-amber-400" : "text-slate-700"}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-500 text-xs line-clamp-2">{r.review_text || "—"}</p>
                                                    <p className="text-slate-700 text-xs mt-1">{fmt(r.created_at)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Account Tier upgrade */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Change Account Tier</h3>
                        <div className="flex gap-2">
                            {(["free", "premium", "pro"] as AccountType[]).map((t) => {
                                const c = TIER_CONFIG[t];
                                return (
                                    <button key={t} onClick={() => handleTier(t)}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl border transition-all ${user.account_type === t
                                            ? `${c.bg} ${c.color} ${c.border} ring-2 ring-offset-2 ring-offset-slate-900 ring-red-500/40`
                                            : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                                            }`}>
                                        <c.icon className="w-3.5 h-3.5" /> {c.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                        <button onClick={onClose} className="px-5 py-2 text-slate-400 hover:text-white text-sm font-semibold transition-colors">
                            Close
                        </button>
                        <div className="ml-auto">
                            {user.is_banned ? (
                                <button onClick={() => handleBan(false)} disabled={actionLoading}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/20 rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                                    <Shield className="w-4 h-4" />
                                    {actionLoading ? "..." : "Unban User"}
                                </button>
                            ) : (
                                <button onClick={() => handleBan(true)} disabled={actionLoading}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                                    <ShieldOff className="w-4 h-4" />
                                    {actionLoading ? "..." : "Ban User"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
