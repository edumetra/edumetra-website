import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    MapPin,
    Star,
    Users,
    Building2,
    TrendingUp,
    Award,
    MessageCircle,
    Sparkles
} from 'lucide-react';
import Button from '../../shared/ui/Button';
import { analytics } from '../../shared/utils/analytics';
import ScrollingNewsTicker from '../../shared/ui/ScrollingNewsTicker';
import ParticleBackground from '../../shared/ui/ParticleBackground';

const NewHeroSection = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState('');
    const [currentBgIndex, setCurrentBgIndex] = useState(0);

    // Vibrant medical-themed background gradients
    const backgrounds = [
        {
            type: 'gradient',
            value: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
            overlay: 'from-slate-900/85 via-slate-900/70 to-slate-900/85',
            particles: ['#3b82f6', '#60a5fa', '#93c5fd']
        },
        {
            type: 'gradient',
            value: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)',
            overlay: 'from-slate-900/85 via-slate-900/70 to-slate-900/85',
            particles: ['#14b8a6', '#2dd4bf', '#5eead4']
        },
        {
            type: 'gradient',
            value: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 30%, #14b8a6 100%)',
            overlay: 'from-slate-900/80 via-slate-900/65 to-slate-900/80',
            particles: ['#3b82f6', '#60a5fa', '#14b8a6']
        },
        {
            type: 'gradient',
            value: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)',
            overlay: 'from-slate-900/85 via-slate-900/70 to-slate-900/85',
            particles: ['#a855f7', '#c084fc', '#e9d5ff']
        },
        {
            type: 'gradient',
            value: 'linear-gradient(135deg, #0f766e 0%, #2563eb 50%, #7c3aed 100%)',
            overlay: 'from-slate-900/85 via-slate-900/70 to-slate-900/85',
            particles: ['#14b8a6', '#3b82f6', '#a855f7']
        }
    ];

    // Auto-rotate backgrounds every 6 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBgIndex((prev) => (prev + 1) % backgrounds.length);
        }, 6000);

        return () => clearInterval(interval);
    }, [backgrounds.length]);

    const handleSearch = (e) => {
        e.preventDefault();
        analytics.trackCTAClick('Hero Search', 'Hero Section', 'search');
        console.log('Searching for:', { searchQuery, location });
        // TODO: Implement search functionality
    };

    const handleCounseling = () => {
        analytics.trackCTAClick('Get Counselling', 'Hero Section', 'counseling-cta');
        // TODO: Navigate to counseling booking page
        window.location.href = '/contact';
    };

    const trustStats = [
        { value: '10,000+', label: 'Students Counseled', icon: Users },
        { value: '500+', label: 'Partner Colleges', icon: Building2 },
        { value: '95%', label: 'Admission Success Rate', icon: TrendingUp },
        { value: '15+', label: 'Years of Experience', icon: Award },
    ];

    return (
        <section className="relative overflow-hidden">
            {/* Animated Background Layers */}
            <div className="absolute inset-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentBgIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0"
                        style={{ background: backgrounds[currentBgIndex].value }}
                    />
                </AnimatePresence>

                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${backgrounds[currentBgIndex].overlay}`} />

                {/* Interactive Particle Background */}
                <ParticleBackground
                    particleCount={40}
                    colors={backgrounds[currentBgIndex].particles}
                    className="opacity-60"
                />
            </div>

            {/* Dot Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />
            </div>

            {/* Moving Particles Effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white/20 rounded-full"
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                        }}
                        animate={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                        }}
                        transition={{
                            duration: 20 + Math.random() * 20,
                            repeat: Infinity,
                            repeatType: "reverse",
                        }}
                    />
                ))}
            </div>

            <div className="container-custom relative">
                <div className="py-16 md:py-24">
                    {/* Trust Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center mb-8"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 rounded-full backdrop-blur-sm">
                            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                            <span className="text-red-300 text-sm font-semibold">Trusted by 10,000+ Students & Parents</span>
                        </div>
                    </motion.div>

                    {/* Main Headlines */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-center max-w-4xl mx-auto mb-8"
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                            Your Trusted Partner in<br />
                            <span className="bg-gradient-to-r from-red-400 via-red-300 to-red-400 bg-clip-text text-transparent">
                                Medical College Admissions
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 mb-3 leading-relaxed">
                            Expert guidance for students and peace of mind for parents
                        </p>
                        <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto">
                            From NEET counseling to admission confirmation - we guide you through every step
                            of your medical education journey with personalized support.
                        </p>
                    </motion.div>

                    {/* Search Box */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-3xl mx-auto mb-8"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6">
                            <form onSubmit={handleSearch}>
                                <div className="flex flex-col md:flex-row gap-3">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search colleges by name, course, or location..."
                                            className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                    >
                                        <Search className="w-5 h-5" />
                                        <span className="hidden sm:inline">Search Colleges</span>
                                        <span className="sm:hidden">Search</span>
                                    </button>
                                </div>
                            </form>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-slate-200">
                                <button
                                    onClick={handleCounseling}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    Book Free Counselling
                                </button>
                                <Link
                                    to="/signup"
                                    className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    Get Started Free
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* Trust Statistics */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto"
                    >
                        {trustStats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 md:p-6 text-center hover:bg-slate-800/70 transition-all"
                                >
                                    <div className="flex justify-center mb-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-lg flex items-center justify-center">
                                            <Icon className="w-6 h-6 text-primary-400" />
                                        </div>
                                    </div>
                                    <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-xs md:text-sm text-slate-400">
                                        {stat.label}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>

            {/* Scrolling News Ticker */}
            <ScrollingNewsTicker />

            {/* Bottom Wave */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 md:h-20 fill-slate-50">
                    <path d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z" />
                </svg>
            </div>
        </section>
    );
};

export default NewHeroSection;
