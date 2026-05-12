import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/AuthProvider';
import { supabase } from '../services/supabaseClient';
import { User, Mail, Save, Pencil, LogOut, ArrowLeft, X, AlertCircle, Zap, ShieldCheck, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { pushLeadToTeleCRM } from '../services/telecrm';

const DashboardPage = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    
    const [profile, setProfile] = useState({
        full_name: '',
        phone_number: '',
        state: '',
        city: '',
        gender: '',
        dob: '',
        stream: '',
        account_type: 'free'
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        
        const fetchProfile = async () => {
            try {
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                
                if (data) {
                    setProfile({
                        full_name: data.full_name || user.user_metadata?.full_name || '',
                        phone_number: data.phone_number || '',
                        state: data.state || '',
                        city: data.city || '',
                        gender: data.gender || '',
                        dob: data.dob || '',
                        stream: data.stream || '',
                        account_type: data.account_type || 'free'
                    });
                } else if (user.user_metadata?.full_name) {
                    setProfile(prev => ({ ...prev, full_name: user.user_metadata.full_name }));
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchProfile();
    }, [user, navigate]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        
        try {
            const { error } = await supabase
                .from('user_profiles')
                .update({
                    full_name: profile.full_name,
                    phone_number: profile.phone_number,
                    state: profile.state,
                    city: profile.city,
                    gender: profile.gender,
                    dob: profile.dob || null,
                    stream: profile.stream
                })
            if (error) throw error;
            
            // TeleCRM Integration
            try {
                pushLeadToTeleCRM({
                    name: profile.full_name,
                    phone: profile.phone_number,
                    email: user.email,
                    city: profile.city,
                    state: profile.state,
                    status: 'Fresh'
                }, ['Profile Updated']);
            } catch (e) {}
            
            setMessage('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const handleCancelSubscription = async () => {
        setIsCancelling(true);
        setMessage('Cancelling subscription...');
        try {
            const res = await fetch('/api/razorpay/cancel-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            });

            const data = await res.json();
            if (data.success) {
                setMessage('Subscription cancelled successfully. No further charges will be made.');
                setProfile(prev => ({ ...prev, account_type: 'free' }));
                setShowCancelModal(false);
            } else {
                throw new Error(data.error || 'Failed to cancel subscription');
            }
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setIsCancelling(false);
            setTimeout(() => setMessage(''), 5000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center pt-20">
                <div className="w-8 h-8 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <>
            <SEO page="dashboard" />
            <div className="min-h-screen bg-slate-950 pt-32 pb-20 px-4">
                <div className="max-w-3xl mx-auto">
                    <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>

                    <div className="flex items-center gap-5 mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-rose-700 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-red-900/30">
                            {user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || <User className="w-8 h-8 text-white/50" />}
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-white">{profile.full_name || 'Student Profile'}</h1>
                            <p className="text-slate-400 flex items-center gap-2 mt-1">
                                <Mail className="w-4 h-4" /> {user?.email}
                                {user?.email_confirmed_at ? (
                                    <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-bold">
                                        <ShieldCheck className="w-3 h-3" /> Verified
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full font-bold">
                                        <AlertCircle className="w-3 h-3" /> Unverified Email
                                    </span>
                                )}
                                <span className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    profile.account_type === 'pro' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                    profile.account_type === 'premium' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                    'bg-slate-800 text-slate-300 border border-slate-700'
                                }`}>
                                    {profile.account_type.toUpperCase()}
                                </span>
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
                                    profile.account_type === 'pro' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                                    profile.account_type === 'premium' ? 'bg-purple-500/20 text-purple-500 border border-purple-500/30' :
                                    'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}>
                                    <Save className="w-7 h-7" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-bold text-white">Your {profile.account_type.toUpperCase()} Plan</h2>
                                    </div>
                                    <p className="text-sm text-slate-400">Manage your subscription and billing details.</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3">
                                {profile.account_type !== 'pro' && (
                                    <Link 
                                        to="/pricing" 
                                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-red-900/20 whitespace-nowrap flex items-center justify-center"
                                    >
                                        Upgrade Plan
                                    </Link>
                                )}
                                {profile.account_type !== 'free' && (
                                    <button 
                                        type="button"
                                        onClick={() => setShowCancelModal(true)}
                                        className="px-6 py-3 bg-slate-800 hover:bg-red-900/30 text-red-400 hover:text-red-300 font-bold text-sm rounded-xl border border-slate-700 hover:border-red-900/50 transition-all whitespace-nowrap"
                                    >
                                        Cancel Subscription
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Personal Info Section ── */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
                    >
                        <div className="p-6 md:p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                            <div>
                                <h2 className="text-xl font-bold text-white">Personal Information</h2>
                                <p className="text-sm text-slate-400">Update your student profile details.</p>
                            </div>
                            {!isEditing ? (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors"
                                >
                                    <Pencil className="w-4 h-4" /> Edit Profile
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 hover:text-white text-sm font-semibold rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>

                        <div className="p-6 md:p-8">
                            {message && (
                                <div className={`mb-6 p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${message.includes('Error') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Full Name</label>
                                    {isEditing ? (
                                        <input 
                                            value={profile.full_name} 
                                            onChange={e => setProfile({...profile, full_name: e.target.value})} 
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500 transition-colors" 
                                            required
                                        />
                                    ) : (
                                        <div className="px-4 py-2.5 bg-slate-950 rounded-xl text-slate-300 border border-transparent">{profile.full_name || 'Not provided'}</div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Phone Number</label>
                                    {isEditing ? (
                                        <input 
                                            value={profile.phone_number} 
                                            onChange={e => setProfile({...profile, phone_number: e.target.value})} 
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500 transition-colors" 
                                            placeholder="+91"
                                        />
                                    ) : (
                                        <div className="px-4 py-2.5 bg-slate-950 rounded-xl text-slate-300 border border-transparent">{profile.phone_number || 'Not provided'}</div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Gender</label>
                                    {isEditing ? (
                                        <select 
                                            value={profile.gender} 
                                            onChange={e => setProfile({...profile, gender: e.target.value})} 
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500 transition-colors"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    ) : (
                                        <div className="px-4 py-2.5 bg-slate-950 rounded-xl text-slate-300 border border-transparent">{profile.gender || 'Not provided'}</div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Date of Birth</label>
                                    {isEditing ? (
                                        <input 
                                            type="date" 
                                            value={profile.dob} 
                                            onChange={e => setProfile({...profile, dob: e.target.value})} 
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500 transition-colors [color-scheme:dark]" 
                                        />
                                    ) : (
                                        <div className="px-4 py-2.5 bg-slate-950 rounded-xl text-slate-300 border border-transparent">{profile.dob ? new Date(profile.dob).toLocaleDateString() : 'Not provided'}</div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">City</label>
                                    {isEditing ? (
                                        <input 
                                            value={profile.city} 
                                            onChange={e => setProfile({...profile, city: e.target.value})} 
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500 transition-colors" 
                                            placeholder="e.g. Mumbai"
                                        />
                                    ) : (
                                        <div className="px-4 py-2.5 bg-slate-950 rounded-xl text-slate-300 border border-transparent">{profile.city || 'Not provided'}</div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">State</label>
                                    {isEditing ? (
                                        <select 
                                            value={profile.state} 
                                            onChange={e => setProfile({...profile, state: e.target.value})} 
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500 transition-colors"
                                        >
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
                                        <div className="px-4 py-2.5 bg-slate-950 rounded-xl text-slate-300 border border-transparent">{profile.state || 'Not provided'}</div>
                                    )}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Target Stream</label>
                                    {isEditing ? (
                                        <select 
                                            value={profile.stream} 
                                            onChange={e => setProfile({...profile, stream: e.target.value})} 
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500 transition-colors"
                                        >
                                            <option value="">Select Stream</option>
                                            <option value="Engineering">Engineering</option>
                                            <option value="Medical">Medical</option>
                                            <option value="Management">Management</option>
                                            <option value="Arts">Arts</option>
                                            <option value="Commerce">Commerce</option>
                                            <option value="Law">Law</option>
                                        </select>
                                    ) : (
                                        <div className="px-4 py-2.5 bg-slate-950 rounded-xl text-slate-300 border border-transparent">{profile.stream || 'Not specified'}</div>
                                    )}
                                </div>

                                {isEditing && (
                                    <div className="md:col-span-2 pt-4 border-t border-slate-800 flex justify-end">
                                        <button 
                                            type="submit" 
                                            disabled={saving}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/20 disabled:opacity-50"
                                        >
                                            {saving ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <><Save className="w-5 h-5" /> Save Changes</>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </motion.div>

                    <div className="mt-6 flex justify-end">
                        <button 
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-red-400 font-semibold rounded-xl transition-all"
                        >
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
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

                                <div className="flex items-center gap-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                                    <div>
                                        <p className="text-emerald-400 font-bold text-sm">No Further Charges</p>
                                        <p className="text-slate-500 text-xs">Once cancelled, no more money will be deducted from your account.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-8 pb-8 flex flex-col sm:flex-row gap-4">
                                <button 
                                    onClick={() => setShowCancelModal(true)}
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
        </>
    );
};

export default DashboardPage;
