import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Server, ArrowRight, X, Sparkles, RefreshCw } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = !!supabaseUrl && 
    !!supabaseAnonKey && 
    supabaseUrl !== 'YOUR_SUPABASE_URL' && 
    supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
    supabaseUrl.trim() !== '' &&
    supabaseAnonKey.trim() !== '';


const DISMISS_KEY = 'edumetra_supabase_warning_dismissed';

export default function CredentialsWarningBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only show if not configured AND not dismissed in current session
        if (!isConfigured) {
            try {
                const dismissed = sessionStorage.getItem(DISMISS_KEY);
                if (!dismissed) {
                    setIsVisible(true);
                }
            } catch (e) {
                setIsVisible(true);
            }
        }
    }, []);

    const handleDismiss = () => {
        try {
            sessionStorage.setItem(DISMISS_KEY, 'true');
        } catch (e) {
            console.warn('sessionStorage setItem blocked:', e);
        }
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 120 }}
                    className="fixed top-24 left-0 right-0 z-[9999] px-4 pointer-events-none"
                >
                    <div className="max-w-4xl mx-auto pointer-events-auto">
                        <div className="bg-slate-950/90 border border-red-500/30 shadow-[0_15px_40px_rgba(239,68,68,0.15)] rounded-2xl p-5 md:p-6 relative overflow-hidden backdrop-blur-xl">
                            {/* Animated Ambient background glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none animate-pulse"></div>
                            
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-5 justify-between relative z-10">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-red-500/20 text-red-400 rounded-xl shrink-0 flex items-center justify-center animate-bounce">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-white font-bold text-base flex items-center gap-2">
                                            Live Database Offline (Mock Mode Active)
                                            <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-wider animate-pulse">
                                                Config Required
                                            </span>
                                        </h4>
                                        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
                                            The Colleges portal is running in offline demo mode. In production, environment variables are baked in at build time. 
                                            If you recently set them on Vercel, you <strong className="text-white">MUST trigger a fresh Redeployment</strong> to rebuild the site.
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                                    <button 
                                        onClick={handleDismiss}
                                        className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200 text-sm font-semibold transition-colors flex-1 md:flex-none"
                                    >
                                        Hide Warning
                                    </button>
                                    <a 
                                        href="https://vercel.com" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center gap-1.5 flex-1 md:flex-none hover:scale-105 active:scale-95"
                                    >
                                        <Server className="w-4 h-4" /> Vercel Settings <ArrowRight className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>

                            {/* Dropdown styling for Setup Checklist */}
                            <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-500 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-slate-400 font-bold block mb-1">🛠️ Vercel Setup Guide:</span>
                                    <ol className="list-decimal list-inside space-y-1.5 pl-1">
                                        <li>Go to Vercel Dashboard &gt; <code className="text-red-400">colleges-platform</code></li>
                                        <li>Settings &gt; Environment Variables</li>
                                        <li>Add <code className="text-white">VITE_SUPABASE_URL</code> and <code className="text-white">VITE_SUPABASE_ANON_KEY</code></li>
                                    </ol>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-bold block mb-1">🚀 Crucial Redeployment Step:</span>
                                    <ol className="list-decimal list-inside space-y-1.5 pl-1" start="4">
                                        <li>Go to the <strong className="text-white">Deployments</strong> tab</li>
                                        <li>Click the 3 dots (...) next to your latest deployment</li>
                                        <li>Select <strong className="text-red-400 flex items-center gap-1 inline-flex"><RefreshCw className="w-3 h-3 animate-spin" /> Redeploy</strong> and wait for the build to finish!</li>
                                    </ol>
                                </div>
                            </div>

                            <button 
                                onClick={handleDismiss}
                                className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-white rounded-lg hidden md:block hover:bg-slate-900 transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
