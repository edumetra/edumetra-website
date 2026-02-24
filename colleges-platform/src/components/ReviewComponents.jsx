import { useState, useEffect } from 'react';
import { Star, User, Calendar, MessageSquare, ThumbsUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSignup } from '../contexts/SignupContext';

// Helper for displaying stars
export function StarRating({ rating, setRating, editable = false, size = 5 }) {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex items-center gap-1">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <button
                        type="button"
                        key={index}
                        className={`${editable ? 'cursor-pointer' : 'cursor-default'} transition-colors`}
                        onClick={() => editable && setRating(ratingValue)}
                        onMouseEnter={() => editable && setHover(ratingValue)}
                        onMouseLeave={() => editable && setHover(rating)}
                    >
                        <Star
                            className={`w-${size} h-${size} ${ratingValue <= (hover || rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-600"
                                }`}
                        />
                    </button>
                );
            })}
        </div>
    );
}

export function ReviewForm({ collegeId, onReviewSubmitted }) {
    const { user, setShowModal } = useSignup();
    const [rating, setRating] = useState(0);
    const [formData, setFormData] = useState({ title: '', review_text: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setShowModal(true);
            return;
        }

        if (rating === 0) {
            setError("Please select a rating");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error: submitError } = await supabase
                .from('reviews')
                .insert({
                    college_id: collegeId,
                    user_id: user.id,
                    user_name: user.user_metadata?.full_name || user.email.split('@')[0],
                    rating,
                    title: formData.title,
                    review_text: formData.review_text
                });

            if (submitError) throw submitError;

            setFormData({ title: '', review_text: '' });
            setRating(0);
            if (onReviewSubmitted) onReviewSubmitted();

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center">
                <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Have you studied here?</h3>
                <p className="text-slate-400 mb-6">Share your experience to help other students make better choices.</p>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg active:scale-95"
                >
                    Log In to Write a Review
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <h3 className="text-xl font-bold text-white">Write a Review</h3>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Overall Rating</label>
                <div className="flex items-center gap-4">
                    <StarRating rating={rating} setRating={setRating} editable={true} size={8} />
                    <span className="text-slate-400 text-sm font-medium">{rating > 0 ? `${rating}/5` : 'Select stars'}</span>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Review Title</label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g., Great campus life but strict academics"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Your Experience</label>
                <textarea
                    rows={4}
                    value={formData.review_text}
                    onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Share details about faculty, infrastructure, placements..."
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
                {loading ? "Submitting..." : "Submit Review"}
            </button>
        </form>
    );
}

export function ReviewList({ collegeId, refreshTrigger }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const { data, error } = await supabase
                    .from('reviews')
                    .select('*')
                    .eq('college_id', collegeId)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setReviews(data || []);
            } catch (err) {
                console.error("Error fetching reviews:", err);
            } finally {
                setLoading(false);
            }
        };

        if (collegeId) fetchReviews();
    }, [collegeId, refreshTrigger]);

    if (loading) return <div className="text-center py-8 text-slate-500">Loading reviews...</div>;

    if (reviews.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 font-medium">No reviews yet.</p>
                <p className="text-slate-600 text-sm">Be the first to share your experience!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-300 font-bold border border-slate-700">
                                {review.user_name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">{review.user_name || 'Anonymous User'}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <StarRating rating={review.rating} size={3} />
                                    <span>•</span>
                                    <span>{new Date(review.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h5 className="text-lg font-bold text-slate-200 mb-2">{review.title}</h5>
                    <p className="text-slate-400 leading-relaxed text-sm mb-4">
                        {review.review_text}
                    </p>

                    <div className="flex items-center gap-4 pt-4 border-t border-slate-800/50">
                        <button className="flex items-center gap-1 text-slate-500 hover:text-blue-400 text-xs font-medium transition-colors">
                            <ThumbsUp className="w-4 h-4" /> Helpful (0)
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
