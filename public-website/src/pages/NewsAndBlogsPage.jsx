import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    Clock,
    User,
    TrendingUp,
    BookOpen,
    Search,
    Filter,
    ArrowRight,
    Tag,
    Eye,
    MessageCircle,
    Share2
} from 'lucide-react';
import SEO from '../components/SEO';
import { analytics } from '../shared/utils/analytics';

const NewsAndBlogsPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        analytics.trackPageView('/news-blogs', 'News and Blogs');
    }, []);

    const categories = [
        'All',
        'NEET Updates',
        'Admission News',
        'Study Tips',
        'College Reviews',
        'Abroad Education',
        'Career Guidance'
    ];

    const featuredArticle = {
        title: 'NEET 2025: Complete Guide to Counseling Process and Important Dates',
        excerpt: 'Everything you need to know about NEET 2025 counseling rounds, important dates, document requirements, and college selection strategy.',
        category: 'NEET Updates',
        author: 'Dr. Rajesh Kumar',
        date: '2025-02-05',
        readTime: '8 min read',
        image: '📚',
        views: '5.2K',
        comments: 47,
        tags: ['NEET 2025', 'Counseling', 'Admission']
    };

    const articles = [
        {
            title: 'Top 10 Medical Colleges in India 2025: NIRF Rankings and Cutoffs',
            excerpt: 'Comprehensive analysis of India\'s best medical colleges based on NIRF rankings, infrastructure, faculty, and placement records.',
            category: 'College Reviews',
            author: 'Dr. Priya Sharma',
            date: '2025-02-03',
            readTime: '10 min read',
            image: '🎓',
            views: '3.8K',
            comments: 34,
            tags: ['Rankings', 'Medical Colleges', 'AIIMS']
        },
        {
            title: 'How to Score 650+ in NEET 2025: Strategy from Toppers',
            excerpt: 'Proven strategies, study schedules, and preparation tips from NEET toppers who scored above 650 marks.',
            category: 'Study Tips',
            author: 'Anjali Patel',
            date: '2025-02-01',
            readTime: '12 min read',
            image: '📖',
            views: '4.5K',
            comments: 56,
            tags: ['NEET Preparation', 'Study Strategy', 'Toppers Tips']
        },
        {
            title: 'MBBS in Russia vs China: Complete Cost and Quality Comparison',
            excerpt: 'Detailed comparison of studying MBBS in Russia vs China including fees, living costs, university rankings, and career prospects.',
            category: 'Ab road Education',
            author: 'Vikram Singh',
            date: '2025-01-29',
            readTime: '15 min read',
            image: '🌍',
            views: '2.9K',
            comments: 28,
            tags: ['Russia', 'China', 'MBBS Abroad']
        },
        {
            title: 'Government vs Private Medical Colleges: Making the Right Choice',
            excerpt: 'In-depth analysis of government and private medical colleges - fees, quality, placements, and long-term ROI.',
            category: 'Career Guidance',
            author: 'Dr. Meenakshi Iyer',
            date: '2025-01-27',
            readTime: '9 min read',
            image: '🏥',
            views: '3.1K',
            comments: 42,
            tags: ['Government Colleges', 'Private Colleges', 'Decision Guide']
        },
        {
            title: 'NMC Guidelines 2025: What Changed for Medical Students?',
            excerpt: 'Latest updates from National Medical Commission affecting MBBS curriculum, internships, and licensing exams.',
            category: 'NEET Updates',
            author: 'Rahul Desai',
            date: '2025-01-25',
            readTime: '7 min read',
            image: '📋',
            views: '2.4K',
            comments: 19,
            tags: ['NMC', 'Guidelines', 'Regulations']
        },
        {
            title: 'Deemed Universities for MBBS: Complete List and Analysis 2025',
            excerpt: 'Comprehensive guide to deemed medical universities in India, their unique advantages, and admission process.',
            category: 'Admission News',
            author: 'Kavita Menon',
            date: '2025-01-23',
            readTime: '11 min read',
            image: '🏛️',
            views: '2.7K',
            comments: 31,
            tags: ['Deemed Universities', 'MBBS Admission', 'Private Colleges']
        },
        {
            title: 'From NEET to Doctor: Complete Timeline and Milestones',
            excerpt: 'Complete roadmap of medical education in India from NEET preparation to becoming a practicing doctor.',
            category: 'Career Guidance',
            author: 'Dr. Suresh Reddy',
            date: '2025-01-20',
            readTime: '13 min read',
            image: '🎯',
            views: '4.1K',
            comments: 38,
            tags: ['Medical Career', 'Timeline', 'Career Path']
        },
        {
            title: 'State Quota vs All India Quota: Everything You Need to Know',
            excerpt: 'Detailed explanation of state quota and AIQ seats, eligibility criteria, and which option is better for you.',
            category: 'NEET Updates',
            author: 'Akash Gupta',
            date: '2025-01-18',
            readTime: '8 min read',
            image: '📍',
            views: '3.3K',
            comments: 25,
            tags: ['State Quota', 'AIQ', 'Counseling']
        }
    ];

    const filteredArticles = articles.filter(article => {
        const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
        const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <>
            <SEO page="news-blogs" />

            <main className="pt-20">
                {/* Hero Section */}
                <section className="section pt-32 bg-gradient-to-b from-slate-900 to-slate-900/50">
                    <div className="container-custom">
                        <motion.div
                            className="text-center max-w-4xl mx-auto mb-12"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full mb-6">
                                <BookOpen className="w-5 h-5 text-red-400" />
                                <span className="text-red-300 text-sm font-semibold">Latest Updates & Insights</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                                News, Blogs & <span className="gradient-text">Expert Insights</span>
                            </h1>
                            <p className="text-slate-300 text-lg md:text-xl mb-8">
                                Stay updated with the latest medical education news, admission updates, and expert guidance for your MBBS journey.
                            </p>

                            {/* Search Bar */}
                            <div className="max-w-2xl mx-auto">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search articles, news, guides..."
                                        className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Category Filter */}
                        <motion.div
                            className="flex flex-wrap justify-center gap-3 mb-12"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${selectedCategory === category
                                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Featured Article */}
                <section className="section bg-slate-900/30">
                    <div className="container-custom">
                        <motion.div
                            className="card max-w-5xl mx-auto overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="flex items-center justify-center bg-gradient-to-br from-red-500/10 to-red-600/10 p-12">
                                    <div className="text-9xl">{featuredArticle.image}</div>
                                </div>
                                <div className="p-8">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold mb-4">
                                        <TrendingUp className="w-4 h-4" />
                                        Featured
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                        {featuredArticle.title}
                                    </h2>
                                    <p className="text-slate-300 mb-6">{featuredArticle.excerpt}</p>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-6">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            {featuredArticle.author}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(featuredArticle.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            {featuredArticle.readTime}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 text-sm text-slate-400 mb-6">
                                        <div className="flex items-center gap-2">
                                            <Eye className="w-4 h-4" />
                                            {featuredArticle.views} views
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MessageCircle className="w-4 h-4" />
                                            {featuredArticle.comments} comments
                                        </div>
                                    </div>

                                    <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all flex items-center gap-2">
                                        Read Full Article
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Articles Grid */}
                <section className="section">
                    <div className="container-custom">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold">
                                Latest <span className="gradient-text">Articles</span>
                            </h2>
                            <div className="text-slate-400">
                                {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredArticles.map((article, index) => (
                                <motion.div
                                    key={index}
                                    className="card group hover:shadow-2xl transition-all cursor-pointer"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="flex items-center justify-center bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-xl p-8 mb-4">
                                        <div className="text-6xl">{article.image}</div>
                                    </div>

                                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 text-red-400 rounded text-xs font-semibold mb-3">
                                        <Tag className="w-3 h-3" />
                                        {article.category}
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors line-clamp-2">
                                        {article.title}
                                    </h3>

                                    <p className="text-slate-300 text-sm mb-4 line-clamp-3">
                                        {article.excerpt}
                                    </p>

                                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                                        <div className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {article.author}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {article.readTime}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                                        <div className="flex items-center gap-4 text-xs text-slate-400">
                                            <div className="flex items-center gap-1">
                                                <Eye className="w-3 h-3" />
                                                {article.views}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MessageCircle className="w-3 h-3" />
                                                {article.comments}
                                            </div>
                                        </div>
                                        <button className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 text-sm font-semibold">
                                            Read More
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Load More Button */}
                        <div className="text-center mt-12">
                            <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border-2 border-slate-700">
                                Load More Articles
                            </button>
                        </div>
                    </div>
                </section>

                {/* Newsletter Subscription */}
                <section className="section bg-slate-900/30">
                    <div className="container-custom">
                        <motion.div
                            className="card max-w-3xl mx-auto text-center"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <BookOpen className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold mb-4">
                                Subscribe to Our <span className="gradient-text">Newsletter</span>
                            </h2>
                            <p className="text-slate-300 mb-8">
                                Get the latest medical education news, admission updates, and expert tips delivered directly to your inbox every week.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                                <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all whitespace-nowrap">
                                    Subscribe Now
                                </button>
                            </div>

                            <p className="text-slate-400 text-sm mt-4">
                                Join 10,000+ students already subscribed. Unsubscribe anytime.
                            </p>
                        </motion.div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default NewsAndBlogsPage;
