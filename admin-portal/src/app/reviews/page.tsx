"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/shared/ui"; // Assuming Button exists or import from wherever

type Review = {
    id: string;
    college_id: string;
    user_name: string;
    rating: number;
    title: string;
    review_text: string;
    created_at: string;
    is_approved: boolean;
    colleges: {
        name: string;
    } | null;
};

export default function ReviewsPage() {
    const supabase = createClient();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchReviews = async () => {
        setLoading(true);
        // Ensure we fetch even unapproved reviews (RLS policy allows admins)
        const { data, error } = await supabase
            .schema("public")
            .from("reviews")
            .select(`
                *,
                colleges (name)
            `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching reviews:", error);
        } else {
            setReviews(data as unknown as Review[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        const { error } = await supabase
            .schema("public")
            .from("reviews")
            .update({ is_approved: true })
            .eq("id", id);

        if (error) {
            alert("Failed to approve review");
            console.error(error);
        } else {
            setReviews(reviews.map(r => r.id === id ? { ...r, is_approved: true } : r));
        }
        setActionLoading(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        setActionLoading(id);
        const { error } = await supabase
            .schema("public")
            .from("reviews")
            .delete()
            .eq("id", id);

        if (error) {
            alert("Failed to delete review");
            console.error(error);
        } else {
            setReviews(reviews.filter(r => r.id !== id));
        }
        setActionLoading(null);
    };

    if (loading) return <div className="p-8">Loading reviews...</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Review Moderation</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">College</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-xs">Review</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {reviews.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                    No reviews found.
                                </td>
                            </tr>
                        ) : (
                            reviews.map((review) => (
                                <tr key={review.id} className={review.is_approved ? "" : "bg-yellow-50"}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {review.is_approved ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Approved
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {review.colleges?.name || "Unknown College"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {review.user_name || "Anonymous"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        ⭐ {review.rating}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                        <div className="font-medium text-gray-900">{review.title}</div>
                                        <div className="truncate">{review.review_text}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        {!review.is_approved && (
                                            <button
                                                onClick={() => handleApprove(review.id)}
                                                disabled={actionLoading === review.id}
                                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                            >
                                                {actionLoading === review.id ? "..." : "Approve"}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            disabled={actionLoading === review.id}
                                            className="text-red-600 hover:text-red-900 disabled:opacity-50 ml-4"
                                        >
                                            {actionLoading === review.id ? "..." : "Delete"}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
