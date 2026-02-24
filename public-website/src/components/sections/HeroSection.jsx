import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import Button from '../../shared/ui/Button';
import StatsCounter from '../../shared/ui/StatsCounter';
import { analytics } from '../../shared/utils/analytics';

const HeroSection = () => {
    const handlePrimaryCTA = () => {
        analytics.trackCTAClick('Get Started Free', 'Hero Section', 'primary');
        analytics.trackSignupIntent('hero_primary_cta');
    };

    const handleSecondaryCTA = () => {
        analytics.trackCTAClick('View Pricing', 'Hero Section', 'secondary');
    };

    return (
        <section className="section pt-32 md:pt-40 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                />
            </div>

            <div className="container-custom relative z-10">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Badge */}
                    <motion.div
                        className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Sparkles className="w-4 h-4 text-primary-400" />
                        <span className="text-sm text-slate-200">
                            Data-Driven Medical College Insights
                        </span>
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-shadow"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        Your Guide to{' '}
                        <span className="gradient-text">Medical College Admissions</span>
                        {' '}in India
                    </motion.h1>

                    {/* Subheading */}
                    <motion.p
                        className="text-lg md:text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        Explore 500+ medical colleges across India. Access comprehensive data on NEET cutoffs,
                        NIRF rankings, seat availability, and AI-powered admission predictions to make informed decisions.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Button
                            variant="primary"
                            size="lg"
                            icon={ArrowRight}
                            iconPosition="right"
                            onClick={handlePrimaryCTA}
                        >
                            Explore Colleges
                        </Button>
                        <Button
                            variant="secondary"
                            size="lg"
                            icon={TrendingUp}
                            onClick={handleSecondaryCTA}
                        >
                            View Plans
                        </Button>
                    </motion.div>

                    {/* Trust Indicators / Stats */}
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <StatsCounter end={500} suffix="+" label="Medical Colleges" />
                        <StatsCounter end={10000} suffix="+" label="Seats Tracked" />
                        <StatsCounter end={95} suffix="%" label="Prediction Accuracy" />
                        <StatsCounter end={5000} suffix="+" label="Students Guided" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
