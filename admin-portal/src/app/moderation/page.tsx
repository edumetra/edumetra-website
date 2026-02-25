"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Star, Flag, Eye, EyeOff, AlertTriangle, Clock, Shield } from "lucide-react";

type Review = {
    id: string;
    college_id: string;
    user_id: string;
    user_name: string | null;
    rating: number;
    title: string | null;
    review_text: string | null;
    created_at: string;
    moderation_status: "visible" | "hidden" | "pending";
    helpful_count: number;
    colleges: { name: string } | null;
};

function isSpam(review: Review, allReviews: Review[]): string[] {
    const flags: string[] = [];
    if ((review.review_text?.length ?? 0) < 20) flags.push("Very short review");
    const userReviews = allReviews.filter(r => r.user_id === review.user_id);
    const last24h = userReviews.filter(r => {
        const diff = Date.now() - new Date(r.created_at).getTime();
        return diff < 24 * 60 * 60 * 1000;
    });
    if (last24h.length >= 3) flags.push("3+ reviews in 24 hrs");
    if ((review.helpful_count ?? 0) < -3) flags.push("Strongly downvoted");
    return flags;
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? "text-amber-400 fill-amber-400" : "text-slate-700"}`} />
            ))}
        </div>
    );
}

export default function ModerationPage() {
    const supabase = createClient();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"pending" | "all" | "spam">("pending");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => { fetchReviews(); }, []);

    const fetchReviews = async () => {
        setLoading(true);
        const { data } = await supabase
            .schema("public")
            .from("reviews")
            .select("*, colleges(name)")
            .order("created_at", { ascending: false });
        setReviews((data ?? []) as unknown as Review[]);
        setLoading(false);
    };

    const setStatus = async (id: string, status: "visible" | "hidden" | "pending") => {
        setActionLoading(id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await supabase.schema("public").from("reviews").update({ moderation_status: status } as any).eq("id", id);
        setReviews(prev => prev.map(r => r.id === id ? { ...r, moderation_status: status } : r));
        setActionLoading(null);
    };

    const displayed = reviews.filter(r => {
        if (filter === "pending") return r.moderation_status === "pending";
        if (filter === "spam") return isSpam(r, reviews).length > 0;
        return true;
    });

    const pendingCount = reviews.filter(r => r.moderation_status === "pending").length;
    const spamCount = reviews.filter(r => isSpam(r, reviews).length > 0).length;

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                    <Shield className="w-7 h-7 text-red-400" /> Moderation Queue
                </h1>
                <p className="text-slate-400 text-sm">Review pending submissions and manage flagged content.</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { key: "pending", label: "Pending", count: pendingCount, color: "text-amber-400", icon: Clock },
                    { key: "spam", label: "Spam Suspects", count: spamCount, color: "text-red-400", icon: AlertTriangle },
                    { key: "all", label: "Total Reviews", count: reviews.length, color: "text-white", icon: Eye },
                ].map(s => (
                    <button
                        key={s.key}
                        onClick={() => setFilter(s.key as any)}
                        className={`p-5 rounded-xl border text-left transition-all ${filter === s.key ? "border-red-500/40 ring-2 ring-red-500/20 bg-slate-800" : "border-slate-800 bg-slate-900 hover:bg-slate-800/70"}`}
                    >
                        <s.icon className={`w-5 h-5 mb-2 ${s.color}`} />
                        <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
                        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">{s.label}</div>
                    </button>
                ))}
            </div>

            {/* Review cards */}
            <div className="space-y-4">
                {loading ? (
                    [...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-900 rounded-xl animate-pulse" />)
                ) : displayed.length === 0 ? (
                    <div className="text-center py-16 text-slate-500">
                        <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p>No reviews in this category.</p>
                    </div>
                ) : displayed.map(review => {
                    const spamFlags = isSpam(review, reviews);
                    return (
                        <div key={review.id} className={`bg-slate-900 border rounded-xl p-5 ${spamFlags.length > 0 ? "border-red-500/30" : "border-slate-800"}`}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <span className="text-white font-bold text-sm">{review.colleges?.name || "Unknown College"}</span>
                                        <span className="text-slate-600">·</span>
                                        <span className="text-slate-400 text-xs">{review.user_name || "Anonymous"}</span>
                                        <span className="text-slate-600">·</span>
                                        <StarRating rating={review.rating} />
                                        {/* Spam flags */}
                                        {spamFlags.map(flag => (
                                            <span key={flag} className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-lg">
                                                <Flag className="w-3 h-3" />{flag}
                                            </span>
                                        ))}
                                        {/* Status */}
                                        <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${review.moderation_status === "visible" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                            review.moderation_status === "pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                                "bg-slate-700 text-slate-400 border border-slate-600"
                                            }`}>
                                            {review.moderation_status}
                                        </span>
                                    </div>
                                    {review.title && <p className="text-slate-200 font-semibold text-sm mb-1">{review.title}</p>}
                                    <p className="text-slate-400 text-sm line-clamp-2">{review.review_text}</p>
                                    <p className="text-slate-600 text-xs mt-2">{new Date(review.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 shrink-0">
                                    <button
                                        disabled={review.moderation_status === "visible" || actionLoading === review.id}
                                        onClick={() => setStatus(review.id, "visible")}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-colors"
                                    >
                                        <Eye className="w-3 h-3" /> Approve
                                    </button>
                                    <button
                                        disabled={review.moderation_status === "hidden" || actionLoading === review.id}
                                        onClick={() => setStatus(review.id, "hidden")}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-colors"
                                    >
                                        <EyeOff className="w-3 h-3" /> Hide
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
