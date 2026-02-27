import { useState, useEffect } from 'react';
import { X, GraduationCap, Mail, User, Lock, LogIn, Phone, ArrowLeft, KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSignup } from '../contexts/SignupContext';

// view: 'signup' | 'login' | 'forgot'
export default function SignupModal({ isOpen, onClose }) {
    const { closeModal, modalMode } = useSignup();
    const [view, setView] = useState('signup');
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Sync with modalMode whenever the modal opens or mode changes
    useEffect(() => {
        if (isOpen) {
            setView(modalMode === 'login' ? 'login' : 'signup');
            setError(null);
            setSuccessMsg(null);
            setFormData({ name: '', email: '', phone: '', password: '' });
        }
    }, [isOpen, modalMode]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            if (view === 'login') {
                const { error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });
                if (error) throw error;
                closeModal();
                onClose && onClose();

            } else if (view === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: { data: { full_name: formData.name, phone: formData.phone } },
                });
                if (error) throw error;
                setSuccessMsg('Account created! Please check your email to verify your address, then sign in.');

            } else if (view === 'forgot') {
                const redirectTo = `${window.location.origin}/reset-password`;
                const { error } = await supabase.auth.resetPasswordForEmail(formData.email, { redirectTo });
                if (error) throw error;
                setSuccessMsg(`Check your inbox — we've sent a password reset link to ${formData.email}`);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleClose = () => {
        closeModal();
        onClose && onClose();
    };

    const switchView = (newView) => {
        setView(newView);
        setError(null);
        setSuccessMsg(null);
    };

    const headers = {
        signup: {
            title: 'Join Edumetra Colleges',
            sub: 'Create a free account to unlock personalised college recommendations',
        },
        login: {
            title: 'Welcome Back',
            sub: 'Sign in to access your saved colleges and recommendations',
        },
        forgot: {
            title: 'Reset Password',
            sub: "Enter your email and we'll send you a reset link",
        },
    };

    const { title, sub } = headers[view];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="relative bg-[#0f1629] rounded-2xl shadow-2xl shadow-black/60 max-w-md w-full p-8 border border-white/10">

                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/8"
                    aria-label="Close modal"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="bg-red-500/15 p-4 rounded-2xl border border-red-500/20">
                        {view === 'forgot'
                            ? <KeyRound className="w-9 h-9 text-red-400" />
                            : <GraduationCap className="w-9 h-9 text-red-400" />
                        }
                    </div>
                </div>

                {/* Header */}
                <h2 className="text-2xl font-bold text-center mb-1.5 text-white">{title}</h2>
                <p className="text-slate-400 text-center mb-6 text-sm">{sub}</p>

                {/* Success */}
                {successMsg && (
                    <div className="bg-green-500/10 border border-green-500/25 text-green-400 text-sm p-3 rounded-xl mb-4 text-center">
                        {successMsg}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-4 text-center">
                        {error}
                    </div>
                )}

                {/* ── FORGOT PASSWORD VIEW ── */}
                {view === 'forgot' && (
                    <>
                        {!successMsg && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="forgot-email" className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                        <input
                                            autoFocus
                                            type="email"
                                            id="forgot-email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/40 transition-all text-sm"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.02] mt-2"
                                >
                                    {loading
                                        ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        : <><Mail className="w-4 h-4" /> Send Reset Link</>
                                    }
                                </button>
                            </form>
                        )}

                        <button
                            type="button"
                            onClick={() => switchView('login')}
                            className="w-full flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors mt-4"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                        </button>
                    </>
                )}

                {/* ── SIGN IN / SIGN UP VIEWS ── */}
                {view !== 'forgot' && (
                    <>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Name — signup only */}
                            {view === 'signup' && (
                                <div>
                                    <label htmlFor="name" className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/40 transition-all text-sm"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/40 transition-all text-sm"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            {/* Phone — signup only */}
                            {view === 'signup' && (
                                <div>
                                    <label htmlFor="phone" className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                                        Phone Number <span className="text-slate-600 normal-case font-normal">(optional)</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/40 transition-all text-sm"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Password
                                    </label>
                                    {view === 'login' && (
                                        <button
                                            type="button"
                                            onClick={() => switchView('forgot')}
                                            className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                                        >
                                            Forgot password?
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/40 transition-all text-sm"
                                        placeholder="Min. 6 characters"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !!successMsg}
                                className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.02] mt-2"
                            >
                                {loading
                                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : <>
                                        {view === 'login' ? <LogIn className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
                                        {view === 'login' ? 'Sign In' : 'Create Account'}
                                    </>
                                }
                            </button>
                        </form>

                        {/* Toggle sign in <-> sign up */}
                        <div className="mt-5 text-center">
                            <button
                                onClick={() => switchView(view === 'login' ? 'signup' : 'login')}
                                className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
                            >
                                {view === 'login'
                                    ? <span>Don&apos;t have an account? <span className="text-red-400 hover:text-red-300 font-semibold">Sign Up</span></span>
                                    : <span>Already have an account? <span className="text-red-400 hover:text-red-300 font-semibold">Sign In</span></span>
                                }
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
