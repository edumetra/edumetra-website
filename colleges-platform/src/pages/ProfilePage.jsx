import { useState, useEffect } from 'react';
import { useSignup } from '../contexts/SignupContext';
import { supabase } from '../lib/supabase';
import { User, Mail, LogOut, ArrowLeft, Star, BookmarkX, Pencil, Trash2, Bookmark, ChevronRight, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Calculator } from 'lucide-react';

const TABS = ['Account', 'My Reviews', 'Saved Colleges'];

export default function ProfilePage() {
    const { user, logout } = useSignup();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Account');
    const [reviews, setReviews] = useState([]);
    const [savedColleges, setSavedColleges] = useState([]);
    const [profileData, setProfileData] = useState({
        full_name: '',
        phone_number: '',
        state: '',
        city: '',
        stream: ''
    });
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);

    const [loadingReviews, setLoadingReviews] = useState(false);
    const [loadingSaved, setLoadingSaved] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const [editTitle, setEditTitle] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    // Admission Predictor State
    const [mockScore, setMockScore] = useState('');
    const [calculating, setCalculating] = useState(false);
    const [predictions, setPredictions] = useState({});

    useEffect(() => {
        if (!user) return;
        if (activeTab === 'Account') fetchProfile();
        if (activeTab === 'My Reviews') fetchReviews();
        if (activeTab === 'Saved Colleges') fetchSaved();
    }, [activeTab, user]);

    const fetchProfile = async () => {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('full_name, phone_number, state, city, stream')
            .eq('id', user.id)
            .single();

        if (data) {
            setProfileData({
                full_name: data.full_name || user.user_metadata?.full_name || '',
                phone_number: data.phone_number || '',
                state: data.state || '',
                city: data.city || '',
                stream: data.stream || ''
            });
        } else if (!data && user.user_metadata?.full_name) {
            setProfileData(prev => ({ ...prev, full_name: user.user_metadata.full_name }));
        }
    };

    const fetchReviews = async () => {
        setLoadingReviews(true);
        const { data } = await supabase
            .from('reviews')
            .select('id, college_id, rating, title, review_text, moderation_status, created_at, helpful_count, colleges(name, slug)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        setReviews(data || []);
        setLoadingReviews(false);
    };

    const fetchSaved = async () => {
        setLoadingSaved(true);
        const { data } = await supabase
            .from('saved_colleges')
            .select('id, created_at, colleges(id, slug, name, location_city, location_state, rating, type, image)')
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

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        // Save to our custom Profiles table
        await supabase.from('user_profiles').update({
            full_name: profileData.full_name,
            phone_number: profileData.phone_number,
            state: profileData.state,
            city: profileData.city,
            stream: profileData.stream
        }).eq('id', user.id);

        // Also sync the core Auth user_metadata casually
        if (profileData.full_name !== user.user_metadata?.full_name) {
            await supabase.auth.updateUser({
                data: { full_name: profileData.full_name }
            });
        }

        setIsEditingProfile(false);
        setSavingProfile(false);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleCalculateAll = () => {
        if (!mockScore.trim()) return;
        setCalculating(true);
        setTimeout(() => {
            const numScore = parseFloat(mockScore);
            const newPredictions = {};

            savedColleges.forEach(saved => {
                let chanceText = 'Low';
                let color = 'text-red-400';

                // Introduce some variance based on the college rating to make the mock logic feel dynamic
                const variance = saved.colleges.rating ? (saved.colleges.rating * 2) : 5;
                const effectiveScore = numScore - (10 - variance);

                if (effectiveScore > 90) {
                    chanceText = 'Excellent';
                    color = 'text-emerald-400';
                } else if (effectiveScore > 75) {
                    chanceText = 'Good';
                    color = 'text-amber-400';
                } else if (effectiveScore > 60) {
                    chanceText = 'Fair';
                    color = 'text-yellow-400';
                }

                newPredictions[saved.college_id] = { chance: chanceText, color };
            });

            setPredictions(newPredictions);
            setCalculating(false);
        }, 1200);
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
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-8 relative overflow-hidden">

                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">Personal Information</h3>
                                <p className="text-sm text-slate-400">Manage your profile details and academic preferences.</p>
                            </div>
                            {!isEditingProfile ? (
                                <button onClick={() => setIsEditingProfile(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors">
                                    <Pencil className="w-4 h-4" /> Edit
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={() => setIsEditingProfile(false)} className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white text-sm font-semibold rounded-lg transition-colors">
                                        Cancel
                                    </button>
                                    <button onClick={handleSaveProfile} disabled={savingProfile} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50">
                                        {savingProfile ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Full Name</label>
                                {isEditingProfile ? (
                                    <input value={profileData.full_name} onChange={e => setProfileData(p => ({ ...p, full_name: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50" />
                                ) : (
                                    <p className="text-slate-200 bg-slate-800/20 px-4 py-2.5 rounded-xl border border-transparent">{profileData.full_name || 'Not provided'}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Phone Number</label>
                                {isEditingProfile ? (
                                    <input value={profileData.phone_number} onChange={e => setProfileData(p => ({ ...p, phone_number: e.target.value }))} placeholder="+91" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50" />
                                ) : (
                                    <p className="text-slate-200 bg-slate-800/20 px-4 py-2.5 rounded-xl border border-transparent">{profileData.phone_number || 'Not provided'}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">City</label>
                                {isEditingProfile ? (
                                    <input value={profileData.city} onChange={e => setProfileData(p => ({ ...p, city: e.target.value }))} placeholder="e.g. Mumbai" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50" />
                                ) : (
                                    <p className="text-slate-200 bg-slate-800/20 px-4 py-2.5 rounded-xl border border-transparent">{profileData.city || 'Not provided'}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">State</label>
                                {isEditingProfile ? (
                                    <select value={profileData.state} onChange={e => setProfileData(p => ({ ...p, state: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50">
                                        <option value="">Select State</option>
                                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                                        <option value="Delhi">Delhi</option>
                                        <option value="Gujarat">Gujarat</option>
                                        <option value="Karnataka">Karnataka</option>
                                        <option value="Maharashtra">Maharashtra</option>
                                        <option value="Tamil Nadu">Tamil Nadu</option>
                                        <option value="Telangana">Telangana</option>
                                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                                        <option value="West Bengal">West Bengal</option>
                                        <option value="Other">Other</option>
                                    </select>
                                ) : (
                                    <p className="text-slate-200 bg-slate-800/20 px-4 py-2.5 rounded-xl border border-transparent">{profileData.state || 'Not provided'}</p>
                                )}
                            </div>

                            <div className="space-y-1 md:col-span-2">
                                <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Target Stream</label>
                                {isEditingProfile ? (
                                    <select value={profileData.stream} onChange={e => setProfileData(p => ({ ...p, stream: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50">
                                        <option value="">Select Stream</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="Medical">Medical</option>
                                        <option value="Management">Management</option>
                                        <option value="Arts">Arts</option>
                                        <option value="Commerce">Commerce</option>
                                        <option value="Law">Law</option>
                                    </select>
                                ) : (
                                    <p className="text-slate-200 bg-slate-800/20 px-4 py-2.5 rounded-xl border border-transparent">{profileData.stream || 'Not specified'}</p>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-800 space-y-4">
                            <h4 className="text-sm font-bold text-white mb-2">Account Security</h4>
                            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                                <div>
                                    <p className="text-sm font-bold text-slate-200">Email Address</p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                </div>
                                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20">Verified</div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-3.5 rounded-xl font-bold transition-colors mt-8"
                            >
                                <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                        </div>
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
                                        <Link to={`/colleges/${review.colleges?.slug || review.college_id}`} className="font-bold text-white hover:text-red-400 transition-colors text-sm">
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
                    <div className="space-y-6">
                        {/* Global Admission Predictor */}
                        {savedColleges.length > 0 && !loadingSaved && (
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                                                <TrendingUp className="w-5 h-5 text-red-500" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white">Global Admission Chances</h3>
                                        </div>
                                        <p className="text-slate-400 text-sm">
                                            Enter your predicted 12th/Entrance score. We'll instantly calculate your priority for all your saved colleges across the board.
                                        </p>
                                    </div>

                                    <div className="w-full md:w-auto flex gap-3">
                                        <input
                                            type="number"
                                            value={mockScore}
                                            onChange={(e) => setMockScore(e.target.value)}
                                            placeholder="Score %"
                                            className="w-full md:w-32 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all focus:outline-none"
                                        />
                                        <button
                                            onClick={handleCalculateAll}
                                            disabled={calculating || !mockScore.trim()}
                                            className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex justify-center items-center gap-2 whitespace-nowrap"
                                        >
                                            {calculating ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <><Calculator className="w-4 h-4" /> Calculate</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                const prediction = predictions[c.id];

                                return (
                                    <div key={saved.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all group">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-800">
                                                {c.image ? <img src={c.image} alt={c.name} className="w-full h-full object-cover" /> : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">{c.name?.[0]}</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-white text-sm truncate group-hover:text-red-400 transition-colors">{c.name}</p>
                                                <p className="text-slate-500 text-xs">{c.location_city}, {c.location_state}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 pl-16 sm:pl-0 mt-2 sm:mt-0 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                                            {/* Prediction Badge */}
                                            {prediction && (
                                                <div className={`px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold animate-in fade-in zoom-in-95 ${prediction.color}`}>
                                                    Chance: {prediction.chance}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">
                                                    <Star className="w-3.5 h-3.5 fill-current" />{c.rating || '—'}
                                                </div>
                                                <div className="w-px h-6 bg-slate-800 hidden sm:block"></div>
                                                <Link to={`/colleges/${c.slug}`} className="p-2 text-slate-600 hover:text-white hover:bg-slate-800 rounded-lg transition-all" title="View Details">
                                                    <ChevronRight className="w-4 h-4" />
                                                </Link>
                                                <button onClick={() => handleUnsave(saved.id)} className="p-2 text-slate-600 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all" title="Remove Save">
                                                    <BookmarkX className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
