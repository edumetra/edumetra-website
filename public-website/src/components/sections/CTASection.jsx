import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { analytics } from '../../shared/utils/analytics';
import { motion } from 'framer-motion';

const CTASection = () => {
    const handleCTAClick = () => {
        analytics.trackCTAClick('Get Started Now', 'Final CTA Section', 'button');
        analytics.trackSignupIntent('final_cta');
    };

    return (
        <section className="section">
            <div className="container-custom">
                <motion.div
                    className="card relative overflow-hidden"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Background Gradient */}
                    <div className="absolute inset-0 gradient-bg opacity-10" />

                    <div className="relative z-10 text-center max-w-3xl mx-auto py-8 md:py-12">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
                            <Sparkles className="w-4 h-4 text-primary-400" />
                            <span className="text-sm text-slate-200">
                                Join 50,000+ Students Today
                            </span>
                        </div>

                        {/* Heading */}
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                            Ready to Find Your{' '}
                            <span className="gradient-text">Perfect College?</span>
                        </h2>

                        {/* Description */}
                        <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
                            Don't leave your future to chance. Get AI-powered predictions,
                            real-time alerts, and expert insights to make the best college choice.
                        </p>

                        {/* CTA Button */}
                        <Link
                            to="/signup"
                            onClick={handleCTAClick}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl mx-auto"
                        >
                            Get Started Now - It's Free
                            <ArrowRight className="w-5 h-5" />
                        </Link>

                        {/* Trust Signal */}
                        <p className="text-slate-400 text-sm mt-6">
                            ✓ No credit card required • ✓ Free forever plan • ✓ Join in 2 minutes
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default CTASection;
