import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../features/auth/AuthProvider';
import { supabase } from '../services/supabaseClient';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';

const ResetPasswordPage = () => {
    const { updatePassword } = useAuth();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // Supabase sets the session in the hash automatically
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "PASSWORD_RECOVERY") {
                // User has successfully clicked the recovery link
            }
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        setError('');

        const { error } = await updatePassword(password);

        if (error) {
            setError(error);
            setLoading(false);
        } else {
            setSuccess('Password updated successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
    };

    return (
        <>
            <SEO page="reset-password" />
            <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
                <motion.div
                    className="max-w-md w-full space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            Set New Password
                        </h2>
                        <p className="text-slate-400">
                            Please enter your new password below.
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-lg text-emerald-400">
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                    className="w-full pl-10 pr-12 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !password}
                            className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </>
    );
};

export default ResetPasswordPage;
