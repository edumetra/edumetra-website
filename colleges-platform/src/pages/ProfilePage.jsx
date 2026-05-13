import { useState, useEffect, useCallback } from 'react';
import { useSignup } from '../contexts/SignupContext';
import { supabase } from '../lib/supabase';
import { 
    User, Mail, LogOut, ArrowLeft, Star, 
    BookmarkX, Pencil, Trash2, Bookmark, 
    ChevronRight, Save, Brain, Target, Sparkles, X, ShieldCheck, Zap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Calculator, Trophy, Lock, Search, AlertCircle, Loader2 } from 'lucide-react';
import { usePremium } from '../contexts/PremiumContext';
import { motion } from 'framer-motion';
import { categorizePrediction, canUserPredict, recordUsage, getUsage } from '../components/predictor/predictorEngine';
import { toast } from 'react-hot-toast';
import { pushLeadToTeleCRM } from '../services/telecrm';


const EXAMS = [
    { id: 'jee_main', label: 'JEE Main', field: 'Percentile (0–100)', min: 0, max: 100, unit: '%ile' },
    { id: 'jee_advanced', label: 'JEE Advanced', field: 'Rank', min: 1, max: 250000, unit: 'rank' },
    { id: 'neet', label: 'NEET', field: 'Score (0–720)', min: 0, max: 720, unit: 'marks' },
    { id: 'cat', label: 'CAT', field: 'Percentile (0–100)', min: 0, max: 100, unit: '%ile' },
    { id: 'clat', label: 'CLAT', field: 'Score (0–150)', min: 0, max: 150, unit: 'marks' },
    { id: 'cuet', label: 'CUET', field: 'Score (0–800)', min: 0, max: 800, unit: 'marks' },
];

const TABS = ['Dashboard', 'Account Settings', 'My Reviews', 'Saved Colleges', 'AI Strategies'];

export default function ProfilePage() {
    const { user, logout } = useSignup();
    const { isPremium, isPro } = usePremium();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [usage, setUsage] = useState(getUsage());
    const [exam, setExam] = useState(EXAMS[0]);
    const [reviews, setReviews] = useState([]);
    const [savedColleges, setSavedColleges] = useState([]);
    const [neetPlans, setNeetPlans] = useState([]);
    const [profileData, setProfileData] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        state: '',
        city: '',
        stream: '',
        gender: '',
        dob: '',
        tenth_board: '',
        tenth_passing_year: '',
        tenth_percentage: '',
        twelfth_board: '',
        twelfth_passing_year: '',
        twelfth_percentage: '',
        entrance_exams: [],
        preferred_courses: [],
        preferred_locations: [],
        budget_range: '',
        account_type: 'free',
        subscription_status: null
    });
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const [loadingReviews, setLoadingReviews] = useState(false);
    const [loadingSaved, setLoadingSaved] = useState(false);
    const [loadingAI, setLoadingAI] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const [editTitle, setEditTitle] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    // Admission Predictor State
    const [mockScore, setMockScore] = useState('');
    const [calculating, setCalculating] = useState(false);
    const [predictions, setPredictions] = useState({});

    const role = isPro ? 'pro' : isPremium ? 'premium' : 'free';
    const isGated = !isPremium && !isPro;

    useEffect(() => {
        if (!user) return;
        if (activeTab === 'Account Settings' || activeTab === 'Dashboard') fetchProfile();
        if (activeTab === 'My Reviews') fetchReviews();
        if (activeTab === 'Saved Colleges' || activeTab === 'Dashboard') fetchSaved();
        if (activeTab === 'AI Strategies') fetchNeetPlans();
    }, [activeTab, user, fetchProfile, fetchReviews, fetchSaved, fetchNeetPlans]);

    const fetchProfile = useCallback(async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user.id)
                .single()
                .abortSignal(controller.signal);

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 is just "no rows found"

            if (data) {
                setProfileData({
                    full_name: data.full_name || user.user_metadata?.full_name || '',
                    email: user.email || '',
                    phone_number: user.phone || data.phone_number || '',
                    state: data.state || '',
                    city: data.city || '',
                    stream: data.stream || '',
                    gender: data.gender || '',
                    dob: data.dob || '',
                    tenth_board: data.tenth_board || '',
                    tenth_passing_year: data.tenth_passing_year || '',
                    tenth_percentage: data.tenth_percentage || '',
                    twelfth_board: data.twelfth_board || '',
                    twelfth_passing_year: data.twelfth_passing_year || '',
                    twelfth_percentage: data.twelfth_percentage || '',
                    entrance_exams: Array.isArray(data.entrance_exams) ? data.entrance_exams : (data.entrance_exams ? JSON.parse(data.entrance_exams) : []),
                    preferred_courses: Array.isArray(data.preferred_courses) ? data.preferred_courses : (data.preferred_courses ? JSON.parse(data.preferred_courses) : []),
                    preferred_locations: Array.isArray(data.preferred_locations) ? data.preferred_locations : (data.preferred_locations ? JSON.parse(data.preferred_locations) : []),
                    budget_range: data.budget_range || '',
                    account_type: data.account_type || 'free',
                    subscription_status: data.subscription_status || null
                });
            } else {
                setProfileData(prev => ({ 
                    ...prev, 
                    full_name: user.user_metadata?.full_name || '',
                    email: user.email || '',
                    phone_number: user.phone || ''
                }));
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            clearTimeout(timeout);
        }
    }, [user]);

    const fetchReviews = useCallback(async () => {
        setLoadingReviews(true);
        const { data } = await supabase
            .from('reviews')
            .select('id, college_id, rating, title, review_text, moderation_status, created_at, helpful_count, colleges(name, slug)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        setReviews(data || []);
        setLoadingReviews(false);
    }, [user]);

    const fetchSaved = useCallback(async () => {
        setLoadingSaved(true);
        const { data } = await supabase
            .from('saved_colleges')
            .select('id, created_at, colleges(id, slug, name, location_city, location_state, rating, type, image)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        setSavedColleges(data || []);
        setLoadingSaved(false);
    }, [user]);

    const fetchNeetPlans = useCallback(async () => {
        setLoadingAI(true);
        const { data } = await supabase
            .from('user_neet_plans')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        setNeetPlans(data || []);
        setLoadingAI(false);
    }, [user]);

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

    const handleCancelSubscription = async () => {
        setIsCancelling(true);
        const loadingToast = toast.loading('Cancelling subscription...');
        try {
            const res = await fetch('/api/razorpay/cancel-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Subscription cancelled. No further charges will be made.', { id: loadingToast });
                setProfileData(prev => ({ ...prev, account_type: 'free', subscription_status: 'cancelled' }));
                setShowCancelModal(false);
            } else {
                throw new Error(data.error || 'Failed to cancel');
            }
        } catch (error) {
            toast.error(error.message, { id: loadingToast });
        } finally {
            setIsCancelling(false);
        }
    };

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        const loadingToast = toast.loading('Saving profile changes...');
        
        try {
            const updates = [];

            // 1. Update Profile table
            updates.push(supabase.from('user_profiles').update({
                full_name: profileData.full_name,
                phone_number: profileData.phone_number,
                state: profileData.state,
                city: profileData.city,
                stream: profileData.stream,
                gender: profileData.gender,
                dob: profileData.dob || null,
                tenth_board: profileData.tenth_board,
                tenth_passing_year: profileData.tenth_passing_year ? parseInt(profileData.tenth_passing_year) : null,
                tenth_percentage: profileData.tenth_percentage ? parseFloat(profileData.tenth_percentage) : null,
                twelfth_board: profileData.twelfth_board,
                twelfth_passing_year: profileData.twelfth_passing_year ? parseInt(profileData.twelfth_passing_year) : null,
                twelfth_percentage: profileData.twelfth_percentage ? parseFloat(profileData.twelfth_percentage) : null,
                entrance_exams: profileData.entrance_exams,
                preferred_courses: profileData.preferred_courses,
                preferred_locations: profileData.preferred_locations,
                budget_range: profileData.budget_range
            }).eq('id', user.id));

            // 2. Update Auth metadata in parallel if changed
            if (profileData.full_name !== user.user_metadata?.full_name) {
                updates.push(supabase.auth.updateUser({
                    data: { full_name: profileData.full_name }
                }));
            }

            // 3. Update Email if changed
            if (profileData.email && profileData.email !== user.email) {
                updates.push(supabase.auth.updateUser({
                    email: profileData.email
                }));
            }

            const results = await Promise.race([
                Promise.all(updates),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Update timed out')), 10000))
            ]);

            // Check for errors in the Supabase responses
            results.forEach(res => {
                if (res?.error) throw res.error;
            });

            toast.success('Profile updated successfully!', { id: loadingToast });
            setIsEditingProfile(false);

            // Enrich TeleCRM lead with profile data (fire-and-forget)
            pushLeadToTeleCRM(
                {
                    name: profileData.full_name,
                    email: user.email,
                    phone: profileData.phone_number,
                    city: profileData.city,
                    state: profileData.state,
                    stream: profileData.stream,
                    status: 'Fresh',
                },
                ['Colleges Profile Updated']
            );
        } catch (err) {
            console.error('Error saving profile:', err);
            toast.error(err.message || 'Failed to save changes. Please try again.', { id: loadingToast });
        } finally {
            setSavingProfile(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleCalculateAll = () => {
        if (!mockScore.trim() || !canUserPredict(role)) return;
        setCalculating(true);
        setTimeout(() => {
            const newPredictions = {};

            savedColleges.forEach(saved => {
                const c = saved.colleges;
                const prediction = categorizePrediction(c, exam.id, parseFloat(mockScore));
                if (prediction.label !== 'Open') {
                    newPredictions[c.id] = prediction;
                }
            });

            setPredictions(newPredictions);
            recordUsage();
            setUsage(getUsage());
            setCalculating(false);
            
            // Push to TeleCRM (fire-and-forget)
            pushLeadToTeleCRM(
                {
                    email: user.email,
                    neet_marks: mockScore, // neet_marks is a standard-ish extra field
                    exam_type: exam.label,
                    status: 'Fresh'
                },
                ['AI Predictor Used', `Exam: ${exam.label}`, `Score: ${mockScore}`]
            );
            
            // Save to session for Detail Page badge
            sessionStorage.setItem('last_prediction', JSON.stringify({ examId: exam.id, score: mockScore }));
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
                        <p className="text-slate-400 text-sm flex items-center gap-2">
                            {user.email}
                            {user.email_confirmed_at ? (
                                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-bold">
                                    <ShieldCheck className="w-3 h-3" /> Verified
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full font-bold">
                                    <AlertCircle className="w-3 h-3" /> Unverified
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* ── Subscription Section ── */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mb-8"
                >
                    <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/20">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                                profileData.account_type === 'pro' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                                profileData.account_type === 'premium' ? 'bg-purple-500/20 text-purple-500 border border-purple-500/30' :
                                'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                                <Sparkles className="w-7 h-7" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-white">Your {profileData.account_type === 'pro' ? 'PLUS' : profileData.account_type?.toUpperCase()} Plan</h2>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        Account Active
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400">Access college predictors, AI plans, and expert reviews.</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3">
                            {profileData.account_type !== 'pro' && (
                                <Link 
                                    to="/pricing" 
                                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-red-900/20 whitespace-nowrap flex items-center justify-center"
                                >
                                    Upgrade Plan
                                </Link>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 mb-6 w-fit min-w-full sm:min-w-0">
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dashboard Tab */}
                {activeTab === 'Dashboard' && (
                    <div className="space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex items-center justify-between">
                            <div className="relative z-10">
                                <h2 className="text-xl font-black text-white mb-1">Welcome back, {user.user_metadata?.full_name?.split(' ')[0] || 'Student'}!</h2>
                                <p className="text-slate-400 text-sm">Your college search is {savedColleges.length > 0 ? 'progressing well' : 'just beginning'}.</p>
                            </div>
                            <div className="hidden sm:flex relative z-10 items-center justify-center w-14 h-14 bg-red-600/20 text-red-500 rounded-full border border-red-500/20">
                                <span className="text-2xl font-bold">{savedColleges.length}</span>
                            </div>
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-600/10 blur-3xl rounded-full pointer-events-none" />
                        </div>

                        {savedColleges.length > 0 && !loadingSaved && (
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                                                <Trophy className="w-5 h-5 text-amber-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">Admission Chances</h3>
                                                <p className="text-slate-500 text-xs">Based on your shortlisted colleges</p>
                                            </div>
                                        </div>
                                        {isPremium && !isPro && (
                                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded-lg border border-slate-700">
                                                Used <span className="text-white font-bold">{usage.count}/5</span> today
                                            </span>
                                        )}
                                    </div>

                                    {isGated ? (
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <Lock className="w-5 h-5 text-amber-500/50" />
                                                <p className="text-slate-400 text-sm">Upgrade to Premium to unlock Safe/Moderate/Risky indicators.</p>
                                            </div>
                                            <Link to="/pricing" className="text-amber-500 text-sm font-bold hover:text-amber-400 transition-colors">Upgrade Now →</Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-2">Select Exam</label>
                                                    <select 
                                                        value={exam.id} 
                                                        onChange={(e) => setExam(EXAMS.find(ex => ex.id === e.target.value))}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500/40 text-sm appearance-none cursor-pointer"
                                                    >
                                                        {EXAMS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-2">Enter {exam.field}</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="number"
                                                            value={mockScore}
                                                            onChange={(e) => setMockScore(e.target.value)}
                                                            placeholder={exam.unit}
                                                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500/40 text-sm"
                                                        />
                                                        <button
                                                            onClick={handleCalculateAll}
                                                            disabled={calculating || !mockScore.trim() || (isPremium && !isPro && usage.count >= 5)}
                                                            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-slate-950 px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap text-sm"
                                                        >
                                                            {calculating ? (
                                                                <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                                                            ) : (
                                                                <><Search className="w-4 h-4" /> Predict</>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div>
                            <div className="flex items-center justify-between mb-4 mt-2">
                                <h3 className="text-lg font-bold text-white">Shortlisted Colleges</h3>
                                {savedColleges.length > 3 && (
                                    <button onClick={() => setActiveTab('Saved Colleges')} className="text-sm text-red-400 hover:text-red-300 font-medium">View All</button>
                                )}
                            </div>
                            
                            <div className="space-y-3">
                                {loadingSaved ? (
                                    [...Array(2)].map((_, i) => <div key={i} className="h-20 bg-slate-900 rounded-2xl animate-pulse" />)
                                ) : savedColleges.length === 0 ? (
                                    <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl text-slate-500">
                                        <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                        <p>You haven't actively saved/shortlisted any colleges yet.</p>
                                        <Link to="/colleges" className="mt-2 inline-block text-red-400 hover:text-red-300 text-sm font-medium">Explore colleges →</Link>
                                    </div>
                                ) : savedColleges.slice(0, 3).map(saved => {
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
                                                    <div className={`px-3 py-1 border rounded-lg text-[10px] font-black animate-in fade-in zoom-in-95 ${prediction.bg} ${prediction.color} ${prediction.border}`}>
                                                        {prediction.label.toUpperCase()}
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
                    </div>
                )}

                {/* Account Settings Tab */}
                {activeTab === 'Account Settings' && (
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
                                <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Email Address</label>
                                {isEditingProfile ? (
                                    <input type="email" value={profileData.email} onChange={e => setProfileData(p => ({ ...p, email: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50" />
                                ) : (
                                    <p className="text-slate-200 bg-slate-800/20 px-4 py-2.5 rounded-xl border border-transparent">{profileData.email || 'Not provided'}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Phone Number <span className="text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded ml-2 normal-case">Fixed</span></label>
                                <p className="text-slate-400 bg-slate-950/50 px-4 py-2.5 rounded-xl border border-transparent cursor-not-allowed">{profileData.phone_number || 'Not provided'}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Gender</label>
                                {isEditingProfile ? (
                                    <select value={profileData.gender} onChange={e => setProfileData(p => ({ ...p, gender: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50">
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                        <option value="Prefer not to say">Prefer not to say</option>
                                    </select>
                                ) : (
                                    <p className="text-slate-200 bg-slate-800/20 px-4 py-2.5 rounded-xl border border-transparent">{profileData.gender || 'Not provided'}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Date of Birth</label>
                                {isEditingProfile ? (
                                    <input type="date" value={profileData.dob} onChange={e => setProfileData(p => ({ ...p, dob: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50 [color-scheme:dark]" />
                                ) : (
                                    <p className="text-slate-200 bg-slate-800/20 px-4 py-2.5 rounded-xl border border-transparent">{profileData.dob ? new Date(profileData.dob).toLocaleDateString() : 'Not provided'}</p>
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

                        {/* Education Details Section */}
                        <div className="pt-6 border-t border-slate-800 space-y-6">
                            <h4 className="text-sm font-bold text-white mb-2">Education Details</h4>

                            <div className="grid md:grid-cols-3 gap-6">
                                {/* 10th Details */}
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">10th Board</label>
                                    {isEditingProfile ? (
                                        <input value={profileData.tenth_board} onChange={e => setProfileData(p => ({ ...p, tenth_board: e.target.value }))} placeholder="CBSE, ICSE, State Board" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50" />
                                    ) : (
                                        <p className="text-slate-200 bg-slate-800/20 px-4 py-2.5 rounded-xl border border-transparent truncate">{profileData.tenth_board || '—'}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">10th Passing Year</label>
                                    {isEditingProfile ? (
                                        <input type="number" value={profileData.tenth_passing_year} onChange={e => setProfileData(p => ({ ...p, tenth_passing_year: e.target.value }))} placeholder="YYYY" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50" />
                                    ) : (
                                        <p className="text-slate-200 bg-slate-800/20 px-4 py-2.5 rounded-xl border border-transparent">{profileData.tenth_passing_year || '—'}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">10th Percentage</label>
                                    {isEditingProfile ? (
                                        <input type="number" step="0.01" value={profileData.tenth_percentage} onChange={e => setProfileData(p => ({ ...p, tenth_percentage: e.target.value }))} placeholder="%" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50" />
                                    ) : (
                                        <p className="text-slate-200 bg-slate-800/20 px-4 py-2.5 rounded-xl border border-transparent">{profileData.tenth_percentage ? `${profileData.tenth_percentage}%` : '—'}</p>
                                    )}
                                </div>

                                {/* 12th Details */}
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">12th Board</label>
                                    {isEditingProfile ? (
                                        <input value={profileData.twelfth_board} onChange={e => setProfileData(p => ({ ...p, twelfth_board: e.target.value }))} placeholder="CBSE, ICSE, State Board" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50" />
                                    ) : (
                                        <p className="text-slate-200 bg-slate-800/20 px-4 py-2.5 rounded-xl border border-transparent truncate">{profileData.twelfth_board || '—'}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">12th Passing Year</label>
                                    {isEditingProfile ? (
                                        <input type="number" value={profileData.twelfth_passing_year} onChange={e => setProfileData(p => ({ ...p, twelfth_passing_year: e.target.value }))} placeholder="YYYY" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50" />
                                    ) : (
                                        <p className="text-slate-200 bg-slate-800/20 px-4 py-2.5 rounded-xl border border-transparent">{profileData.twelfth_passing_year || '—'}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">12th Percentage</label>
                                    {isEditingProfile ? (
                                        <input type="number" step="0.01" value={profileData.twelfth_percentage} onChange={e => setProfileData(p => ({ ...p, twelfth_percentage: e.target.value }))} placeholder="%" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50" />
                                    ) : (
                                        <p className="text-slate-200 bg-slate-800/20 px-4 py-2.5 rounded-xl border border-transparent">{profileData.twelfth_percentage ? `${profileData.twelfth_percentage}%` : '—'}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Entrance Exams Section */}
                        <div className="pt-6 border-t border-slate-800 space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-bold text-white">Entrance Exams</h4>
                                {isEditingProfile && (
                                    <button
                                        onClick={() => setProfileData(p => ({ ...p, entrance_exams: [...p.entrance_exams, { exam: '', score: '', rank: '' }] }))}
                                        className="text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1 bg-red-500/10 rounded"
                                    >
                                        + Add Exam
                                    </button>
                                )}
                            </div>

                            {profileData.entrance_exams.length === 0 ? (
                                <p className="text-slate-500 text-sm">No entrance exams added.</p>
                            ) : (
                                <div className="space-y-3">
                                    {profileData.entrance_exams.map((exam, index) => (
                                        <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 items-end bg-slate-950 p-3 rounded-xl border border-slate-800">
                                            <div className="flex-1 min-w-[120px]">
                                                {isEditingProfile && <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Exam Name</label>}
                                                {isEditingProfile ? (
                                                    <input value={exam.exam} onChange={e => {
                                                        const newExams = [...profileData.entrance_exams];
                                                        newExams[index].exam = e.target.value;
                                                        setProfileData(p => ({ ...p, entrance_exams: newExams }));
                                                    }} placeholder="e.g. JEE Main" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-red-500/50 text-sm" />
                                                ) : <span className="text-white font-semibold">{exam.exam || 'Unnamed Exam'}</span>}
                                            </div>
                                            <div className="w-full md:w-32">
                                                {isEditingProfile && <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Score/%ile</label>}
                                                {isEditingProfile ? (
                                                    <input value={exam.score} onChange={e => {
                                                        const newExams = [...profileData.entrance_exams];
                                                        newExams[index].score = e.target.value;
                                                        setProfileData(p => ({ ...p, entrance_exams: newExams }));
                                                    }} placeholder="Score" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-red-500/50 text-sm" />
                                                ) : <span className="text-slate-400 text-sm ml-2">Score: {exam.score || '—'}</span>}
                                            </div>
                                            <div className="w-full md:w-32">
                                                {isEditingProfile && <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Rank</label>}
                                                {isEditingProfile ? (
                                                    <input value={exam.rank} onChange={e => {
                                                        const newExams = [...profileData.entrance_exams];
                                                        newExams[index].rank = e.target.value;
                                                        setProfileData(p => ({ ...p, entrance_exams: newExams }));
                                                    }} placeholder="Rank" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-red-500/50 text-sm" />
                                                ) : <span className="text-slate-400 text-sm ml-2">Rank: {exam.rank || '—'}</span>}
                                            </div>
                                            {isEditingProfile && (
                                                <button onClick={() => {
                                                    setProfileData(p => ({ ...p, entrance_exams: p.entrance_exams.filter((_, i) => i !== index) }));
                                                }} className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg shrink-0">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* College Preferences Section */}
                        <div className="pt-6 border-t border-slate-800 space-y-6">
                            <h4 className="text-sm font-bold text-white mb-2">College Preferences</h4>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Preferred Courses</label>
                                    {isEditingProfile ? (
                                        <input
                                            value={profileData.preferred_courses.join(', ')}
                                            onChange={e => setProfileData(p => ({ ...p, preferred_courses: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                                            placeholder="e.g. B.Tech CSE, BBA, MBBS (comma separated)"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                                        />
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {profileData.preferred_courses.length ? profileData.preferred_courses.map((course, i) => (
                                                <span key={i} className="px-3 py-1 bg-slate-800/50 text-slate-300 text-sm rounded-lg border border-slate-700">{course}</span>
                                            )) : <span className="text-slate-500 text-sm">Not specified</span>}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Preferred Locations</label>
                                    {isEditingProfile ? (
                                        <input
                                            value={profileData.preferred_locations.join(', ')}
                                            onChange={e => setProfileData(p => ({ ...p, preferred_locations: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                                            placeholder="e.g. Mumbai, Pune, Delhi (comma separated)"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50"
                                        />
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {profileData.preferred_locations.length ? profileData.preferred_locations.map((loc, i) => (
                                                <span key={i} className="px-3 py-1 bg-slate-800/50 text-slate-300 text-sm rounded-lg border border-slate-700">{loc}</span>
                                            )) : <span className="text-slate-500 text-sm">Not specified</span>}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Budget Range</label>
                                    {isEditingProfile ? (
                                        <select value={profileData.budget_range} onChange={e => setProfileData(p => ({ ...p, budget_range: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500/50">
                                            <option value="">Select Budget</option>
                                            <option value="< 5 Lakhs">Under 5 Lakhs</option>
                                            <option value="5-10 Lakhs">5 - 10 Lakhs</option>
                                            <option value="10-15 Lakhs">10 - 15 Lakhs</option>
                                            <option value="15-25 Lakhs">15 - 25 Lakhs</option>
                                            <option value="25+ Lakhs">Above 25 Lakhs</option>
                                        </select>
                                    ) : (
                                        <p className="text-slate-200 bg-slate-800/20 px-4 py-2.5 rounded-xl border border-transparent w-full md:w-1/2">{profileData.budget_range || 'Not specified'}</p>
                                    )}
                                </div>
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

                {/* AI Strategies Tab */}
                {activeTab === 'AI Strategies' && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-600/10 to-violet-600/10 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                    <Brain className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white">AI Learning Strategies</h2>
                                    <p className="text-slate-400 text-sm">Your saved AI-generated preparation plans and guides.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {loadingAI ? (
                                [...Array(2)].map((_, i) => <div key={i} className="h-32 bg-slate-900 rounded-2xl animate-pulse" />)
                            ) : neetPlans.length === 0 ? (
                                <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
                                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700/50">
                                        <Sparkles className="w-8 h-8 text-slate-600" />
                                    </div>
                                    <p className="text-slate-400 font-medium">No saved strategies found.</p>
                                    <p className="text-slate-600 text-sm mt-1 mb-6">Create your first personalized study plan with AI.</p>
                                    <Link to="/neet-prep" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all inline-flex items-center gap-2">
                                        Get Your Plan <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            ) : neetPlans.map(plan => (
                                <div key={plan.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group">
                                    <div className="p-5 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center shrink-0 border border-blue-500/20">
                                                <Target className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">NEET Preparation Strategy</h3>
                                                <p className="text-slate-500 text-xs mt-0.5">
                                                    Generated on {new Date(plan.created_at).toLocaleDateString()} · {plan.form_data?.daysLeft} days left
                                                </p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setEditingId(editingId === plan.id ? null : plan.id)}
                                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-700 transition-all flex items-center gap-2"
                                        >
                                            {editingId === plan.id ? 'Close' : 'View Details'}
                                            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${editingId === plan.id ? 'rotate-90' : ''}`} />
                                        </button>
                                    </div>

                                    {editingId === plan.id && (
                                        <div className="px-5 pb-6 pt-2 border-t border-slate-800 bg-slate-900/50 animate-in slide-in-from-top-4 duration-300">
                                            <div className="grid sm:grid-cols-2 gap-4 mb-6 pt-2">
                                                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                                                    <span className="text-[10px] text-slate-500 uppercase font-black block mb-1">Target Score</span>
                                                    <span className="text-lg font-bold text-blue-400">{plan.form_data?.targetScore} / 720</span>
                                                </div>
                                                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                                                    <span className="text-[10px] text-slate-500 uppercase font-black block mb-1">Study Hours</span>
                                                    <span className="text-lg font-bold text-white">{plan.form_data?.studyHours}h per day</span>
                                                </div>
                                            </div>
                                            
                                            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-blue-400 prose-strong:text-white prose-p:text-slate-300">
                                                <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/50 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-300">
                                                    {plan.plan_text}
                                                </div>
                                            </div>

                                            <button 
                                                onClick={async () => {
                                                    if(confirm('Are you sure you want to delete this plan?')) {
                                                        const { error } = await supabase.from('user_neet_plans').delete().eq('id', plan.id);
                                                        if(!error) setNeetPlans(prev => prev.filter(p => p.id !== plan.id));
                                                    }
                                                }}
                                                className="mt-6 flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Delete Strategy
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Cancel Subscription Modal ── */}
            {showCancelModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-slate-900 border border-red-500/30 rounded-3xl w-full max-w-xl shadow-2xl shadow-red-900/20 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-red-600 to-rose-700 p-8 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                    <AlertCircle className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-2xl">Wait! Are you sure?</h3>
                                    <p className="text-red-100 text-sm opacity-90">Confirming your cancellation</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowCancelModal(false)}
                                className="w-10 h-10 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-8">
                            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
                                <h4 className="text-red-400 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Zap className="w-4 h-4" /> You will lose access to:
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        'Full College Predictors',
                                        'Personalized AI Study Plans',
                                        'Priority Support & Counselling',
                                        'Verified Recruiter Stats',
                                        'Unlimited Shortlisting',
                                        'Comparison Engine'
                                    ].map((benefit, i) => (
                                        <div key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                                            {benefit}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                                    <div>
                                        <p className="text-emerald-400 font-bold text-sm">No Further Charges</p>
                                        <p className="text-slate-500 text-xs">Once cancelled, no more money will be deducted from your account.</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        Your {profileData.account_type?.toUpperCase()} features will be deactivated immediately. 
                                        You can re-subscribe anytime from the pricing page.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 pb-8 flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all shadow-lg"
                            >
                                Keep My Benefits
                            </button>
                            <button 
                                onClick={handleCancelSubscription}
                                disabled={isCancelling}
                                className="flex-1 py-4 bg-gradient-to-r from-red-600 to-rose-700 hover:brightness-110 text-white font-black rounded-2xl transition-all shadow-lg shadow-red-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isCancelling ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Cancelling...</>
                                ) : 'Yes, Cancel Now'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
