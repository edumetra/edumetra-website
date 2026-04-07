import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag, Image as ImageIcon, Lock, Crown, LogIn } from 'lucide-react';
import { usePremium } from '../../contexts/PremiumContext';
import { useSignup } from '../../contexts/SignupContext';
import { Link } from 'react-router-dom';

export function NewsModal({ isOpen, onClose, news }) {
    const { isPremium } = usePremium();
    const { user } = useSignup();

    if (!news) return null;

    const isLockedPremium = news.is_subscriber_only && !isPremium;
    const isLockedGuest = !news.is_subscriber_only && !user;
    const isLocked = isLockedPremium || isLockedGuest;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800">
                            <h2 className="text-xl sm:text-2xl font-bold text-white pr-8 line-clamp-2">
                                {news.title}
                            </h2>
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(news.published_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </div>
                                {news.tags && news.tags.length > 0 && (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {news.tags.map(tag => (
                                            <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
                                                <Tag className="w-3 h-3" />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <div className="relative">
                                {isLocked && (
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-md rounded-xl p-6 text-center border border-slate-700/50">
                                        {isLockedPremium ? (
                                            <>
                                                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mb-4 shadow-lg shadow-amber-500/20">
                                                    <Lock className="w-8 h-8 text-amber-500" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-white mb-2">Subscribers Only</h3>
                                                <p className="text-slate-300 mb-6 max-w-sm">
                                                    Subscribe to see the latest updates and exclusive announcements.
                                                </p>
                                                <Link
                                                    to="/pricing"
                                                    onClick={onClose}
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-xl shadow-orange-500/20"
                                                >
                                                    <Crown className="w-5 h-5" /> Subscribe to Unlock
                                                </Link>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 mb-4 shadow-lg">
                                                    <Lock className="w-8 h-8 text-slate-400" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-white mb-2">Sign up to Read</h3>
                                                <p className="text-slate-300 mb-6 max-w-sm">
                                                    This announcement is available for free to all registered users.
                                                </p>
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => {
                                                            onClose();
                                                            window.dispatchEvent(new CustomEvent('open-auth-modal'));
                                                        }}
                                                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-xl shadow-blue-500/20"
                                                    >
                                                        <LogIn className="w-5 h-5" /> Sign up or Log in
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                                
                                <div className={isLocked ? "opacity-30 pointer-events-none select-none filter blur-sm transition-all" : ""}>
                                    {news.image_url ? (
                                        <div className="mb-6 rounded-xl overflow-hidden bg-slate-800/50 border border-slate-700/50">
                                            <img 
                                                src={news.image_url} 
                                                alt={news.title}
                                                className="w-full h-auto max-h-[400px] object-contain"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        </div>
                                    ) : null}

                                    <div 
                                        className="prose prose-invert max-w-none prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-img:rounded-xl"
                                        dangerouslySetInnerHTML={{ __html: isLocked ? news.content.substring(0, 300) + '...' : news.content }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-900/50 backdrop-blur-xl shrink-0 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all border border-slate-700"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
