import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/AuthProvider';
import { supabase } from '../services/supabaseClient';
import { User, Mail, Save, Pencil, LogOut, ArrowLeft, ShieldCheck, Loader2, Sparkles, Zap } from 'lucide-react';
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
    
    const [profile, setProfile] = useState({
        full_name: '',
        email: '',
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
                const { data } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                
                if (data) {
                    setProfile({
                        full_name: data.full_name || user.user_metadata?.full_name || '',
                        email: user.email || '',
                        phone_number: user.phone || data.phone_number || '',
                        state: data.state || '',
                        city: data.city || '',
                        gender: data.gender || '',
                        dob: data.dob || '',
                        stream: data.stream || '',
                        account_type: data.account_type || 'free'
                    });
                } else {
                    setProfile(prev => ({ 
                        ...prev, 
                        full_name: user.user_metadata?.full_name || '',
                        email: user.email || '',
                        phone_number: user.phone || ''
                    }));
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
            const { error: profileError } = await supabase
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
                .eq('id', user.id);
            if (profileError) throw profileError;

            if (profile.email && profile.email !== user.email) {
                const { error: authError } = await supabase.auth.updateUser({
                    email: profile.email
                });
                if (authError) throw authError;
                setMessage('Profile updated! Check your new email inbox to confirm the change.');
            } else {
                setMessage('Profile updated successfully!');
            }
            
            try {
                pushLeadToTeleCRM({
                    name: profile.full_name,
                    phone: profile.phone_number,
                    email: profile.email,
                    city: profile.city,
                    state: profile.state,
                    status: 'Fresh'
                }, ['Profile Updated']);
            } catch (e) {}
            
            setIsEditing(false);
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(''), 5000);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center pt-20">
                <div className="w-8 h-8 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    const tierName = profile.account_type === 'pro' ? 'Plus' : profile.account_type.charAt(0).toUpperCase() + profile.account_type.slice(1);

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
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-slate-400 flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> {user?.email}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    profile.account_type === 'pro' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                    profile.account_type === 'premium' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                    'bg-slate-800 text-slate-300 border border-slate-700'
                                }`}>
                                    {tierName}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── Account Status Card ── */}
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
                                    {profile.account_type === 'free' ? <User className="w-7 h-7" /> : <Zap className="w-7 h-7" />}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{tierName} Account</h2>
                                    <p className="text-sm text-slate-400">
                                        {profile.account_type === 'free' ? 'Upgrade to unlock premium features.' : 'One-time payment lifetime access active.'}
                                    </p>
                                </div>
                            </div>
                            
                            {profile.account_type !== 'pro' && (
                                <Link 
                                    to="/pricing" 
                                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-red-900/20 whitespace-nowrap text-center"
                                >
                                    {profile.account_type === 'free' ? 'Upgrade Now' : 'Upgrade to Plus'}
                                </Link>
                            )}
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
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Email Address</label>
                                    {isEditing ? (
                                        <input 
                                            type="email"
                                            value={profile.email} 
                                            onChange={e => setProfile({...profile, email: e.target.value})} 
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500 transition-colors" 
                                            required
                                        />
                                    ) : (
                                        <div className="px-4 py-2.5 bg-slate-950 rounded-xl text-slate-300 border border-transparent">{profile.email || 'Not provided'}</div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Phone Number</label>
                                    <div className="px-4 py-2.5 bg-slate-950/50 rounded-xl text-slate-400 border border-transparent cursor-not-allowed">
                                        {profile.phone_number || 'Not provided'}
                                    </div>
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
                                            <option value="Maharashtra">Maharashtra</option>
                                            <option value="Karnataka">Karnataka</option>
                                            <option value="Tamil Nadu">Tamil Nadu</option>
                                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    ) : (
                                        <div className="px-4 py-2.5 bg-slate-950 rounded-xl text-slate-300 border border-transparent">{profile.state || 'Not provided'}</div>
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
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardPage;
