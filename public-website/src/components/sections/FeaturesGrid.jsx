import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Bell, BarChart3, Shield, Clock } from 'lucide-react';
import FeatureCard from '../../shared/ui/FeatureCard';

const FeaturesGrid = () => {
    const features = [
        {
            icon: Target,
            title: 'Accurate Predictions',
            description: 'AI-powered cutoff predictions based on historical data from 1000+ colleges with 98% accuracy.',
        },
        {
            icon: Zap,
            title: 'Instant Analysis',
            description: 'Get your admission probability instantly. No waiting, no guesswork—just data-driven insights.',
        },
        {
            icon: Bell,
            title: 'Smart Alerts',
            description: 'Receive automated notifications when cutoffs drop or your chances of admission improve.',
        },
        {
            icon: BarChart3,
            title: 'Premium Analytics',
            description: 'Deep insights into trends, branch-wise analysis, and personalized college recommendations.',
        },
        {
            icon: Shield,
            title: 'Verified Data',
            description: 'All predictions based on official data sources and verified by our team of experts.',
        },
        {
            icon: Clock,
            title: 'Real-Time Updates',
            description: 'Stay ahead with real-time cutoff updates during admission season. Never miss a deadline.',
        },
    ];

    return (
        <section className="section bg-slate-900/30">
            <div className="container-custom">
                {/* Section Header */}
                <motion.div
                    className="text-center max-w-3xl mx-auto mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                        Everything You Need to{' '}
                        <span className="gradient-text">Make the Right Choice</span>
                    </h2>
                    <p className="text-slate-300 text-lg">
                        Powerful features designed to help you navigate the complex college admission process with confidence.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                            delay={index * 0.1}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesGrid;
