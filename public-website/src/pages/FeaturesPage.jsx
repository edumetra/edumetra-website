import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Target, Zap, Bell, BarChart3, Shield, Clock,
    TrendingUp, Users, Globe, Smartphone, Lock, Headphones
} from 'lucide-react';
import SEO from '../components/SEO';
import FeatureCard from '../shared/ui/FeatureCard';
import Button from '../shared/ui/Button';
import { analytics } from '../shared/utils/analytics';

const FeaturesPage = () => {
    useEffect(() => {
        analytics.trackPageView('/features', 'Features');
    }, []);

    const coreFeatures = [
        {
            icon: Target,
            title: 'Comprehensive College Database',
            description: 'Explore detailed profiles of 500+ medical colleges across India including location, departments, facilities, and infrastructure information.',
        },
        {
            icon: BarChart3,
            title: 'NIRF & QS Rankings',
            description: 'Access updated NIRF and QS rankings for all medical colleges. Compare colleges based on official government rankings and global recognition.',
        },
        {
            icon: TrendingUp,
            title: 'NEET Cutoff Analysis',
            description: 'View previous year cutoffs, current trends, and AI-powered predicted cutoffs for all medical colleges and categories (General, OBC, SC, ST).',
        },
        {
            icon: Zap,
            title: 'Seat & Rank Insights',
            description: 'Get detailed information about total seats, category-wise seat distribution, and your admission probability based on your NEET rank.',
        },
        {
            icon: Shield,
            title: 'AI-Powered Predictions (Premium)',
            description: 'Advanced machine learning algorithms analyze historical data to predict your best-fit colleges and admission chances with 95% accuracy.',
        },
        {
            icon: Bell,
            title: 'Automated Engagement',
            description: 'Receive personalized guidance via WhatsApp, email, and SMS. Stay updated with cutoff changes, counseling dates, and admission alerts.',
        },
    ];

    const additionalFeatures = [
        {
            icon: Users,
            title: 'Smart College Matching',
            description: 'Input your NEET rank and preferences to get instant college recommendations tailored to your profile.',
        },
        {
            icon: Globe,
            title: 'Multi-State Coverage',
            description: 'Comprehensive data for government and private medical colleges across all states including state quota details.',
        },
        {
            icon: Smartphone,
            title: 'Mobile & Web Access',
            description: 'Access college data, cutoffs, and predictions anytime, anywhere with our responsive platform.',
        },
        {
            icon: Lock,
            title: 'Secure & Private',
            description: 'Your personal data and NEET scores are encrypted and never shared. Complete privacy guaranteed.',
        },
        {
            icon: Clock,
            title: 'Historical Cutoff Archive',
            description: 'Access years of historical NEET cutoff data to analyze trends and make data-driven college choices.',
        },
        {
            icon: Headphones,
            title: 'Priority Support',
            description: 'Premium users get dedicated support for queries about colleges, cutoffs, and counseling process.',
        },
    ];

    return (
        <>
            <SEO page="features" />

            <main className="pt-20">
                {/* Hero Section */}
                <section className="section pt-32">
                    <div className="container-custom">
                        <motion.div
                            className="text-center max-w-4xl mx-auto mb-16"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-4xl md:text-6xl font-bold mb-6">
                                Everything You Need for{' '}
                                <span className="gradient-text">Medical College Admissions</span>
                            </h1>
                            <p className="text-slate-300 text-lg md:text-xl leading-relaxed">
                                From comprehensive college data to AI-powered predictions—all the tools medical
                                aspirants need to make informed decisions and secure admission.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Core Features */}
                <section className="section bg-slate-900/30">
                    <div className="container-custom">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Core Platform Features
                            </h2>
                            <p className="text-slate-300 text-lg">
                                Essential data and insights to guide medical students through the admission process
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {coreFeatures.map((feature, index) => (
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

                {/* Additional Features */}
                <section className="section">
                    <div className="container-custom">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Additional Capabilities
                            </h2>
                            <p className="text-slate-300 text-lg">
                                More features to enhance your medical college search and decision-making
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {additionalFeatures.map((feature, index) => (
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

                {/* CTA */}
                <section className="section bg-slate-900/30">
                    <div className="container-custom">
                        <motion.div
                            className="card text-center max-w-3xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Ready to Find Your Medical College?
                            </h2>
                            <p className="text-slate-300 text-lg mb-6">
                                Start exploring colleges for free or upgrade to Premium for complete predictions and automated guidance.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button variant="primary" size="lg">
                                    Explore Colleges
                                </Button>
                                <Button variant="secondary" size="lg">
                                    View Pricing
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default FeaturesPage;
