import React from 'react';
import { useSignup } from '../../contexts/SignupContext';
import { Lock, LogIn, UserPlus } from 'lucide-react';
import Button from '../ui/Button';

const AuthGuard = ({ children }) => {
    const { user, loading, openAuth } = useSignup();

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center space-y-8 p-12 bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-2xl">
                    <div className="relative mx-auto w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center group overflow-hidden">
                        <div className="absolute inset-0 bg-red-500/20 blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                        <Lock className="w-12 h-12 text-red-500 relative z-10 animate-pulse" />
                    </div>
                    
                    <div className="space-y-4">
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">
                            Sign in to <span className="text-red-500">Unlock</span>
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            This feature is exclusive to our registered students. Join us today to access personalized predictors and tools.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <Button
                            onClick={() => openAuth('login')}
                            variant="secondary"
                            className="flex items-center justify-center gap-2 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl border border-slate-700 transition-all active:scale-95"
                        >
                            <LogIn className="w-5 h-5" />
                            Sign In
                        </Button>
                        <Button
                            onClick={() => openAuth('signup')}
                            variant="primary"
                            className="flex items-center justify-center gap-2 py-4 bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 rounded-2xl transition-all active:scale-95"
                        >
                            <UserPlus className="w-5 h-5" />
                            Sign Up
                        </Button>
                    </div>

                    <div className="pt-6 border-t border-slate-800/50">
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold italic">
                            10,000+ students already joined
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return children;
};

export default AuthGuard;
