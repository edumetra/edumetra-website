import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useScroll } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
    Calendar,
    Clock,
    User,
    ArrowLeft,
    Tag,
    Eye,
    MessageCircle,
    Share2,
    Check,
    ChevronRight,
    Copy,
    Twitter,
    Facebook,
    Sparkles,
    Send
} from 'lucide-react';
import SEO from '../components/SEO';
import { featuredArticle, articles } from '../data/articlesData';
import WebinarCTA from '../components/sections/webinars/WebinarCTA';
import { analytics } from '../shared/utils/analytics';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabaseClient';
import { pushLeadToTeleCRM } from '../services/telecrm';

// ── Interactive Timeline Diagram for NEET-to-Doctor ───────────────────────────
const InteractiveDoctorTimeline = () => {
    const milestones = [
        { title: "NEET UG Prep & Exam", desc: "The competitive national entrance exam to secure medical college admissions.", icon: "✍️" },
        { title: "MBBS Phases (4.5 Years)", desc: "Deep clinical and theoretical academic courses divided into 4 professional phases.", icon: "📚" },
        { title: "Compulsory Internship (1 Year)", desc: "Grueling hands-on clinical training rotating through all major hospital wards.", icon: "🏥" },
        { title: "NExT Licensing Test", desc: "The National Exit Test required for a medical license and PG residency merit.", icon: "🎓" },
        { title: "Residency (MD/MS - 3 Years)", desc: "Specialization training (e.g. Surgery, Pediatrics) with intense real-world practice.", icon: "🎯" },
        { title: "Super Speciality (3 Years)", desc: "Optional advanced sub-specialization (e.g. Cardiology, Neurosurgery) training.", icon: "⚡" },
    ];

    return (
        <div className="my-10 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8">
            <h4 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-400" />
                Interactive Career Pathway
            </h4>
            <div className="relative border-l-2 border-slate-800 ml-4 pl-6 md:pl-8 space-y-8">
                {milestones.map((m, i) => (
                    <motion.div 
                        key={i} 
                        className="relative"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <span className="absolute -left-[41px] md:-left-[49px] top-1.5 w-7 h-7 rounded-full bg-slate-800 border border-red-500/50 flex items-center justify-center text-xs">
                            {m.icon}
                        </span>
                        <div>
                            <h5 className="text-white font-bold text-base flex items-center gap-2">
                                {m.title}
                                <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded font-mono">Step {i+1}</span>
                            </h5>
                            <p className="text-slate-400 text-sm mt-1">{m.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// ── Custom Markdown Content Parser ──────────────────────────────────────────
const ArticleContentRenderer = ({ content }) => {
    if (!content) return null;

    // Split content by lines and parse basic markdown structure
    const lines = content.split('\n');
    let inList = false;
    let listItems = [];
    let inTable = false;
    let tableRows = [];
    let isMermaid = false;

    const renderedElements = [];

    const flushList = (key) => {
        if (listItems.length > 0) {
            renderedElements.push(
                <ul key={`list-${key}`} className="space-y-3.5 my-6 pl-1">
                    {listItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-slate-300 text-base md:text-lg leading-relaxed">
                            <span className="w-2 h-2 rounded-full bg-red-500 mt-2.5 flex-shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            );
            listItems = [];
            inList = false;
        }
    };

    const flushTable = (key) => {
        if (tableRows.length > 0) {
            const headers = tableRows[0];
            const rows = tableRows.slice(2); // Skip separator row

            renderedElements.push(
                <div key={`table-${key}`} className="overflow-x-auto my-8 border border-slate-800 rounded-xl">
                    <table className="w-full text-left border-collapse text-sm md:text-base">
                        <thead>
                            <tr className="bg-slate-900/80 border-b border-slate-800">
                                {headers.map((h, idx) => (
                                    <th key={idx} className="px-5 py-4 text-white font-bold uppercase tracking-wider">{h.trim()}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {rows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-slate-900/30 transition-colors">
                                    {row.map((cell, cIdx) => (
                                        <td key={cIdx} className="px-5 py-4 text-slate-300 font-medium">{cell.trim()}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
            tableRows = [];
            inTable = false;
        }
    };

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        // ── Handle Mermaid Diagram Block ──
        if (line.startsWith('```mermaid')) {
            isMermaid = true;
            continue;
        }
        if (isMermaid) {
            if (line.startsWith('```')) {
                isMermaid = false;
                renderedElements.push(<InteractiveDoctorTimeline key={`mermaid-${i}`} />);
            }
            continue;
        }

        // ── Handle Tables ──
        if (line.startsWith('|')) {
            flushList(i);
            inTable = true;
            const cells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
            tableRows.push(cells);
            continue;
        } else if (inTable && !line.startsWith('|')) {
            flushTable(i);
        }

        // ── Handle Bullet Lists ──
        if (line.startsWith('* ') || line.startsWith('- ')) {
            inList = true;
            listItems.push(line.slice(2));
            continue;
        } else if (inList && !line.startsWith('* ') && !line.startsWith('- ')) {
            flushList(i);
        }

        // ── Handle Headings ──
        if (line.startsWith('# ')) {
            renderedElements.push(
                <h1 key={i} className="text-3xl md:text-4xl lg:text-5xl font-black text-white mt-12 mb-6 tracking-tight leading-tight">
                    {line.slice(2)}
                </h1>
            );
        } else if (line.startsWith('## ')) {
            renderedElements.push(
                <h2 key={i} className="text-2xl md:text-3xl font-black text-white mt-10 mb-5 border-l-4 border-red-500 pl-4">
                    {line.slice(3)}
                </h2>
            );
        } else if (line.startsWith('### ')) {
            renderedElements.push(
                <h3 key={i} className="text-xl md:text-2xl font-bold text-white mt-8 mb-4">
                    {line.slice(4)}
                </h3>
            );
        }
        // ── Handle Blockquotes ──
        else if (line.startsWith('> ')) {
            renderedElements.push(
                <blockquote key={i} className="my-6 bg-red-500/10 border border-red-500/30 rounded-xl p-5 text-red-300 italic text-base md:text-lg">
                    {line.slice(2)}
                </blockquote>
            );
        }
        // ── Handle Horizontal Rule ──
        else if (line === '---') {
            renderedElements.push(<hr key={i} className="border-slate-800 my-8" />);
        }
        // ── Handle Regular Paragraphs ──
        else if (line.length > 0) {
            // Simple check for inline bold markup
            const parts = line.split('**');
            const processedParagraph = parts.map((part, idx) => {
                if (idx % 2 === 1) {
                    return <strong key={idx} className="text-white font-extrabold">{part}</strong>;
                }
                return part;
            });

            renderedElements.push(
                <p key={i} className="text-slate-300 text-base md:text-lg leading-relaxed mb-6 font-medium">
                    {processedParagraph}
                </p>
            );
        }
    }

    // Flush any remaining active lists or tables
    flushList('end');
    flushTable('end');

    return <div className="prose prose-invert max-w-none">{renderedElements}</div>;
};

// ── Main ArticleDetailPage Component ──────────────────────────────────────────
const ArticleDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll();
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;
        setSubmitting(true);
        try {
            // 1. Save to Supabase
            const { error: dbError } = await supabase
                .from('newsletter_subscriptions')
                .insert([{
                    email: email.trim(),
                    phone: null
                }]);

            if (dbError) {
                console.warn('[Article Newsletter] DB insert warning:', dbError.message);
            }

            // 2. Push to TeleCRM
            await pushLeadToTeleCRM(
                { 
                    email: email.trim(), 
                    status: 'Newsletter Subscriber'
                }, 
                ['Newsletter']
            );

            toast.success('Subscribed successfully!');
            setEmail('');
        } catch (err) {
            console.error('Subscription error:', err);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };
    
    // Find article matching slug
    const allArticles = [featuredArticle, ...articles];
    const article = allArticles.find(a => a.slug === slug);

    useEffect(() => {
        if (article) {
            analytics.trackPageView(`/news-blogs/${slug}`, article.title);
        }
    }, [slug, article]);

    if (!article) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center pt-24 px-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl"
                >
                    <span className="text-6xl mb-4 block">🔍</span>
                    <h1 className="text-2xl font-black text-white mb-2">Article Not Found</h1>
                    <p className="text-slate-400 text-sm mb-6">
                        The article you are looking for may have been moved or deleted.
                    </p>
                    <Link to="/news-blogs" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white font-bold rounded-xl transition-all text-sm">
                        <ArrowLeft className="w-4 h-4" /> Back to Articles
                    </Link>
                </motion.div>
            </div>
        );
    }

    const handleShareCopy = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
    };

    // Filter recommended articles (excluding current one)
    const recommended = allArticles
        .filter(a => a.slug !== slug)
        .slice(0, 3);

    return (
        <>
            <Helmet>
                <title>{article.title} - Edumetra News & Blogs</title>
                <meta name="description" content={article.excerpt} />
                <meta property="og:title" content={article.title} />
                <meta property="og:description" content={article.excerpt} />
                <meta property="og:type" content="article" />
            </Helmet>

            {/* Reading Progress Indicator */}
            <motion.div 
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 origin-left z-50"
                style={{ scaleX: scrollYProgress }}
            />

            <div className="min-h-screen bg-slate-950 pt-28 pb-20">
                {/* Header Breadcrumbs */}
                <div className="bg-slate-900/30 border-b border-slate-800/50 py-4 mb-8">
                    <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-400 font-medium">
                            <Link to="/" className="hover:text-white transition-colors">Home</Link>
                            <ChevronRight className="w-3.5 h-3.5" />
                            <Link to="/news-blogs" className="hover:text-white transition-colors">News & Blogs</Link>
                            <ChevronRight className="w-3.5 h-3.5" />
                            <span className="text-slate-300 truncate max-w-[200px] md:max-w-xs">{article.title}</span>
                        </div>
                        <Link to="/news-blogs" className="text-xs md:text-sm text-red-400 hover:text-red-300 font-bold flex items-center gap-1.5 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </Link>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-12 gap-8 items-start">
                        {/* ── Left Content (8 cols) ── */}
                        <div className="lg:col-span-8 space-y-8">
                            <motion.article 
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 md:p-10 shadow-xl overflow-hidden"
                            >
                                {/* Category Badge */}
                                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-xs font-black tracking-wide uppercase mb-6">
                                    <Tag className="w-3.5 h-3.5" />
                                    {article.category}
                                </div>

                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
                                    {article.title}
                                </h1>

                                <p className="text-slate-400 text-lg md:text-xl font-medium border-l-4 border-slate-800 pl-4 mb-8 leading-relaxed italic">
                                    {article.excerpt}
                                </p>

                                {/* Meta Info */}
                                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 border-y border-slate-800/80 py-4 mb-8">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-white uppercase">
                                            {article.author.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Written by</p>
                                            <p className="text-white font-bold">{article.author}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-auto lg:ml-0">
                                        <Calendar className="w-4 h-4 text-slate-500" />
                                        <span>{new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-slate-500" />
                                        <span>{article.readTime}</span>
                                    </div>
                                </div>

                                {/* Main Cover Visual */}
                                <div className="aspect-[21/9] bg-gradient-to-br from-red-600/10 to-amber-600/10 rounded-2xl flex items-center justify-center border border-slate-800/60 mb-8 relative group overflow-hidden">
                                    <div className="text-8xl md:text-9xl transition-transform duration-500 group-hover:scale-110">{article.image}</div>
                                    <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]" />
                                </div>

                                {/* Article Body content parsed dynamically */}
                                <div className="article-body">
                                    <ArticleContentRenderer content={article.content} />
                                </div>

                                {/* Share Article footer widget */}
                                <div className="border-t border-slate-800 mt-10 pt-6 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-slate-400">Share this article:</span>
                                        <button onClick={handleShareCopy} className="w-9 h-9 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg flex items-center justify-center transition-all" title="Copy link">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer" className="w-9 h-9 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg flex items-center justify-center transition-all" title="Share on X">
                                            <Twitter className="w-4 h-4" />
                                        </a>
                                        <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + window.location.href)}`} target="_blank" rel="noreferrer" className="w-9 h-9 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg flex items-center justify-center transition-all" title="Share on WhatsApp">
                                            <Send className="w-4 h-4" />
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {article.views} views</span>
                                        <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4" /> {article.comments} comments</span>
                                    </div>
                                </div>
                            </motion.article>

                            {/* Recommended Articles grid */}
                            <div className="space-y-6">
                                <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-red-500" />
                                    Recommended Reads
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {recommended.map((item, idx) => (
                                        <Link key={idx} to={`/news-blogs/${item.slug}`} className="group block">
                                            <div className="bg-slate-900/40 border border-slate-800 hover:border-red-500/30 rounded-2xl p-5 h-full flex flex-col justify-between transition-all">
                                                <div>
                                                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-2xl mb-4">
                                                        {item.image}
                                                    </div>
                                                    <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2 mb-2">
                                                        {item.title}
                                                    </h4>
                                                    <p className="text-slate-400 text-xs line-clamp-2">{item.excerpt}</p>
                                                </div>
                                                <span className="text-red-400 text-xs font-bold mt-4 flex items-center gap-1">
                                                    Read
                                                    <ChevronRight className="w-3 h-3" />
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── Right Sidebar (4 cols) ── */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Newsletter widget */}
                            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl">
                                <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                                    <Send className="w-5 h-5 text-red-400" />
                                    Stay Updated!
                                </h3>
                                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                    Get the latest college admission updates, guidelines, and topper strategies delivered straight to your inbox.
                                </p>
                                <form onSubmit={handleSubscribe} className="space-y-3">
                                    <input 
                                        type="email" 
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email" 
                                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl text-sm focus:outline-none transition-colors text-white"
                                        disabled={submitting}
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={submitting}
                                        className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-75"
                                    >
                                        {submitting ? 'Subscribing...' : 'Subscribe Now'}
                                    </button>
                                </form>
                                <p className="text-[10px] text-slate-500 mt-3 text-center">
                                    Join 10,000+ medical aspirants. No spam. Unsubscribe anytime.
                                </p>
                            </div>

                            {/* Mini Category Filter links */}
                            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-xl">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4">Categories</h3>
                                <div className="space-y-2">
                                    {['NEET Updates', 'Admission News', 'Study Tips', 'College Reviews', 'Abroad Education', 'Career Guidance'].map((cat, idx) => (
                                        <Link key={idx} to={`/news-blogs`} className="flex items-center justify-between text-sm text-slate-300 hover:text-red-400 font-medium py-1.5 transition-colors group">
                                            <span>{cat}</span>
                                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="mt-16">
                    <WebinarCTA />
                </div>
            </div>
        </>
    );
};

export default ArticleDetailPage;
