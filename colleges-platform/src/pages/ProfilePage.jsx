import { useState, useEffect } from 'react';
import { useSignup } from '../contexts/SignupContext';
import { supabase } from '../lib/supabase';
import { User, Mail, LogOut, ArrowLeft, Star, BookmarkX, Pencil, Trash2, Bookmark, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const TABS = ['Account', 'My Reviews', 'Saved Colleges'];

export default function ProfilePage() {
    const { user, logout } = useSignup();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Account');
    const [reviews, setReviews] = useState([]);
    const [savedColleges, setSavedColleges] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [loadingSaved, setLoadingSaved] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const [editTitle, setEditTitle] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    useEffect(() => {
        if (!user) return;
        if (activeTab === 'My Reviews') fetchReviews();
        if (activeTab === 'Saved Colleges') fetchSaved();
    }, [activeTab, user]);

    const fetchReviews = async () => {
        setLoadingReviews(true);
        const { data } = await supabase
            .from('reviews')
            .select('id, college_id, rating, title, review_text, moderation_status, created_at, helpful_count, colleges(name)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        setReviews(data || []);
        setLoadingReviews(false);
    };

    const fetchSaved = async () => {
        setLoadingSaved(true);
        const { data } = await supabase
            .from('saved_colleges')
            .select('id, created_at, colleges(id, name, location_city, location_state, rating, type, image)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        setSavedColleges(data || []);
        setLoadingSaved(false);
    };

    const handleEditSave = async (reviewId) => {
        await supabase.from('reviews').update({ title: editTitle, review_text: editText, moderation_status: 'pending' }).eq('id', reviewId);
        setEditingId(null);
        fetchReviews();
    };

    const handleDelete = async (reviewId) => {
        await supabase.from('reviews').delete().eq('id', reviewId);
        setDeleteConfirmId(null);
        setReviews(prev => prev.filter(r => r.id !== reviewId));
    };

    const handleUnsave = async (savedId) => {
        await supabase.from('saved_colleges').delete().eq('id', savedId);
        setSavedColleges(prev => prev.filter(s => s.id !== savedId));
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
                    <p className="text-slate-400 mb-6">You must be logged in to view this page.</p>
                    <Link to="/" className="text-red-500 hover:text-red-400">Return Home</Link>
                </div>
            </div>
        );
    }

    const statusColor = { visible: 'emerald', pending: 'amber', hidden: 'red' };

    return (
        <div className="min-h-screen bg-slate-950 pt-28 pb-20 px-4">
            <div className="max-w-3xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>

                {/* Profile Header */}
                <div className="flex items-center gap-5 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-rose-700 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-red-900/30">
                        {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white">{user.user_metadata?.full_name || 'User'}</h1>
                        <p className="text-slate-400 text-sm">{user.email}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 mb-6 w-fit">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Account Tab */}
                {activeTab === 'Account' && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                        <div>
                            <label className="text-xs text-slate-500 uppercase tracking-wider">Full Name</label>
                            <p className="text-slate-200 mt-1">{user.user_metadata?.full_name || 'Not provided'}</p>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 uppercase tracking-wider">Email</label>
                            <p className="text-slate-200 mt-1">{user.email}</p>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 uppercase tracking-wider">User ID</label>
                            <p className="text-slate-500 text-xs font-mono mt-1">{user.id}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-3 rounded-xl font-medium transition-colors"
                        >
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
                )}

                {/* My Reviews Tab */}
                {activeTab === 'My Reviews' && (
                    <div className="space-y-4">
                        {loadingReviews ? (
                            [...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-900 rounded-2xl animate-pulse" />)
                        ) : reviews.length === 0 ? (
                            <div className="text-center py-16 text-slate-500">
                                <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                <p>You haven't written any reviews yet.</p>
                                <Link to="/review" className="mt-4 inline-block text-red-400 hover:text-red-300 text-sm font-medium">Write your first review →</Link>
                            </div>
                        ) : reviews.map(review => (
                            <div key={review.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <Link to={`/colleges/${review.college_id}`} className="font-bold text-white hover:text-red-400 transition-colors text-sm">
                                            {review.colleges?.name || 'College'}
                                        </Link>
                                        <div className="flex items-center gap-2 mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                                            ))}
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-${statusColor[review.moderation_status] || 'slate'}-500/10 text-${statusColor[review.moderation_status] || 'slate'}-400 border border-${statusColor[review.moderation_status] || 'slate'}-500/20`}>
                                                {review.moderation_status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => { setEditingId(review.id); setEditTitle(review.title || ''); setEditText(review.review_text); }} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => setDeleteConfirmId(review.id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {editingId === review.id ? (
                                    <div className="space-y-3">
                                        <input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Title" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50" />
                                        <textarea rows={4} value={editText} onChange={e => setEditText(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 resize-none" />
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEditSave(review.id)} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors">Save</button>
                                            <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-slate-800 text-slate-300 text-sm rounded-lg hover:bg-slate-700 transition-colors">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {review.title && <p className="font-semibold text-slate-200 text-sm mb-1">{review.title}</p>}
                                        <p className="text-slate-400 text-sm line-clamp-3">{review.review_text}</p>
                                        <p className="text-slate-600 text-xs mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                                    </>
                                )}

                                {/* Delete Confirm */}
                                {deleteConfirmId === review.id && (
                                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between">
                                        <span className="text-red-300 text-sm">Delete this review?</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleDelete(review.id)} className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg">Delete</button>
                                            <button onClick={() => setDeleteConfirmId(null)} className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs rounded-lg">Cancel</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Saved Colleges Tab */}
                {activeTab === 'Saved Colleges' && (
                    <div className="space-y-3">
                        {loadingSaved ? (
                            [...Array(3)].map((_, i) => <div key={i} className="h-20 bg-slate-900 rounded-2xl animate-pulse" />)
                        ) : savedColleges.length === 0 ? (
                            <div className="text-center py-16 text-slate-500">
                                <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                <p>No saved colleges yet.</p>
                                <Link to="/colleges" className="mt-4 inline-block text-red-400 hover:text-red-300 text-sm font-medium">Browse colleges →</Link>
                            </div>
                        ) : savedColleges.map(saved => {
                            const c = saved.colleges;
                            return (
                                <div key={saved.id} className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all group">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-800">
                                        {c.image ? <img src={c.image} alt={c.name} className="w-full h-full object-cover" /> : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">{c.name?.[0]}</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-white text-sm truncate group-hover:text-red-400 transition-colors">{c.name}</p>
                                        <p className="text-slate-500 text-xs">{c.location_city}, {c.location_state}</p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">
                                            <Star className="w-3.5 h-3.5 fill-current" />{c.rating || '—'}
                                        </div>
                                        <Link to={`/colleges/${c.id}`} className="p-2 text-slate-600 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                        <button onClick={() => handleUnsave(saved.id)} className="p-2 text-slate-600 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all" title="Remove">
                                            <BookmarkX className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
