import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/AuthProvider';
import { supabase } from '../services/supabaseClient';
import { User, Mail, Save, Pencil, LogOut, ArrowLeft } from 'lucide-react';
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
        if (!window.confirm('Are you sure you want to cancel your active subscription? Your pro features will be removed immediately.')) {
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/razorpay/cancel-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            });

            const data = await res.json();
            if (data.success) {
                setMessage('Subscription cancelled successfully.');
                setProfile(prev => ({ ...prev, account_type: 'free' }));
            } else {
                throw new Error(data.error || 'Failed to cancel subscription');
            }
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(''), 3000);
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

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
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
                                    <Pencil className="w-4 h-4" /> Edit
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
                                    <label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Account Plan</label>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 px-4 py-2.5 bg-slate-900 rounded-xl text-slate-300 border border-slate-800 flex items-center cursor-not-allowed opacity-80">
                                            <span className={`px-2 py-0.5 rounded-md text-xs font-bold mr-2 ${
                                                profile.account_type === 'pro' ? 'bg-amber-500/20 text-amber-400' :
                                                profile.account_type === 'premium' ? 'bg-purple-500/20 text-purple-400' :
                                                'bg-slate-800 text-slate-300'
                                            }`}>
                                                {profile.account_type.toUpperCase()}
                                            </span>
                                            <span className="text-sm">Plan (Non-editable)</span>
                                        </div>
                                        {profile.account_type !== 'pro' && (
                                            <Link 
                                                to="/pricing" 
                                                className="shrink-0 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-900/20 whitespace-nowrap flex items-center justify-center"
                                            >
                                                Upgrade Now
                                            </Link>
                                        )}
                                        {profile.account_type !== 'free' && (
                                            <button 
                                                type="button"
                                                onClick={handleCancelSubscription}
                                                className="shrink-0 px-4 py-2.5 bg-slate-800 hover:bg-red-900/30 text-red-400 hover:text-red-300 font-bold text-sm rounded-xl border border-slate-700 hover:border-red-900/50 transition-all whitespace-nowrap"
                                            >
                                                Cancel Subscription
                                            </button>
                                        )}
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
            </div>
        </>
    );
};

export default DashboardPage;
