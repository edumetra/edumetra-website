import React from 'react';
import { motion } from 'framer-motion';
import { Video } from 'lucide-react';

const WebinarsHero = ({ categories, selectedCategory, onCategoryChange }) => {
    return (
        <section className="relative section pt-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(239, 68, 68, 0.3) 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />
            </div>

            {/* Gradient Orbs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/20 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

            <div className="container-custom relative z-10">
                <motion.div
                    className="text-center max-w-4xl mx-auto mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <motion.div
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full mb-6 backdrop-blur-sm"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Video className="w-5 h-5 text-red-400 animate-pulse" />
                        <span className="text-red-300 text-sm font-semibold">Free Expert Sessions</span>
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                        Webinars & <span className="gradient-text text-gradient-shine">Seminars</span>
                    </h1>
                    <p className="text-slate-300 text-lg md:text-xl mb-8 leading-relaxed">
                        Join live sessions with medical education experts, NEET toppers, and experienced counselors. Get your questions answered in real-time.
                    </p>

                    {/* Stats with enhanced design */}
                    <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                        <motion.div
                            className="card text-center p-6 hover:scale-105 transition-transform duration-300 relative overflow-hidden group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="text-3xl font-bold gradient-text mb-1 relative">50+</div>
                            <div className="text-sm text-slate-400 relative">Webinars Hosted</div>
                        </motion.div>
                        <motion.div
                            className="card text-center p-6 hover:scale-105 transition-transform duration-300 relative overflow-hidden group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="text-3xl font-bold gradient-text mb-1 relative">15K+</div>
                            <div className="text-sm text-slate-400 relative">Attendees</div>
                        </motion.div>
                        <motion.div
                            className="card text-center p-6 hover:scale-105 transition-transform duration-300 relative overflow-hidden group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="text-3xl font-bold gradient-text mb-1 relative">4.8/5</div>
                            <div className="text-sm text-slate-400 relative">Avg Rating</div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Category Filter */}
                <motion.div
                    className="flex flex-wrap justify-center gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => onCategoryChange(category)}
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
    );
};

export default WebinarsHero;
