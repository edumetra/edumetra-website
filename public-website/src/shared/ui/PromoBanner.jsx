import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

const PromoBanner = () => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white relative overflow-hidden"
            >
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" />
                </div>

                <div className="container-custom relative">
                    <div className="flex items-center justify-center gap-3 py-3 px-4">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                        <p className="text-sm md:text-base font-semibold text-center">
                            Get upto ₹1 Lakh+ discount from your dream College
                        </p>
                        <Link
                            to="/signup"
                            className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded text-sm transition-colors whitespace-nowrap"
                        >
                            Register Now
                        </Link>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute right-4 p-1 hover:bg-red-800/50 rounded transition-colors"
                            aria-label="Close banner"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PromoBanner;
