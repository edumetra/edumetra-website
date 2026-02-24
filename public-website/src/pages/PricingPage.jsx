import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, HelpCircle, Star } from 'lucide-react';
import SEO from '../components/SEO';
import Button from '../shared/ui/Button';
import { analytics } from '../shared/utils/analytics';
import { generateStructuredData } from '../shared/utils/seo';

const PricingPage = () => {
    useEffect(() => {
        analytics.trackPageView('/pricing', 'Pricing');
    }, []);

    const plans = [
        {
            name: 'Free',
            price: '₹0',
            period: 'forever',
            description: 'Perfect for exploring medical colleges',
            features: [
                { text: 'View ANY 5 colleges per day', included: true },
                { text: 'Basic college profiles (no department details)', included: true },
                { text: '2024 cutoffs only (no historical data)', included: true },
                { text: 'NIRF rankings view', included: true },
                { text: 'Mobile & web access', included: true },
                { text: 'Complete 10-year cutoff history', included: false },
                { text: 'AI predictions with 95% accuracy', included: false },
                { text: 'Daily WhatsApp/Email/SMS alerts', included: false },
            ],
            cta: 'Start Free',
            variant: 'outline',
        },
        {
            name: 'Premium',
            price: '₹299',
            period: '/month',
            description: 'The smart choice for competitive aspirants',
            badge: '88% OFF',
            valueStack: {
                items: [
                    { name: 'AI Admission Predictor', value: 999 },
                    { name: '10-Year Cutoff Analyzer', value: 799 },
                    { name: 'WhatsApp Concierge', value: 499 },
                    { name: 'Priority Email Support', value: 299 },
                ],
                total: 2596,
                savings: 2297,
            },
            features: [
                { text: 'Unlimited access to 500+ colleges (save 40+ hrs research)', included: true },
                { text: 'Complete 10-year cutoff history & trend analysis', included: true },
                { text: 'AI predictions with 95% accuracy - know your exact chances', included: true },
                { text: 'Smart college finder based on your NEET rank', included: true },
                { text: 'Daily WhatsApp alerts during counseling (never miss openings)', included: true },
                { text: 'Real-time counseling date & cutoff drop notifications', included: true },
                { text: 'Priority support - responses within 2 hours', included: true },
                { text: 'Ad-free experience + downloadable cutoff reports', included: true },
            ],
            cta: 'Start 7-Day Risk-Free Trial',
            variant: 'primary',
            popular: true,
        },
    ];

    const faqs = [
        {
            question: 'Can I switch plans anytime?',
            answer: 'Yes! You can upgrade to Premium anytime or downgrade back to Free. Changes take effect immediately.',
        },
        {
            question: 'Is there a free trial for Premium?',
            answer: 'We offer a 7-day money-back guarantee. If you\'re not satisfied with Premium, we\'ll refund your payment, no questions asked.',
        },
        {
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit/debit cards, UPI, net banking, and wallets via Razorpay - a secure payment gateway.',
        },
        {
            question: 'How accurate are the predictions?',
            answer: 'Our AI-powered predictions have a 98% accuracy rate based on historical validation. We use official data sources and continuously improve our algorithms.',
        },
        {
            question: 'Can I cancel my subscription?',
            answer: 'Absolutely. You can cancel your Premium subscription anytime from your account settings. No cancellation fees.',
        },
        {
            question: 'Do you offer student discounts?',
            answer: 'We keep our pricing affordable for all students. Our free plan is generous, and Premium is less than ₹10/day!',
        },
    ];

    const structuredData = generateStructuredData('product', { price: '299' });

    return (
        <>
            <SEO page="pricing" structuredData={structuredData} />

            <main className="pt-20">
                {/* Hero */}
                <section className="section pt-32">
                    <div className="container-custom">
                        <motion.div
                            className="text-center max-w-4xl mx-auto mb-16"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h1 className="text-4xl md:text-6xl font-bold mb-6">
                                Simple, <span className="gradient-text">Transparent Pricing</span>
                            </h1>
                            <p className="text-slate-300 text-lg md:text-xl">
                                Explore medical colleges for free. Upgrade to Premium for complete predictions and automated guidance.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Success Stats Banner */}
                <section className="section pt-8">
                    <div className="container-custom">
                        <motion.div
                            className="card max-w-4xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="text-center mb-4">
                                <h3 className="text-xl font-semibold text-white mb-6">
                                    Join 5,000+ NEET Students Who Chose Premium
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                <div>
                                    <div className="text-3xl font-bold gradient-text mb-1">3.2x</div>
                                    <div className="text-slate-300 text-sm">Faster admission decisions</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold gradient-text mb-1">4.5+</div>
                                    <div className="text-slate-300 text-sm">Better college options found</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold gradient-text mb-1">87%</div>
                                    <div className="text-slate-300 text-sm">Report reduced counseling stress</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Pricing Cards */}
                <section className="section bg-slate-900/30">
                    <div className="container-custom">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                            {plans.map((plan, index) => (
                                <motion.div
                                    key={index}
                                    className={`card relative ${plan.popular ? 'ring-2 ring-primary-500 lg:scale-105' : ''
                                        }`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                            <div className="gradient-bg px-4 py-1 rounded-full flex items-center gap-1 text-white text-sm font-semibold">
                                                <Star className="w-4 h-4 fill-white" />
                                                Most Popular
                                            </div>
                                        </div>
                                    )}

                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-bold text-white mb-2">{plan.name}</h2>
                                        <div className="flex items-baseline justify-center gap-1 mb-2">
                                            <span className="text-5xl font-bold gradient-text">{plan.price}</span>
                                            <span className="text-slate-400">{plan.period}</span>
                                        </div>
                                        <p className="text-slate-300">{plan.description}</p>

                                        {plan.valueStack && (
                                            <div className="mt-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                                                <div className="text-xs text-slate-400 mb-2">Total Value: ₹{plan.valueStack.total.toLocaleString()}</div>
                                                <div className="text-sm font-semibold text-primary-400">
                                                    You Save: ₹{plan.valueStack.savings.toLocaleString()} ({plan.badge})
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <Check
                                                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${feature.included ? 'text-primary-400' : 'text-slate-600'
                                                        }`}
                                                />
                                                <span className={feature.included ? 'text-slate-200' : 'text-slate-500 line-through'}>
                                                    {feature.text}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    {plan.name === 'Premium' && (
                                        <div className="mb-4 p-3 rounded-lg bg-primary-500/10 border border-primary-500/20">
                                            <div className="flex items-center justify-center gap-2 text-sm text-primary-300">
                                                <span className="text-lg">🛡️</span>
                                                <div>
                                                    <div className="font-semibold">Zero Risk Guarantee</div>
                                                    <div className="text-xs">7-day full refund • Cancel anytime</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <Button variant={plan.variant} size="lg" className="w-full">
                                        {plan.cta}
                                    </Button>
                                </motion.div>
                            ))}
                        </div>

                        <motion.p
                            className="text-center text-slate-400 mt-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            🔒 Secure payment via Razorpay • 7-day money-back guarantee • Cancel anytime
                        </motion.p>
                    </div>
                </section>

                {/* FAQ */}
                <section className="section">
                    <div className="container-custom">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Frequently Asked Questions
                            </h2>
                            <p className="text-slate-300 text-lg">
                                Got questions? We've got answers.
                            </p>
                        </div>

                        <div className="max-w-3xl mx-auto space-y-4">
                            {faqs.map((faq, index) => (
                                <motion.div
                                    key={index}
                                    className="card"
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className="flex gap-4">
                                        <HelpCircle className="w-6 h-6 text-primary-400 flex-shrink-0 mt-1" />
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-2">
                                                {faq.question}
                                            </h3>
                                            <p className="text-slate-300">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="section bg-slate-900/30">
                    <div className="container-custom">
                        <motion.div
                            className="card text-center max-w-3xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Still Have Questions?
                            </h2>
                            <p className="text-slate-300 text-lg mb-6">
                                Our support team is here to help. Reach out anytime!
                            </p>
                            <Button variant="secondary" size="lg">
                                Contact Support
                            </Button>
                        </motion.div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default PricingPage;
