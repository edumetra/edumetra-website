"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { Star, Eye, EyeOff, Clock, Search, ChevronLeft, ChevronRight, MessageSquare, CheckCircle2 } from "lucide-react";
import ReviewReplyModal from "@/components/ReviewReplyModal";

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
    admin_reply: string | null;
    admin_reply_at: string | null;
    colleges: { name: string } | null;
};

const STATUS_CONFIG: Record<ModerationStatus, { label: string; dot: string; bg: string; text: string; border: string; icon: typeof Eye }> = {
    visible: { label: "Publicly Visible", dot: "bg-emerald-400", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/25", icon: Eye },
    hidden: { label: "Hidden", dot: "bg-slate-500", bg: "bg-slate-700/50", text: "text-slate-400", border: "border-slate-600/40", icon: EyeOff },
    pending: { label: "Pending", dot: "bg-amber-400", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/25", icon: Clock },
};

const PAGE_SIZE = 20;

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
            {[1, 2, 3, 4, 5].map((i) => (
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
    const [ratingFilter, setRatingFilter] = useState<number | 0>(0); // 0 = all
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [replyTarget, setReplyTarget] = useState<Review | null>(null);

    const fetchReviews = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("reviews")
            .select("*, colleges(name)")
            .order("created_at", { ascending: false });
        if (!error) setReviews((data ?? []) as unknown as Review[]);
        setLoading(false);
    };

    const handleReplySaved = (id: string, reply: string | null) => {
        setReviews((prev) => prev.map((r) => r.id === id
            ? { ...r, admin_reply: reply, admin_reply_at: reply ? new Date().toISOString() : null }
            : r
        ));
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchReviews(); }, []);

    const handleStatusChange = async (id: string, status: ModerationStatus) => {
        setActionLoading(id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await supabase.from("reviews").update({ moderation_status: status } as unknown as never).eq("id", id);
        setReviews((prev) => prev.map((r) => r.id === id ? { ...r, moderation_status: status } : r));
        setActionLoading(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this review? This cannot be undone.")) return;
        setActionLoading(id);
        await supabase.from("reviews").delete().eq("id", id);
        setReviews((prev) => prev.filter((r) => r.id !== id));
        setActionLoading(null);
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return reviews.filter((r) => {
            const matchStatus = filter === "all" || (r.moderation_status ?? "pending") === filter;
            const matchRating = ratingFilter === 0 || Math.round(r.rating) === ratingFilter;
            const matchSearch = !q || r.colleges?.name?.toLowerCase().includes(q) || r.user_name?.toLowerCase().includes(q) || r.review_text?.toLowerCase().includes(q);
            return matchStatus && matchRating && matchSearch;
        });
    }, [reviews, filter, ratingFilter, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Reset page when filters change
    useEffect(() => setPage(1), [filter, ratingFilter, search]);

    const counts = {
        all: reviews.length,
        pending: reviews.filter((r) => (r.moderation_status ?? "pending") === "pending").length,
        visible: reviews.filter((r) => r.moderation_status === "visible").length,
        hidden: reviews.filter((r) => r.moderation_status === "hidden").length,
    };

    return (
        <>
            <div className="p-6 md:p-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-1">Review Moderation</h1>
                    <p className="text-slate-400 text-sm">Review all user-submitted content and control what is publicly visible.</p>
                </div>

                {/* Stats / filter tabs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {(["all", "pending", "visible", "hidden"] as const).map((key) => {
                        const colors: Record<string, string> = {
                            all: "text-white bg-slate-800 border-slate-700",
                            pending: "text-amber-400 bg-amber-500/8 border-amber-500/20",
                            visible: "text-emerald-400 bg-emerald-500/8 border-emerald-500/20",
                            hidden: "text-slate-400 bg-slate-800 border-slate-700",
                        };
                        const labels = { all: "Total", pending: "Pending", visible: "Visible", hidden: "Hidden" };
                        return (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={`p-4 rounded-xl border text-left transition-all ${colors[key]} ${filter === key ? "ring-2 ring-red-500/40" : "hover:opacity-80"}`}
                            >
                                <div className="text-2xl font-bold">{counts[key]}</div>
                                <div className="text-xs font-semibold uppercase tracking-wider mt-0.5 text-slate-500">{labels[key]}</div>
                            </button>
                        );
                    })}
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by college, reviewer, or content…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                        />
                    </div>
                    {/* Rating filter */}
                    <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1">
                        <button
                            onClick={() => setRatingFilter(0)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${ratingFilter === 0 ? "bg-red-600 text-white" : "text-slate-400 hover:text-white"}`}
                        >
                            All ★
                        </button>
                        {[1, 2, 3, 4, 5].map((r) => (
                            <button
                                key={r}
                                onClick={() => setRatingFilter(r)}
                                className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all ${ratingFilter === r ? "bg-amber-500 text-white" : "text-slate-400 hover:text-white"}`}
                            >
                                {r}★
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-800">
                            <thead className="bg-slate-950/50">
                                <tr>
                                    {["Status", "College", "Reviewer", "Rating", "Review", "Date", "Reply", "Actions"].map((h) => (
                                        <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {loading ? (
                                    <tr><td colSpan={8} className="py-12 text-center text-slate-500">Loading reviews...</td></tr>
                                ) : paginated.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center">
                                            <p className="text-slate-400 font-medium">No reviews found</p>
                                        </td>
                                    </tr>
                                ) : paginated.map((review) => {
                                    const status = (review.moderation_status ?? "pending") as ModerationStatus;
                                    return (
                                        <tr key={review.id} className="hover:bg-slate-800/40 transition-colors">
                                            <td className="px-5 py-4 whitespace-nowrap"><StatusBadge status={status} /></td>
                                            <td className="px-5 py-4 text-sm text-slate-300 font-medium whitespace-nowrap">
                                                {review.colleges?.name || <span className="text-slate-600">Unknown</span>}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-400 whitespace-nowrap">
                                                {review.user_name || <span className="text-slate-600">Anonymous</span>}
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap"><StarRating rating={review.rating} /></td>
                                            <td className="px-5 py-4 max-w-xs">
                                                {review.title && <div className="text-sm font-semibold text-slate-200 truncate">{review.title}</div>}
                                                <div className="text-xs text-slate-500 truncate mt-0.5">{review.review_text}</div>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">{formatDate(review.created_at)}</td>
                                            {/* Reply column */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => setReplyTarget(review)}
                                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${review.admin_reply
                                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                                                        : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700"
                                                        }`}
                                                >
                                                    {review.admin_reply
                                                        ? <><CheckCircle2 className="w-3 h-3" /> Replied</> : <><MessageSquare className="w-3 h-3" /> Reply</>}
                                                </button>
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={status}
                                                        disabled={actionLoading === review.id}
                                                        onChange={(e) => handleStatusChange(review.id, e.target.value as ModerationStatus)}
                                                        className="bg-slate-800 border border-slate-700 text-xs font-semibold rounded-lg px-2 py-1.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500/50 cursor-pointer disabled:opacity-50"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="visible">Visible</option>
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
                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
                            <span className="text-xs text-slate-500">
                                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4 text-slate-300" />
                                </button>
                                <span className="text-xs text-slate-400 px-2">Page {page} of {totalPages}</span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                </button>
                            </div>
                        </div>
                    )}
                    {!loading && (
                        <div className="px-5 py-2 border-t border-slate-800 text-xs text-slate-500">
                            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                        </div>
                    )}
                </div>
            </div>

            {
                replyTarget && (
                    <ReviewReplyModal
                        review={replyTarget}
                        onClose={() => setReplyTarget(null)}
                        onSaved={handleReplySaved}
                    />
                )
            }
        </>
    );
}
