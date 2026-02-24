import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, AlertCircle, TrendingUp, Award } from 'lucide-react';

const ScrollingNewsTicker = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const newsItems = [
        {
            icon: Calendar,
            date: '04 February',
            title: 'NEET 2026: NTA Releases Answer Key and Response Sheet',
            category: 'Exam Alert'
        },
        {
            icon: AlertCircle,
            date: '03 February',
            title: 'MPU के साथ करें गोवा निदान, बिना निवेश कमाना।',
            category: 'Opportunities'
        },
        {
            icon: Award,
            date: '02 February',
            title: 'JEE Mains 2026: Registration Process Started - Apply Now',
            category: 'Admission Alert'
        },
        {
            icon: TrendingUp,
            date: '01 February',
            title: 'Top Medical Colleges Accepting NEET Scores - Complete List',
            category: 'College Updates'
        },
        {
            icon: Calendar,
            date: '31 January',
            title: 'AIIMS MBBS Counselling 2026: Important Dates Announced',
            category: 'Counselling'
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % newsItems.length);
        }, 5000); // Change every 5 seconds

        return () => clearInterval(interval);
    }, [newsItems.length]);

    const handleDotClick = (index) => {
        setCurrentIndex(index);
    };

    const currentItem = newsItems[currentIndex];
    const Icon = currentItem.icon;

    return (
        <div className="bg-slate-800/40 backdrop-blur-sm border-y border-slate-700/50 py-3 overflow-hidden">
            <div className="container-custom">
                <div className="flex items-center justify-between gap-4">
                    {/* News Content */}
                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                                className="flex items-center gap-4"
                            >
                                {/* Icon & Date */}
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-primary-400" />
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-700/50 rounded-full">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        <span className="text-xs text-slate-300 font-medium whitespace-nowrap">
                                            {currentItem.date}
                                        </span>
                                    </div>
                                </div>

                                {/* Title */}
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-red-400 font-semibold mb-1">
                                        {currentItem.category}
                                    </div>
                                    <p className="text-sm md:text-base text-white font-medium truncate">
                                        {currentItem.title}
                                    </p>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Dots */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {newsItems.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handleDotClick(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                    ? 'bg-primary-500 w-6'
                                    : 'bg-slate-600 hover:bg-slate-500'
                                    }`}
                                aria-label={`View news item ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScrollingNewsTicker;
