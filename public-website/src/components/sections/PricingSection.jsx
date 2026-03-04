import React from 'react';
import { Check, Star, Zap } from 'lucide-react';
import Button from '../../shared/ui/Button';
import { analytics } from '../../shared/utils/analytics';

import { motion } from 'framer-motion';
const PricingSection = () => {
    const plans = [
        {
            name: 'Free',
            price: '₹0',
            period: 'Forever',
            description: 'Perfect for getting started with exploration',
            features: [
                'Search all 10,000+ colleges',
                'View basic college profiles',
                'Read up to 5 reviews/month',
                'Access to entrance exam info',
                'Email support',
            ],
            cta: 'Start Free',
            variant: 'outline',
            popular: false,
        },
        {
            name: 'Premium',
            price: '₹299',
            period: '/month',
            description: 'Best for serious applicants comparing colleges',
            features: [
                'Everything in Free',
                'Full placement stats & recruiters',
                'Unlimited college shortlisting',
                'Side-by-side comparison',
                'Unlimited reviews access',
                'Priority deadline reminders',
                'Application tracker',
            ],
            cta: 'Get Premium',
            variant: 'primary',
            popular: true,
        },
        {
            name: 'Pro',
            price: '₹799',
            period: '/month',
            description: 'For students who want expert guidance',
            features: [
                'Everything in Premium',
                '1-on-1 expert counselling',
                'Personalised roadmap',
                'Priority application reviews',
                'Early access to features',
                'Dedicated account manager',
                'Interview preparation',
                'Scholarship discovery',
            ],
            cta: 'Get Pro',
            variant: 'secondary',
            popular: false,
        },
    ];

    const handlePlanClick = (planName) => {
        analytics.trackPricingView(planName);
        analytics.trackCTAClick(`${planName} Plan`, 'Pricing Section', 'card');
    };

    return (
        <section className="section bg-slate-900/30">
            <div className="container-custom">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                        Choose Your <span className="gradient-text">Plan</span>
                    </h2>
                    <p className="text-slate-300 text-lg">
                        Start free and upgrade anytime. No hidden fees, cancel whenever you want.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-center">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            className={`card relative w-full h-full flex flex-col ${plan.popular ? 'ring-2 ring-primary-500 lg:scale-105 z-10' : ''
                                }`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <div className="gradient-bg px-4 py-1 rounded-full flex items-center gap-1 text-white text-sm font-semibold shadow-lg">
                                        <Star className="w-4 h-4 fill-white" />
                                        Most Popular
                                    </div>
                                </div>
                            )}

                            {/* Plan Header */}
                            <div className="text-center mb-6 flex-grow-0">
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    {plan.name}
                                </h3>
                                <div className="flex items-baseline justify-center gap-1 mb-2">
                                    <span className="text-5xl font-bold gradient-text">
                                        {plan.price}
                                    </span>
                                    <span className="text-slate-400">{plan.period}</span>
                                </div>
                                <p className="text-slate-300">{plan.description}</p>
                            </div>

                            {/* Features List */}
                            <ul className="space-y-3 mb-8 flex-grow">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-200 text-sm xl:text-base">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA Button */}
                            <div className="mt-auto">
                                <Button
                                    variant={plan.variant}
                                    size="lg"
                                    className="w-full"
                                    icon={plan.popular ? Zap : undefined}
                                    onClick={() => handlePlanClick(plan.name)}
                                >
                                    {plan.cta}
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Additional Info */}
                <motion.p
                    className="text-center text-slate-400 mt-8"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    🔒 Secure payment via Razorpay • Cancel anytime • 7-day money-back guarantee
                </motion.p>
            </div>
        </section>
    );
};

export default PricingSection;
