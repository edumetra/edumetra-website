import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, MessageSquare, Search, ArrowLeft, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSignup } from '../contexts/SignupContext';



export default function WriteReviewPage() {
    const { isSignedUp, user, openSignIn } = useSignup();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1 = select college, 2 = write review
    const [collegeSearch, setCollegeSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedCollege, setSelectedCollege] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [formData, setFormData] = useState({ title: '', review_text: '' });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const searchColleges = async (q) => {
        if (!q.trim()) { setSearchResults([]); return; }
        setSearching(true);
        const { data } = await supabase
            .from('colleges')
            .select('id, name, location_city, location_state, image')
            .ilike('name', `%${q}%`)
            .eq('visibility', 'public')
            .limit(6);
        setSearchResults(data || []);
        setSearching(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCollege || rating === 0) return;

        setSubmitting(true);
        setError('');

        const { error: err } = await supabase.from('reviews').insert({
            college_id: selectedCollege.id,
            user_id: user.id,
            user_name: user.user_metadata?.full_name || 'Anonymous',
            rating,
            title: formData.title,
            review_text: formData.review_text,
            moderation_status: 'pending',
        });

        setSubmitting(false);
        if (err) { setError(err.message); return; }
        setSubmitted(true);
    };

    if (!isSignedUp) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
                        <Star className="w-8 h-8 text-amber-400" />
                    </div>
                    <h1 className="text-2xl font-black text-white mb-3">Sign In to Write a Review</h1>
                    <p className="text-slate-400 mb-8">
                        Share your college experience to help thousands of students make better decisions.
                    </p>
                    <button
                        onClick={openSignIn}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold hover:scale-105 transition-all"
                    >
                        Sign In to Continue
                    </button>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                        <Send className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h1 className="text-2xl font-black text-white mb-3">Review Submitted!</h1>
                    <p className="text-slate-400 mb-8">
                        Thank you for sharing your experience. Your review is being reviewed by our team and will be published shortly.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Link to="/colleges" className="px-6 py-3 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl font-semibold hover:bg-slate-700 transition-colors">
                            Browse Colleges
                        </Link>
                        <button
                            onClick={() => { setSubmitted(false); setStep(1); setSelectedCollege(null); setRating(0); setFormData({ title: '', review_text: '' }); }}
                            className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:scale-105 transition-all"
                        >
                            Write Another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <div className="mb-8">
                <Link to="/colleges" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Colleges
                </Link>
                <h1 className="text-3xl font-black text-white mb-2">Write a Review</h1>
                <p className="text-slate-400">Your honest experience helps future students make better decisions.</p>
            </div>

            {/* Step 1: Select College */}
            {step === 1 && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-black text-sm">1</div>
                        <h2 className="text-lg font-bold text-white">Select the College</h2>
                    </div>

                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            autoFocus
                            type="text"
                            value={collegeSearch}
                            onChange={e => { setCollegeSearch(e.target.value); searchColleges(e.target.value); }}
                            placeholder="Search college by name..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40 transition-all"
                        />
                    </div>

                    {searching && <p className="text-sm text-slate-500 mb-3">Searching...</p>}

                    {searchResults.length > 0 && (
                        <div className="space-y-2">
                            {searchResults.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => { setSelectedCollege(c); setStep(2); }}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700 hover:border-red-500/40 hover:bg-slate-800 transition-all text-left"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-slate-700 overflow-hidden shrink-0">
                                        {c.image ? <img src={c.image} alt="" className="w-full h-full object-cover" /> :
                                            <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-bold">{c.name.charAt(0)}</div>}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-white">{c.name}</div>
                                        <div className="text-xs text-slate-500">{c.location_city}, {c.location_state}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {collegeSearch && !searching && searchResults.length === 0 && (
                        <p className="text-sm text-slate-500 text-center py-4">No colleges found. Try a different name.</p>
                    )}
                </div>
            )}

            {/* Step 2: Write Review */}
            {step === 2 && selectedCollege && (
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Selected college */}
                    <div className="flex items-center gap-4 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
                        <div className="w-12 h-12 rounded-xl bg-slate-700 overflow-hidden shrink-0">
                            {selectedCollege.image ? <img src={selectedCollege.image} alt="" className="w-full h-full object-cover" /> :
                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">{selectedCollege.name.charAt(0)}</div>}
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-bold text-white">{selectedCollege.name}</div>
                            <div className="text-xs text-slate-500">{selectedCollege.location_city}, {selectedCollege.location_state}</div>
                        </div>
                        <button type="button" onClick={() => { setStep(1); setSelectedCollege(null); }} className="text-xs text-slate-500 hover:text-red-400 transition-colors">
                            Change
                        </button>
                    </div>

                    {/* Rating */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Your Rating *</label>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setRating(i)}
                                    onMouseEnter={() => setHoverRating(i)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="transition-transform hover:scale-125"
                                >
                                    <Star className={`w-9 h-9 transition-colors ${i <= (hoverRating || rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                                </button>
                            ))}
                            {rating > 0 && (
                                <span className="ml-2 text-sm text-amber-400 font-bold">
                                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Review Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Summarise your experience in one line..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40 transition-all"
                        />
                    </div>

                    {/* Review text */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Your Review *</label>
                        <textarea
                            required
                            rows={5}
                            value={formData.review_text}
                            onChange={e => setFormData({ ...formData, review_text: e.target.value })}
                            placeholder="Share your honest experience — academics, placements, campus life, faculty..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40 transition-all resize-none"
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm px-1">⚠️ {error}</p>}

                    <button
                        type="submit"
                        disabled={submitting || rating === 0}
                        className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                        <Send className="w-5 h-5" />
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            )}
        </div>
    );
}
