import { useState } from 'react';
import { X, GraduationCap, Mail, User, Lock, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSignup } from '../contexts/SignupContext';

export default function SignupModal({ isOpen, onClose }) {
    const [isLogin, setIsLogin] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { closeModal } = useSignup();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.name,
                        },
                    },
                });
                if (error) throw error;
            }

            closeModal();
            onClose && onClose(); // Handle both context close and prop close
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="relative bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-slate-800">
                {/* Close button */}
                <button
                    onClick={() => { closeModal(); onClose && onClose(); }}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                    aria-label="Close modal"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-600/20 p-4 rounded-full border border-blue-500/20">
                        <GraduationCap className="w-10 h-10 text-blue-500" />
                    </div>
                </div>

                {/* Header */}
                <h2 className="text-2xl font-bold text-center mb-2 text-white">
                    {isLogin ? 'Welcome Back' : 'Join College Explorer'}
                </h2>
                <p className="text-slate-400 text-center mb-6 text-sm">
                    {isLogin
                        ? 'Sign in to access your saved colleges and recommendations'
                        : 'Create a free account to unlock personalized recommendations'}
                </p>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg mb-4 text-center">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label htmlFor="name" className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required={!isLogin}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="john@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Min. 6 characters"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {isLogin ? <LogIn className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </>
                        )}
                    </button>
                </form>

                {/* Footer / Toggle */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(null); }}
                        className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
                    >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
}
