"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Star, Eye, EyeOff, Clock, ChevronDown } from "lucide-react";

type ModerationStatus = "visible" | "hidden" | "pending";

type Review = {
    id: string;
    college_id: string;
    user_name: string | null;
    rating: number;
    title: string | null;
    review_text: string | null;
    created_at: string;
    moderation_status: ModerationStatus;
    colleges: { name: string } | null;
};

const STATUS_CONFIG: Record<ModerationStatus, { label: string; dot: string; bg: string; text: string; border: string; icon: typeof Eye }> = {
    visible: { label: "Publicly Visible", dot: "bg-emerald-400", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/25", icon: Eye },
    hidden: { label: "Hidden", dot: "bg-slate-500", bg: "bg-slate-700/50", text: "text-slate-400", border: "border-slate-600/40", icon: EyeOff },
    pending: { label: "Yet to be Processed", dot: "bg-amber-400", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/25", icon: Clock },
};

function StatusBadge({ status }: { status: ModerationStatus }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? "text-amber-400 fill-amber-400" : "text-slate-700"}`} />
            ))}
            <span className="ml-1 text-xs text-slate-400">{rating}/5</span>
        </div>
    );
}

function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function ReviewsPage() {
    const supabase = createClient();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [filter, setFilter] = useState<ModerationStatus | "all">("all");

    const fetchReviews = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .schema("public")
            .from("reviews")
            .select("*, colleges(name)")
            .order("created_at", { ascending: false });

        if (!error) setReviews((data ?? []) as unknown as Review[]);
        setLoading(false);
    };

    useEffect(() => { fetchReviews(); }, []);

    const handleStatusChange = async (id: string, status: ModerationStatus) => {
        setActionLoading(id);
        const { error } = await supabase
            .schema("public")
            .from("reviews")
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .update({ moderation_status: status } as any)
            .eq("id", id);

        if (!error) {
            setReviews(prev => prev.map(r => r.id === id ? { ...r, moderation_status: status } : r));
        }
        setActionLoading(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this review? This cannot be undone.")) return;
        setActionLoading(id);
        await supabase.schema("public").from("reviews").delete().eq("id", id);
        setReviews(prev => prev.filter(r => r.id !== id));
        setActionLoading(null);
    };

    const filtered = filter === "all" ? reviews : reviews.filter(r => (r.moderation_status ?? "pending") === filter);

    const counts = {
        all: reviews.length,
        pending: reviews.filter(r => (r.moderation_status ?? "pending") === "pending").length,
        visible: reviews.filter(r => r.moderation_status === "visible").length,
        hidden: reviews.filter(r => r.moderation_status === "hidden").length,
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-1">Review Moderation</h1>
                <p className="text-slate-400 text-sm">Review all user-submitted content and control what is publicly visible.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { key: "all", label: "Total", color: "text-white", bg: "bg-slate-800 border-slate-700" },
                    { key: "pending", label: "Pending", color: "text-amber-400", bg: "bg-amber-500/8 border-amber-500/20" },
                    { key: "visible", label: "Visible", color: "text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/20" },
                    { key: "hidden", label: "Hidden", color: "text-slate-400", bg: "bg-slate-800 border-slate-700" },
                ].map(s => (
                    <button
                        key={s.key}
                        onClick={() => setFilter(s.key as any)}
                        className={`p-4 rounded-xl border text-left transition-all ${s.bg} ${filter === s.key ? "ring-2 ring-red-500/40" : "hover:opacity-80"}`}
                    >
                        <div className={`text-2xl font-bold ${s.color}`}>{counts[s.key as keyof typeof counts]}</div>
                        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">{s.label}</div>
                    </button>
                ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-800">
                        <thead className="bg-slate-950/50">
                            <tr>
                                {["Status", "College", "Reviewer", "Rating", "Review", "Date", "Actions"].map(h => (
                                    <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {loading ? (
                                <tr><td colSpan={7} className="py-12 text-center text-slate-500">Loading reviews...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center">
                                        <p className="text-slate-400 font-medium">No reviews found</p>
                                    </td>
                                </tr>
                            ) : filtered.map(review => {
                                const status = (review.moderation_status ?? "pending") as ModerationStatus;
                                return (
                                    <tr key={review.id} className="hover:bg-slate-800/40 transition-colors">
                                        {/* Status */}
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <StatusBadge status={status} />
                                        </td>
                                        {/* College */}
                                        <td className="px-5 py-4 text-sm text-slate-300 font-medium whitespace-nowrap">
                                            {review.colleges?.name || <span className="text-slate-600">Unknown</span>}
                                        </td>
                                        {/* Reviewer */}
                                        <td className="px-5 py-4 text-sm text-slate-400 whitespace-nowrap">
                                            {review.user_name || <span className="text-slate-600">Anonymous</span>}
                                        </td>
                                        {/* Rating */}
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <StarRating rating={review.rating} />
                                        </td>
                                        {/* Review text */}
                                        <td className="px-5 py-4 max-w-xs">
                                            {review.title && (
                                                <div className="text-sm font-semibold text-slate-200 truncate">{review.title}</div>
                                            )}
                                            <div className="text-xs text-slate-500 truncate mt-0.5">{review.review_text}</div>
                                        </td>
                                        {/* Date */}
                                        <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                                            {formatDate(review.created_at)}
                                        </td>
                                        {/* Actions */}
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {/* Status dropdown */}
                                                <select
                                                    value={status}
                                                    disabled={actionLoading === review.id}
                                                    onChange={e => handleStatusChange(review.id, e.target.value as ModerationStatus)}
                                                    className="bg-slate-800 border border-slate-700 text-xs font-semibold rounded-lg px-2 py-1.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500/50 cursor-pointer disabled:opacity-50"
                                                >
                                                    <option value="pending">Yet to be Processed</option>
                                                    <option value="visible">Publicly Visible</option>
                                                    <option value="hidden">Hidden</option>
                                                </select>
                                                <button
                                                    onClick={() => handleDelete(review.id)}
                                                    disabled={actionLoading === review.id}
                                                    className="px-2.5 py-1.5 text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    {actionLoading === review.id ? "..." : "Delete"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
