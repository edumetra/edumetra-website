import React from 'react';
import { motion } from 'framer-motion';
import { Search, Brain, CheckCircle } from 'lucide-react';

const HowItWorks = () => {
    const steps = [
        {
            icon: Search,
            step: '01',
            title: 'Enter Your Details',
            description: 'Provide your exam scores, preferred colleges, and branches to get started.',
        },
        {
            icon: Brain,
            step: '02',
            title: 'AI Analysis',
            description: 'Our AI analyzes historical data and current trends to predict accurate cutoffs.',
        },
        {
            icon: CheckCircle,
            step: '03',
            title: 'Get Results',
            description: 'Receive personalized predictions, admission probability, and smart recommendations.',
        },
    ];

    return (
        <section className="section">
            <div className="container-custom">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                        How It <span className="gradient-text">Works</span>
                    </h2>
                    <p className="text-slate-300 text-lg">
                        Get accurate college predictions in three simple steps. No complexity, just results.
                    </p>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
                    {/* Connector Lines (Desktop) */}
                    <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            className="relative text-center"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                        >
                            {/* Step Number Badge */}
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/50 z-10">
                                {step.step}
                            </div>

                            {/* Card */}
                            <div className="card pt-12 text-center">
                                <div className="w-16 h-16 mx-auto mb-6 rounded-xl glass flex items-center justify-center text-primary-400">
                                    <step.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-slate-300">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
