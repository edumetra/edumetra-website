import { useState, useEffect } from 'react';
import { Star, User, ThumbsUp, MessageSquare, Shield, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSignup } from '../contexts/SignupContext';

// Star Rating helper
export function StarRating({ rating, setRating, editable = false, size = 5 }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex items-center gap-1">
            {[...Array(5)].map((_, index) => {
                const val = index + 1;
                return (
                    <button type="button" key={index} className={`${editable ? 'cursor-pointer' : 'cursor-default'} transition-colors`}
                        onClick={() => editable && setRating(val)}
                        onMouseEnter={() => editable && setHover(val)}
                        onMouseLeave={() => editable && setHover(rating)}>
                        <Star className={`w-${size} h-${size} ${val <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                    </button>
                );
            })}
        </div>
    );
}

// Review Form
export function ReviewForm({ collegeId, onReviewSubmitted }) {
    const { user, setShowModal } = useSignup();
    const [rating, setRating] = useState(0);
    const [formData, setFormData] = useState({ title: '', review_text: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) { setShowModal(true); return; }
        if (rating === 0) { setError('Please select a rating'); return; }
        setLoading(true); setError(null);
        try {
            const { error: err } = await supabase.from('reviews').insert({
                college_id: collegeId,
                user_id: user.id,
                user_name: user.user_metadata?.full_name || user.email.split('@')[0],
                rating,
                title: formData.title,
                review_text: formData.review_text,
                moderation_status: 'pending',
            });
            if (err) throw err;
            setFormData({ title: '', review_text: '' });
            setRating(0);
            onReviewSubmitted?.();
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
                <button onClick={() => setShowModal(true)} className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg active:scale-95">
                    Log In to Write a Review
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
            <h3 className="text-xl font-bold text-white">Write a Review</h3>
            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">{error}</div>}
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Overall Rating</label>
                <div className="flex items-center gap-4">
                    <StarRating rating={rating} setRating={setRating} editable size={8} />
                    <span className="text-slate-400 text-sm">{rating > 0 ? `${rating}/5` : 'Select stars'}</span>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Review Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                    placeholder="e.g., Great campus life but strict academics" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Your Experience</label>
                <textarea rows={4} value={formData.review_text} onChange={e => setFormData({ ...formData, review_text: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:outline-none resize-none"
                    placeholder="Share details about faculty, infrastructure, placements..." required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50">
                {loading ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
}

// Individual Review Card with Helpful Voting + Reply Thread
function ReviewCard({ review, votedIds, onVote, isAdmin }) {
    const { user } = useSignup();
    const [replies, setReplies] = useState([]);
    const [showReplies, setShowReplies] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);
    const [votingId, setVotingId] = useState(null);
    const hasVoted = votedIds.includes(review.id);

    const fetchReplies = async () => {
        const { data } = await supabase.from('review_replies').select('*').eq('review_id', review.id).order('created_at');
        setReplies(data || []);
    };

    const toggleReplies = async () => {
        if (!showReplies) await fetchReplies();
        setShowReplies(v => !v);
    };

    const handleVote = async () => {
        if (!user || votingId) return;
        setVotingId(review.id);
        if (hasVoted) {
            await supabase.from('review_helpful_votes').delete().eq('review_id', review.id).eq('user_id', user.id);
            onVote(review.id, false);
        } else {
            await supabase.from('review_helpful_votes').insert({ review_id: review.id, user_id: user.id });
            onVote(review.id, true);
        }
        setVotingId(null);
    };

    const handleReply = async () => {
        if (!replyText.trim() || submittingReply) return;
        setSubmittingReply(true);
        await supabase.from('review_replies').insert({
            review_id: review.id,
            author_id: user.id,
            author_name: user.user_metadata?.full_name || 'Admin',
            reply_text: replyText.trim(),
        });
        setReplyText('');
        await fetchReplies();
        setSubmittingReply(false);
    };

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-300 font-bold border border-slate-700">
                        {review.user_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm">{review.user_name || 'Anonymous'}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <StarRating rating={review.rating} size={3} />
                            <span>•</span>
                            <span>{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {review.title && <h5 className="text-base font-bold text-slate-200 mb-2">{review.title}</h5>}
            <p className="text-slate-400 leading-relaxed text-sm mb-4">{review.review_text}</p>

            {/* Footer actions */}
            <div className="flex items-center gap-4 pt-3 border-t border-slate-800/50">
                <button
                    onClick={handleVote}
                    disabled={!user || !!votingId}
                    title={!user ? 'Sign in to vote' : hasVoted ? 'Remove helpful vote' : 'Mark as helpful'}
                    className={`flex items-center gap-1.5 text-xs font-medium transition-all disabled:cursor-default ${hasVoted ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-emerald-400' : ''}`} />
                    Helpful ({review.helpful_count ?? 0})
                </button>
                <button onClick={toggleReplies} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 font-medium transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {showReplies ? 'Hide replies' : 'Replies'}
                </button>
            </div>

            {/* Replies thread */}
            {showReplies && (
                <div className="mt-4 space-y-3 pl-4 border-l-2 border-slate-800">
                    {replies.map(reply => (
                        <div key={reply.id} className="bg-slate-800/60 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1 bg-red-500/10 rounded-md">
                                    <Shield className="w-3 h-3 text-red-400" />
                                </div>
                                <span className="text-xs font-bold text-red-400">{reply.author_name}</span>
                                <span className="text-slate-600 text-xs">· {new Date(reply.created_at).toLocaleDateString()}</span>
                                <span className="ml-auto text-xs px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded font-semibold">College Response</span>
                            </div>
                            <p className="text-slate-300 text-sm">{reply.reply_text}</p>
                        </div>
                    ))}
                    {replies.length === 0 && <p className="text-slate-600 text-xs italic">No replies yet.</p>}

                    {/* Admin reply input */}
                    {isAdmin && (
                        <div className="flex gap-2 mt-2">
                            <input
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleReply()}
                                placeholder="Reply as College Representative..."
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500/50"
                            />
                            <button onClick={handleReply} disabled={submittingReply || !replyText.trim()} className="p-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white rounded-lg transition-colors">
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Review List
export function ReviewList({ collegeId, refreshTrigger }) {
    const { user } = useSignup();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [votedIds, setVotedIds] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (collegeId) fetchReviews();
    }, [collegeId, refreshTrigger]);

    useEffect(() => {
        if (user) {
            fetchMyVotes();
            checkAdmin();
        }
    }, [user]);

    const fetchReviews = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('reviews')
            .select('*')
            .eq('college_id', collegeId)
            .order('helpful_count', { ascending: false })
            .order('created_at', { ascending: false });
        setReviews(data || []);
        setLoading(false);
    };

    const fetchMyVotes = async () => {
        const { data } = await supabase.from('review_helpful_votes').select('review_id').eq('user_id', user.id);
        setVotedIds((data || []).map(v => v.review_id));
    };

    const checkAdmin = async () => {
        const { data } = await supabase.from('admins').select('id').eq('id', user.id).single();
        setIsAdmin(!!data);
    };

    const handleVote = (reviewId, added) => {
        setVotedIds(prev => added ? [...prev, reviewId] : prev.filter(id => id !== reviewId));
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpful_count: (r.helpful_count ?? 0) + (added ? 1 : -1) } : r));
    };

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
        <div className="space-y-5">
            {reviews.map(review => (
                <ReviewCard key={review.id} review={review} votedIds={votedIds} onVote={handleVote} isAdmin={isAdmin} />
            ))}
        </div>
    );
}
