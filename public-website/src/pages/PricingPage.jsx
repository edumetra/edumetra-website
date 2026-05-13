import React, { useEffect } from 'react';
import { Check, HelpCircle, Star } from 'lucide-react';
import SEO from '../components/SEO';
import Button from '../shared/ui/Button';
import { analytics } from '../shared/utils/analytics';
import { generateStructuredData } from '../shared/utils/seo';
import { useAuth } from '../features/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { pushLeadToTeleCRM } from '../services/telecrm';

import { supabase } from '../services/supabaseClient';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// ── Lead Scoring helper ──────────────────────────────────────────────────────
function getGuestFingerprint() {
    if (typeof window === 'undefined') return null;
    const key = 'edu_guest_id';
    let id = null;
    try {
        id = localStorage.getItem(key);
        if (!id) {
            id = `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
            localStorage.setItem(key, id);
        }
    } catch (e) {
        console.warn('localStorage access blocked in PricingPage:', e);
        id = `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }
    return id;
}

const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || 'https://edumetra-website.vercel.app';

async function trackPricingView() {
    try {
        const identifier = getGuestFingerprint();
        if (!identifier) return;
        await fetch(`${ADMIN_URL}/api/track-pricing-view`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier }),
        });
    } catch {
        // silently ignore
    }
}

const PricingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        analytics.trackPageView('/pricing', 'Pricing');
        trackPricingView();
    }, []);

    const handlePlanCTA = async (planName) => {
        const key = planName.toLowerCase() === 'plus' ? 'pro' : planName.toLowerCase();
        if (key === 'free') {
            navigate('/signup');
            return;
        }

        if (user) {
            // Check eligibility pre-emptively
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('account_type')
                .eq('id', user.id)
                .single();
            
            if (profile) {
                const currentTier = profile.account_type || 'free';
                if (currentTier === 'pro') {
                    toast.error('You already have the Plus plan (highest).');
                    return;
                }
                if (currentTier === 'premium' && key === 'premium') {
                    toast.error('You already have the Premium plan. You can only upgrade to Plus.');
                    return;
                }
            }
            navigate(`/checkout?plan=${key}`);
        } else {
            navigate(`/signup?plan=${key}`);
        }
    };

    const plans = [
        {
            name: 'Free',
            price: '₹0',
            period: 'Forever',
            description: 'Perfect for getting started with college exploration.',
            features: [
                { text: 'Search all 10,000+ colleges', included: true },
                { text: 'View basic college profiles', included: true },
                { text: 'Read up to 5 reviews/month', included: true },
                { text: 'Access to entrance exam info', included: true },
                { text: 'Email support', included: true },
                { text: 'Placement data & salary stats', included: false },
                { text: 'Application tracking', included: false },
                { text: 'Priority deadline alerts', included: false },
            ],
            cta: 'Start Free',
            variant: 'outline',
            popular: false,
        },
        {
            name: 'Premium',
            originalPrice: '₹10,000',
            price: '₹3,000',
            period: 'One-time payment',
            description: 'Best for serious applicants comparing multiple colleges.',
            badge: 'Most Popular',
            features: [
                { text: 'Everything in Free', included: true },
                { text: 'Full placement stats & recruiters', included: true },
                { text: 'Unlimited college shortlisting', included: true },
                { text: 'Side-by-side comparison (up to 4)', included: true },
                { text: 'Unlimited reviews access', included: true },
                { text: 'Priority deadline reminders', included: true },
                { text: 'Application tracker', included: true },
                { text: 'Expert counselling sessions', included: false },
            ],
            cta: 'Start Premium',
            variant: 'primary',
            popular: true,
        },
        {
            name: 'Plus',
            originalPrice: '₹50,000',
            price: '₹30,000',
            period: 'One-time payment',
            description: 'For students who want expert guidance and full access.',
            features: [
                { text: 'Everything in Premium', included: true },
                { text: '1-on-1 expert counselling (2/month)', included: true },
                { text: 'Personalised college roadmap', included: true },
                { text: 'Priority application reviews', included: true },
                { text: 'Early access to new features', included: true },
                { text: 'Dedicated account manager', included: true },
                { text: 'Interview preparation resources', included: true },
                { text: 'Scholarship discovery engine', included: true },
            ],
            cta: 'Start Plus',
            variant: 'secondary',
            popular: false,
        },
    ];

    const faqs = [
        {
            question: 'What happens after payment?',
            answer: 'After a successful payment, your account is instantly upgraded. You will get immediate access to all the features included in your chosen plan.',
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
            question: 'Is this a one-time payment?',
            answer: 'Yes, both Premium and Plus plans are one-time payments. There are no recurring monthly charges.',
        },
        {
            question: 'Do you offer student discounts?',
            answer: 'We keep our pricing affordable for all students. Our free plan is generous, and Premium/Plus are packed with value!',
        },
    ];

    const structuredData = generateStructuredData('product', { price: '3000' });

    return (
        <>
            <SEO page="pricing" structuredData={structuredData} />

            <main className="pt-20">
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
                                Start free. Upgrade when you're ready to dive deeper with Premium or Plus guidance.
                            </p>
                        </motion.div>
                    </div>
                </section>

                <section className="section bg-slate-900/30">
                    <div className="container-custom">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-center">
                            {plans.map((plan, index) => (
                                <motion.div
                                    key={index}
                                    className={`card relative w-full h-full flex flex-col ${plan.popular ? 'ring-2 ring-primary-500 lg:scale-105 z-10' : ''
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

                                    <div className="text-center mb-8 flex-grow-0">
                                        <h2 className="text-2xl font-bold text-white mb-2">{plan.name}</h2>
                                        <div className="flex flex-col items-center justify-center mb-2">
                                            {plan.originalPrice && (
                                                <span className="text-xl font-semibold text-slate-500 line-through mb-1">
                                                    {plan.originalPrice}
                                                </span>
                                            )}
                                            <div className="flex items-baseline justify-center gap-1">
                                                <span className="text-5xl lg:text-6xl font-black tracking-tight gradient-text">{plan.price}</span>
                                                <span className="text-slate-400 font-medium whitespace-nowrap text-sm">{plan.period}</span>
                                            </div>
                                        </div>
                                        <p className="text-slate-300 text-sm">{plan.description}</p>
                                    </div>

                                    <ul className="space-y-4 mb-8 flex-grow">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <Check
                                                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${feature.included ? 'text-primary-400' : 'text-slate-600'
                                                        }`}
                                                />
                                                <span className={feature.included ? 'text-slate-200 text-sm md:text-base' : 'text-slate-500 line-through text-sm md:text-base'}>
                                                    {feature.text}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-auto">
                                        <Button
                                            variant={plan.variant}
                                            size="lg"
                                            className="w-full font-bold"
                                            onClick={() => handlePlanCTA(plan.name)}
                                        >
                                            {plan.cta}
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.p
                            className="text-center text-slate-400 mt-8 text-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            🔒 Secure payment via Razorpay • Instant account upgrade
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
            </main>
        </>
    );
};

export default PricingPage;
