import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Newspaper, Calendar, Lock, Crown, Search, Zap, LogIn, X, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NewsModal } from '../components/news/NewsModal';
import { motion, AnimatePresence } from 'framer-motion';
import { usePremium } from '../contexts/PremiumContext';
import { useSignup } from '../contexts/SignupContext';

const isLatest = (dateString) => {
    const pub = new Date(dateString);
    const now = new Date();
    const diffMs = now - pub;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays <= 2;
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
};

const getYear = (dateString) => new Date(dateString).getFullYear();

export default function NewsUpdatesPage() {
    const { isPremium, loadingTier } = usePremium();
    const { user } = useSignup();
    const [newsItems, setNewsItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNews, setSelectedNews] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState('All');

    useEffect(() => {
        async function fetchAllNews() {
            setLoading(true);
            const { data, error } = await supabase
                .from('secure_news_updates')
                .select('*')
                .order('published_at', { ascending: false });

            if (!error && data) {
                setNewsItems(data);
            }
            setLoading(false);
        }

        if (!loadingTier) {
            fetchAllNews();
        }
    }, [loadingTier]);

    const allTags = useMemo(() => {
        const tagsSet = new Set();
        newsItems.forEach(item => {
            if (item.tags && Array.isArray(item.tags)) {
                item.tags.forEach(tag => tagsSet.add(tag));
            }
        });
        return Array.from(tagsSet);
    }, [newsItems]);

    const filteredNews = useMemo(() => {
        let result = newsItems;
        if (selectedTag !== 'All') {
            result = result.filter(item => item.tags && item.tags.includes(selectedTag));
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(item =>
                (item.title && item.title.toLowerCase().includes(q)) ||
                (item.content && item.content.toLowerCase().includes(q))
            );
        }
        return result;
    }, [newsItems, selectedTag, searchQuery]);

    // Group by Year
    const groupedByYear = useMemo(() => {
        const groups = {};
        filteredNews.forEach(item => {
            const year = getYear(item.published_at);
            if (!groups[year]) groups[year] = [];
            groups[year].push(item);
        });
        return Object.entries(groups).sort(([a], [b]) => Number(b) - Number(a));
    }, [filteredNews]);

    // Featured (latest first 3)
    const featuredItems = useMemo(() => filteredNews.slice(0, 3), [filteredNews]);
    const archiveItems = useMemo(() => filteredNews.slice(3), [filteredNews]);

    const archiveByYear = useMemo(() => {
        const groups = {};
        archiveItems.forEach(item => {
            const year = getYear(item.published_at);
            if (!groups[year]) groups[year] = [];
            groups[year].push(item);
        });
        return Object.entries(groups).sort(([a], [b]) => Number(b) - Number(a));
    }, [archiveItems]);

    if (loading || loadingTier) {
        return (
            <div className="min-h-screen bg-[#070c1a] pt-28 pb-20 px-4 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-slate-500 text-sm">Loading latest news...</p>
                </div>
            </div>
        );
    }

    // NewsCard component
    const NewsCard = ({ item, size = 'normal' }) => {
        const isLockedPremium = item.is_subscriber_only && !isPremium;
        const isLockedGuest = !item.is_subscriber_only && !user;
        const isLocked = isLockedPremium || isLockedGuest;
        const showLatest = isLatest(item.published_at);

        if (size === 'feature') {
            return (
                <motion.button
                    whileHover={{ scale: 1.015 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    onClick={() => setSelectedNews(item)}
                    className="relative rounded-2xl overflow-hidden text-left w-full group cursor-pointer focus:outline-none"
                    style={{ minHeight: 260 }}
                >
                    {/* Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl" />
                    {item.image_url && (
                        <div className={`absolute inset-0 rounded-2xl overflow-hidden ${isLocked ? 'blur-sm opacity-40' : ''}`}>
                            <img src={item.image_url} alt="" className="w-full h-full object-cover opacity-25 group-hover:opacity-35 transition-opacity duration-500" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent rounded-2xl" />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                        {showLatest && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/30 animate-pulse">
                                <Zap className="w-3 h-3" /> Latest
                            </span>
                        )}
                        {isLockedPremium && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
                                <Lock className="w-3 h-3" /> Premium
                            </span>
                        )}
                        {isLockedGuest && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-700/80 border border-slate-600/50 text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                                <Lock className="w-3 h-3" /> Sign in
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-end h-full p-5 pt-14">
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {item.tags && item.tags.slice(0, 2).map((tag, i) => (
                                <span key={i} className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${isLockedPremium ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-300'}`}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h3 className={`text-lg font-bold leading-snug mb-3 line-clamp-3 ${isLocked ? 'text-slate-300' : 'text-white group-hover:text-blue-200 transition-colors'}`}>
                            {item.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(item.published_at)}
                        </div>
                    </div>
                </motion.button>
            );
        }

        // Normal card (archive list)
        return (
            <motion.button
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                onClick={() => setSelectedNews(item)}
                className="group w-full flex items-start gap-4 p-4 rounded-xl bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/60 hover:border-slate-700/60 transition-all text-left focus:outline-none"
            >
                {/* Thumbnail */}
                <div className="w-20 h-16 shrink-0 rounded-lg overflow-hidden bg-slate-800 border border-slate-700/50 relative">
                    {item.image_url ? (
                        <img src={item.image_url} alt="" className={`w-full h-full object-cover ${isLocked ? 'blur-sm opacity-50' : 'group-hover:scale-105 transition-transform duration-300'}`} onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Newspaper className="w-6 h-6 text-slate-600" />
                        </div>
                    )}
                    {isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Lock className={`w-4 h-4 ${isLockedPremium ? 'text-amber-400' : 'text-slate-400'}`} />
                        </div>
                    )}
                </div>

                {/* Text content */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        {showLatest && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-widest">
                                <Zap className="w-2.5 h-2.5" /> Latest
                            </span>
                        )}
                        {item.tags && item.tags.slice(0, 1).map((tag, i) => (
                            <span key={i} className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${isLockedPremium ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-400'}`}>
                                {tag}
                            </span>
                        ))}
                    </div>
                    <h3 className={`text-sm font-semibold line-clamp-2 leading-snug mb-1.5 ${isLocked ? 'text-slate-400' : 'text-slate-100 group-hover:text-white transition-colors'}`}>
                        {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.published_at)}
                    </div>
                </div>
            </motion.button>
        );
    };

    return (
        <div className="min-h-screen bg-[#070c1a] pt-28 pb-20 px-4">
            {/* Ambient blobs */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -z-0" />
            <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none -z-0" />

            <div className="max-w-6xl mx-auto relative z-10">

                {/* ── Header ── */}
                <div className="text-center mb-14">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/15 text-blue-400 text-xs font-black uppercase tracking-wider mb-5">
                        <Newspaper className="w-4 h-4" /> News & Announcements
                    </span>
                    <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight tracking-tight">
                        Stay in the
                        <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                            Know
                        </span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-lg mx-auto">
                        Exam alerts, admission deadlines, college events and so much more — all in one place.
                    </p>
                </div>

                {/* ── Search & Filter Bar ── */}
                <div className="flex flex-col sm:flex-row gap-3 mb-10">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search news by keyword..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-900/70 border border-slate-700/50 text-white rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-slate-600 text-sm"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Tag Chips ── */}
                {allTags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-12">
                        <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mr-1">
                            <Filter className="w-3.5 h-3.5" /> Filter:
                        </span>
                        {['All', ...allTags].map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                                    selectedTag === tag
                                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/30'
                                    : 'bg-slate-800/60 text-slate-400 border-slate-700/50 hover:bg-slate-700/60 hover:text-slate-200'
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                )}

                {filteredNews.length === 0 ? (
                    <div className="text-center py-24 rounded-3xl border border-slate-800/50 bg-slate-900/20">
                        <Newspaper className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
                        <p className="text-slate-500 text-sm">Try changing your search or filter.</p>
                    </div>
                ) : (
                    <>
                        {/* ── Featured Section ── */}
                        {featuredItems.length > 0 && (
                            <section className="mb-16">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full" />
                                    <h2 className="text-xl font-bold text-white">Recent Updates</h2>
                                    <div className="flex-1 h-px bg-slate-800/80" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {featuredItems.map((item, idx) => (
                                        <NewsCard key={item.id} item={item} size="feature" />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* ── Archive by Year ── */}
                        {archiveByYear.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-1 h-6 bg-gradient-to-b from-slate-500 to-slate-700 rounded-full" />
                                    <h2 className="text-xl font-bold text-white">Archive</h2>
                                    <div className="flex-1 h-px bg-slate-800/80" />
                                </div>

                                <div className="space-y-12">
                                    {archiveByYear.map(([year, items]) => (
                                        <div key={year}>
                                            {/* Year label */}
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="text-4xl font-black text-slate-800 select-none leading-none">{year}</span>
                                                <div className="flex-1 h-px bg-slate-800" />
                                                <span className="text-xs text-slate-600 font-medium">{items.length} update{items.length !== 1 ? 's' : ''}</span>
                                            </div>
                                            <div className="space-y-2">
                                                {items.map(item => (
                                                    <NewsCard key={item.id} item={item} size="normal" />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>

            <NewsModal
                isOpen={!!selectedNews}
                onClose={() => setSelectedNews(null)}
                news={selectedNews}
            />
        </div>
    );
}
