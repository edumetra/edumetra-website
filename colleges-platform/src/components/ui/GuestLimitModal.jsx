import React from 'react';
import { Sparkles, LogIn, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSignup } from '../../contexts/SignupContext';

const GuestLimitModal = ({ isOpen }) => {
    const { openSignIn, openSignUp } = useSignup();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header Image/Pattern */}
                        <div className="h-32 bg-gradient-to-br from-indigo-600 to-purple-800 relative">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center w-16 h-16 bg-slate-900 border-[4px] border-slate-900 rounded-2xl rotate-12">
                                <Sparkles className="w-8 h-8 text-indigo-400 -rotate-12" />
                            </div>
                        </div>

                        <div className="px-8 pt-12 pb-8 text-center space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Enjoying Edumetra?</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    You've explored a few colleges today! Log in or create a free account to unlock unlimited access to cutoffs, reviews, and personalized admission insights.
                                </p>
                            </div>

                            <div className="space-y-3 pt-2">
                                <button
                                    onClick={openSignUp}
                                    className="flex w-full items-center justify-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] active:scale-[0.98]"
                                >
                                    <UserPlus className="w-5 h-5" />
                                    Sign Up for Free
                                </button>

                                <button
                                    onClick={openSignIn}
                                    className="flex w-full items-center justify-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-colors"
                                >
                                    <LogIn className="w-5 h-5" />
                                    Log In to Continue
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default GuestLimitModal;
