import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, ChevronRight, Calendar, ArrowRight, Lock, Crown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { NewsModal } from './NewsModal';
import { motion } from 'framer-motion';
import { usePremium } from '../../contexts/PremiumContext';
import { useSignup } from '../../contexts/SignupContext';

export function NewsWidget() {
    const { isPremium } = usePremium();
    const { user } = useSignup();
    const [newsItems, setNewsItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [selectedNews, setSelectedNews] = useState(null);

    useEffect(() => {
        async function fetchTopNews() {
            const safetyTimeout = setTimeout(() => {
                setLoading(false);
            }, 10000);

            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('secure_news_updates')
                    .select('id, title, content, image_url, tags, published_at, is_subscriber_only')
                    .order('published_at', { ascending: false })
                    .limit(5);

                if (error) {
                    console.error("Error fetching news:", error);
                    setFetchError(error.message);
                } else if (data) {
                    setNewsItems(data);
                }
            } catch (err) {
                console.error("NewsWidget: Uncaught fetch error", err);
                setFetchError(err.message || "Failed to connect to news service");
            } finally {
                clearTimeout(safetyTimeout);
                setLoading(false);
            }
        }

        fetchTopNews();
    }, []);

    const isToday = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    if (loading) {
        return (
            <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 lg:p-8 backdrop-blur-xl animate-pulse h-[400px]">
                <div className="h-8 w-48 bg-white/10 rounded-lg mb-6"></div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-white/5 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="w-full bg-red-900/20 border border-red-500/50 rounded-3xl p-6 lg:p-8 backdrop-blur-xl flex flex-col items-center justify-center text-center h-full min-h-[200px]">
                <p className="text-red-400 font-semibold mb-2">Failed to load top news</p>
                <p className="text-red-300 text-sm opacity-80">{fetchError}</p>
            </div>
        );
    }

    if (newsItems.length === 0) {
        return (
            <div className="w-full bg-slate-900/60 border border-slate-700/50 rounded-3xl p-6 lg:p-8 backdrop-blur-xl flex flex-col items-center justify-center text-center h-full min-h-[400px] shadow-2xl shadow-black/50 relative overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 shadow-inner">
                    <Newspaper className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3">Latest News & Updates</h3>
                <p className="text-slate-400 mb-8 max-w-[280px]">
                    No recent news or announcements to display right now. Check back later!
                </p>
                <Link
                    to="/news-updates"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-colors border border-white/5 hover:border-white/10"
                >
                    View All News
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full bg-slate-900/60 border border-slate-700/50 rounded-3xl p-6 lg:p-8 backdrop-blur-xl flex flex-col h-full shadow-2xl shadow-black/50 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px] pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Newspaper className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white">Latest News</h2>
            </div>

            <div className="flex-1 flex flex-col gap-4">
                {newsItems.map((item, idx) => {
                    const isLockedPremium = item.is_subscriber_only && !isPremium;
                    const isLockedGuest = !item.is_subscriber_only && !user;

                    return (
                        <motion.button
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => setSelectedNews(item)}
                            className="group text-left p-4 rounded-xl relative bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/30 hover:border-slate-600/50 transition-all flex flex-col gap-2"
                        >
                            {isLockedPremium && (
                                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                                </div>
                            )}
                            {isLockedGuest && (
                                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                            )}

                            {item.tags && item.tags.length > 0 && (
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isLockedPremium ? 'text-amber-500' : 'text-blue-400'}`}>
                                    {item.tags[0]}
                                </span>
                            )}
                        <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white line-clamp-2 leading-snug">
                            {item.title}
                        </h3>
                        <div className="flex items-center justify-between w-full mt-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                <Calendar className="w-3.5 h-3.5" />
                                {isToday(item.published_at) ? 'Today' : new Date(item.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        </motion.button>
                    )
                })}
            </div>

            <Link
                to="/news-updates"
                className="mt-6 flex items-center justify-center w-full gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-colors border border-white/5 hover:border-white/10"
            >
                Visit News and Updates Page
                <ArrowRight className="w-4 h-4" />
            </Link>

            <NewsModal 
                isOpen={!!selectedNews} 
                onClose={() => setSelectedNews(null)} 
                news={selectedNews} 
            />
        </div>
    );
}
