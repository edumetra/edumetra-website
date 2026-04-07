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
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 custom-scrollbar relative">
                            {isLocked && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-xl p-8 text-center border-t border-slate-800">
                                    <div className="relative mb-6 shrink-0">
                                        <div className="absolute inset-0 bg-red-500/20 blur-2xl animate-pulse"></div>
                                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border relative z-10 ${isLockedPremium ? 'bg-amber-500/10 border-amber-500/20 shadow-amber-500/10' : 'bg-slate-800 border-slate-700 shadow-xl'}`}>
                                            <Lock className={`w-10 h-10 ${isLockedPremium ? 'text-amber-500' : 'text-slate-400'}`} />
                                        </div>
                                    </div>
                                    
                                    {isLockedPremium ? (
                                        <>
                                            <h3 className="text-3xl font-black text-white mb-3 tracking-tight">Subscribers Only</h3>
                                            <p className="text-slate-400 mb-8 max-w-sm text-lg leading-relaxed">
                                                Join our premium circle to see the latest updates and exclusive announcements.
                                            </p>
                                            <Link
                                                to="/pricing"
                                                onClick={onClose}
                                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-2xl font-black transition-all hover:scale-105 shadow-2xl shadow-orange-500/30 uppercase tracking-widest text-xs"
                                            >
                                                <Crown className="w-5 h-5" /> Subscribe to Unlock
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="text-3xl font-black text-white mb-3 tracking-tight">Sign up to Read</h3>
                                            <p className="text-slate-400 mb-8 max-w-sm text-lg leading-relaxed">
                                                This announcement is available for free to all registered students.
                                            </p>
                                            <button
                                                onClick={() => {
                                                    onClose();
                                                    window.dispatchEvent(new CustomEvent('open-auth-modal'));
                                                }}
                                                className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black transition-all hover:scale-105 shadow-2xl shadow-red-500/30 uppercase tracking-widest text-xs"
                                            >
                                                <LogIn className="w-5 h-5" /> Join for Free
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}

                            <div className={isLocked ? "opacity-20 pointer-events-none select-none filter blur-[2px] grayscale transition-all" : ""}>
                                <div className="flex flex-col gap-3 mb-8">
                                    <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                                        <Calendar className="w-4 h-4 text-blue-400/80" />
                                        {new Date(news.published_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </div>
                                    {news.tags && news.tags.length > 0 && (
                                        <div className="flex items-center gap-2 flex-wrap text-wrap">
                                            {news.tags.map(tag => (
                                                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest">
                                                    <Tag className="w-3 h-3" />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
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
                                    className="prose prose-invert max-w-none break-words overflow-hidden prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-img:rounded-xl"
                                    dangerouslySetInnerHTML={{ __html: isLocked ? news.content.substring(0, 300) + '...' : news.content }}
                                />
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
