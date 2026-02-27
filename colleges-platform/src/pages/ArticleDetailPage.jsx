import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, User, ArrowLeft, Share2, Facebook, Twitter, Linkedin, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import SEOHead from '../components/SEOHead';

export default function ArticleDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        async function fetchArticle() {
            setLoading(true);
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('slug', slug)
                .eq('published', true)
                .single();

            if (error || !data) {
                navigate('/404', { replace: true });
            } else {
                setArticle(data);
            }
            setLoading(false);
        }
        fetchArticle();
    }, [slug, navigate]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 pt-24 pb-20 flex justify-center">
                <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin mt-20" />
            </div>
        );
    }

    if (!article) return null;

    const formattedDate = new Date(article.created_at).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
    });

    const shareUrl = encodeURIComponent(window.location.href);
    const shareTitle = encodeURIComponent(article.title);

    return (
        <div className="min-h-screen bg-slate-950 pt-20 pb-20">
            <SEOHead
                title={`${article.title} — Edumetra`}
                description={article.excerpt || `Read ${article.title} on Edumetra`}
                url={`/articles/${article.slug}`}
                image={article.image_url}
            />

            {/* Back Navigation */}
            <div className="max-w-4xl mx-auto px-4 md:px-8 pt-8 pb-6">
                <Link
                    to="/articles"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Articles
                </Link>
            </div>

            <article className="max-w-4xl mx-auto px-4 md:px-8">
                {/* Header */}
                <header className="mb-10 lg:mb-14">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight md:leading-tight mb-6"
                    >
                        {article.title}
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-wrap items-center gap-y-4 gap-x-8 border-y border-slate-800 py-4"
                    >
                        {/* Author */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                                <User className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Written by</p>
                                <p className="font-semibold text-white">{article.author || 'Edumetra Team'}</p>
                            </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Published on</p>
                                <p className="font-semibold text-white">{formattedDate}</p>
                            </div>
                        </div>

                        {/* Social Share (Desktop & Mobile horizontal) */}
                        <div className="flex items-center gap-2 ml-auto">
                            <span className="text-sm text-slate-500 mr-2 flex items-center gap-1.5 hidden sm:flex">
                                <Share2 className="w-4 h-4" /> Share
                            </span>
                            <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`} target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2] hover:text-white transition-all">
                                <Twitter className="w-4 h-4" fill="currentColor" />
                            </a>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-[#4267B2]/10 text-[#4267B2] hover:bg-[#4267B2] hover:text-white transition-all">
                                <Facebook className="w-4 h-4" fill="currentColor" />
                            </a>
                            <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}`} target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-[#0077b5]/10 text-[#0077b5] hover:bg-[#0077b5] hover:text-white transition-all">
                                <Linkedin className="w-4 h-4" fill="currentColor" />
                            </a>
                            <button
                                onClick={handleCopyLink}
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all ml-1 relative group"
                                aria-label="Copy link"
                            >
                                <Copy className="w-4 h-4" />
                                {copied && (
                                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-xs py-1 px-2 rounded font-medium shadow-lg whitespace-nowrap">
                                        Copied!
                                    </span>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </header>

                {/* Featured Image */}
                {article.image_url && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-10 lg:mb-14 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 aspect-video w-full"
                    >
                        <img
                            src={article.image_url}
                            alt={article.title}
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                )}

                {/* Article Content Area */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="prose-custom max-w-none"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Footer divider */}
                <div className="mt-16 pt-8 border-t border-slate-800 flex justify-between items-center sm:flex-row flex-col gap-6">
                    <p className="text-slate-500 text-sm">Thanks for reading this Edumetra Guide.</p>
                    <Link to="/articles" className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl transition-colors font-medium text-sm">
                        <ArrowLeft className="w-4 h-4" /> Back to all articles
                    </Link>
                </div>
            </article>
        </div>
    );
}
