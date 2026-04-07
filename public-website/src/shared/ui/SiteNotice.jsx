import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cookie, ShieldCheck } from 'lucide-react';

const CONSENT_KEY = 'edumetra_cookie_consent';

const SiteNotice = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem(CONSENT_KEY);
        if (!consent) {
            // Delay showing the banner slightly for better UX
            const timer = setTimeout(() => setIsVisible(true), 2500);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem(CONSENT_KEY, 'accepted');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                    className="fixed bottom-0 left-0 right-0 z-[9999] p-4 pointer-events-none"
                    style={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
                >
                    <div className="max-w-5xl mx-auto pointer-events-auto">
                        <div className="bg-slate-900 border border-slate-700/60 shadow-2xl rounded-2xl p-5 md:p-6 sm:flex sm:items-center sm:justify-between gap-6 relative overflow-hidden backdrop-blur-xl">
                            {/* Subtle background glow */}
                            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"></div>
                            
                            <div className="flex items-start gap-4 flex-1">
                                <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl hidden sm:flex shrink-0">
                                    <Cookie className="w-6 h-6" />
                                </div>
                                <div className="space-y-1 z-10">
                                    <h4 className="text-white font-bold flex items-center gap-2">
                                        We value your privacy <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    </h4>
                                    <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
                                        Edumetra uses functional and analytical cookies to provide you with the best experience, 
                                        synchronize your sessions flawlessly across our platforms, and personalize insights. 
                                        By using our website, you agree to our use of cookies.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3 shrink-0 z-10 w-full sm:w-auto">
                                <button 
                                    onClick={() => setIsVisible(false)}
                                    className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-sm font-semibold transition-colors flex-1 sm:flex-none"
                                >
                                    Decline Optional
                                </button>
                                <button 
                                    onClick={acceptCookies}
                                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all flex-1 sm:flex-none"
                                >
                                    Accept All Cookies
                                </button>
                                <button 
                                    onClick={() => setIsVisible(false)}
                                    className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-white rounded-lg sm:hidden bg-slate-800"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SiteNotice;
