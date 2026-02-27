import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BookOpen, Calendar, User, ArrowRight, Search, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import SEOHead from '../components/SEOHead';

export default function ArticlesPage() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
        async function fetchArticles() {
            setLoading(true);
            const { data, error } = await supabase
                .from('articles')
                .select('id, title, slug, excerpt, image_url, author, created_at')
                .eq('published', true)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setArticles(data);
            }
            setLoading(false);
        }
        fetchArticles();
    }, []);

    const filteredArticles = articles.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-slate-950 pt-24 pb-20">
            <SEOHead
                title="College Guides & Articles — Edumetra"
                description="Read our latest guides, tips, and insights on finding the best colleges, admission processes, and career choices."
                url="/articles"
            />

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-3xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold mb-6">
                        <BookOpen className="w-4 h-4" />
                        Edumetra Blog
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                        Expert Advice for Your <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">
                            College Journey
                        </span>
                    </h1>
                    <p className="text-slate-400 text-base md:text-lg mb-8 max-w-2xl mx-auto">
                        Discover comprehensive guides, admission tips, and detailed college
                        comparisons to help you make the best educational choices.
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/40 transition-all shadow-xl"
                        />
                    </div>
                </motion.div>
            </div>

            {/* Articles Grid */}
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                {loading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                                <div className="h-48 bg-slate-800/50" />
                                <div className="p-6 space-y-4">
                                    <div className="h-4 bg-slate-800/50 rounded w-1/4" />
                                    <div className="h-6 bg-slate-800/50 rounded w-3/4" />
                                    <div className="h-20 bg-slate-800/50 rounded w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredArticles.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {filteredArticles.map((article, i) => (
                            <motion.div
                                key={article.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Link
                                    to={`/articles/${article.slug}`}
                                    className="group flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-red-500/40 hover:shadow-2xl hover:shadow-red-900/10 transition-all"
                                >
                                    {/* Image Container */}
                                    <div className="relative h-48 sm:h-56 overflow-hidden bg-slate-800">
                                        {article.image_url ? (
                                            <img
                                                src={article.image_url}
                                                alt={article.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-slate-700">
                                                <FileText className="w-12 h-12" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-col flex-1 p-5 md:p-6 pb-6">
                                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                                {new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>

                                        <h2 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                                            {article.title}
                                        </h2>

                                        <p className="text-slate-400 text-sm md:text-base mb-6 line-clamp-3 flex-1">
                                            {article.excerpt || "Read this comprehensive guide to learn more about this topic..."}
                                        </p>

                                        {/* Footer / Meta */}
                                        <div className="flex flex-wrap items-center justify-between gap-4 mt-auto pt-4 border-t border-slate-800">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                                                    <User className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-300 truncate max-w-[120px]">
                                                    {article.author || 'Edumetra Team'}
                                                </span>
                                            </div>
                                            <span className="flex items-center gap-1.5 text-sm font-bold text-red-500 group-hover:translate-x-1 transition-transform">
                                                Read More <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-3xl">
                        <BookOpen className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No articles found</h3>
                        <p className="text-slate-400">
                            {searchQuery ? "We couldn't find any articles matching your search." : "Check back later for new guides and articles!"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
