import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, AlertCircle, CheckCircle, Eye, EyeOff, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '../features/auth/AuthProvider';
import SEO from '../components/SEO';
import { pushLeadToTeleCRM } from '../services/telecrm';

import { motion } from 'framer-motion';
const LoginPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnUrl = searchParams.get('returnUrl') || '/dashboard';
    const { signIn, signInWithGoogle, user } = useAuth();
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Redirect if already logged in
    useEffect(() => {
        if (user) navigate(returnUrl, { replace: true });
    }, [user, navigate, returnUrl]);
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error } = await signIn(formData.identifier, formData.password);

        if (error) {
            setError(error);
            setLoading(false);
        } else {
            setSuccess('Login successful! Redirecting...');
            
            // TeleCRM Integration
            try {
                pushLeadToTeleCRM({ 
                    [formData.identifier.includes('@') ? 'email' : 'phone']: formData.identifier, 
                    status: 'Fresh' 
                }, ['Website Login']);
            } catch (e) {}

            setTimeout(() => {
                navigate(returnUrl);
            }, 1500);
        }
    };

    return (
        <>
            <SEO page="login" />
            <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="max-w-md w-full space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Header Section */}
                    <div className="relative mb-8 pt-2">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1.5">
                                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                                    Welcome Back
                                </h2>
                                <p className="text-slate-400 text-sm md:text-base font-medium">
                                    New here? <Link to="/signup" className="text-primary-400 hover:text-primary-300 transition-colors border-b border-primary-500/30 hover:border-primary-500 pb-0.5">Create an account</Link>
                                </p>
                            </div>
                            <Link 
                                to="/signup" 
                                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-widest border border-white/10 rounded-full transition-all group"
                            >
                                Sign Up 
                                <ArrowLeft className="w-3 h-3 rotate-180 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>

                    <div className="card relative p-0 overflow-hidden">
                        <div className="p-6 md:p-8 space-y-6">
                            {/* Error/Success Messages */}
                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{success}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="identifier" className="block text-sm font-medium text-slate-300 mb-2">
                                Email or Phone Number
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    id="identifier"
                                    name="identifier"
                                    type="text"
                                    required
                                    value={formData.identifier}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="you@example.com or 10-digit phone"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-primary-600 focus:ring-primary-500"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400">
                                    Remember me
                                </label>
                            </div>

                            <Link
                                to="/forgot-password"
                                className="text-sm text-primary-400 hover:text-primary-300"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-semibold rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-slate-400 mt-8">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-semibold">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </motion.div>
    </div>
</>
    );
};

export default LoginPage;
