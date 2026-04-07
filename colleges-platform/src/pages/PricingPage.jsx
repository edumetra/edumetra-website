import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, HelpCircle, Star, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const PricingPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Track page view
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'InitiateCheckout', {
                content_name: 'View Pricing'
            });
        }
    }, []);

    // Helper to dynamically load Razorpay script
    const loadScript = (src) => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleSubscribe = async (tier) => {
        setLoading(true);
        try {
            // 1. Check Auth
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error('Please log in to upgrade.');
                navigate('/');
                return;
            }

            const user = session.user;

            // 1.5 Check if already subscribed to this tier or higher
            const { data: profile } = await supabase.from('user_profiles').select('account_type, subscription_status').eq('id', user.id).single();
            if (profile && profile.subscription_status === 'active') {
                if (profile.account_type === 'pro' || (profile.account_type === 'premium' && tier === 'premium')) {
                    toast.error(`You are already subscribed to ${profile.account_type.toUpperCase()}! Please manage your subscription in your Profile.`);
                    setLoading(false);
                    return;
                }
            }

            // 2. Load Razorpay Script
            const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
            if (!res) {
                toast.error('Razorpay SDK failed to load. Are you offline?');
                return;
            }

            // 3. Create Subscription via Backend API
            const adminUrl = import.meta.env.VITE_ADMIN_URL || 'http://localhost:3001';
            const subRes = await fetch(`${adminUrl}/api/razorpay/create-subscription`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, planType: tier })
            });

            const subData = await subRes.json();
            if (!subRes.ok || !subData.success) {
                toast.error(subData.error || 'Failed to initialize subscription checkout.');
                setLoading(false);
                return;
            }

            // 4. Initiate checkout
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY',
                subscription_id: subData.subscriptionId,
                name: 'Edumetra',
                description: `${tier.toUpperCase()} Subscription Verification`,
                image: 'https://edumetra.com/logo.png',
                handler: async function (response) {
                    console.log('Payment Successful', response);
                    
                    if (typeof window !== 'undefined' && window.fbq) {
                        window.fbq('track', 'Purchase', {
                            currency: 'INR',
                            value: tier === 'pro' ? 799 : 299,
                            content_name: `${tier.toUpperCase()} Subscription`
                        });
                    }

                    toast.success(`Successfully subscribed to ${tier.toUpperCase()}! Redirecting...`);
                    setTimeout(() => navigate('/profile'), 2000);
                },
                prefill: {
                    name: user.user_metadata?.full_name || '',
                    email: user.email || '',
                },
                notes: {
                    user_id: user.id,
                    plan_type: tier
                },
                theme: {
                    color: '#ef4444' // Red to match edumetra's usual primary brand color
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error('Subscription error:', error);
            toast.error('Something went wrong during checkout.');
        } finally {
            setLoading(false);
        }
    };

    const plans = [
        {
            id: 'free',
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
            cta: 'Continue Free',
            buttonStyle: 'bg-white/5 border border-white/10 hover:bg-white/10 text-white',
            popular: false,
        },
        {
            id: 'premium',
            name: 'Premium',
            price: '₹299',
            period: 'per month',
            description: 'Best for serious applicants comparing multiple colleges.',
            badge: 'Most Popular',
            features: [
                { text: 'Everything in Free', included: true },
                { text: 'Full placement stats & recruiters', included: true },
                { text: 'Unlimited college shortlisting', included: true },
                { text: 'Side-by-side comparison', included: true },
                { text: 'Unlimited reviews access', included: true },
                { text: 'Priority deadline reminders', included: true },
                { text: 'Application tracker', included: true },
                { text: 'Expert counselling sessions', included: false },
            ],
            cta: 'Subscribe to Premium',
            buttonStyle: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-900/30',
            popular: true,
        },
        {
            id: 'pro',
            name: 'Pro',
            price: '₹799',
            period: 'per month',
            description: 'For students who want expert guidance and full access.',
            features: [
                { text: 'Everything in Premium', included: true },
                { text: '1-on-1 expert counselling', included: true },
                { text: 'Personalised college roadmap', included: true },
                { text: 'Priority application reviews', included: true },
                { text: 'Early access to new features', included: true },
                { text: 'Dedicated account manager', included: true },
                { text: 'Interview preparation resources', included: true },
                { text: 'Scholarship discovery engine', included: true },
            ],
            cta: 'Get Pro',
            buttonStyle: 'bg-white/5 border border-white/10 hover:bg-white/10 text-white',
            popular: false,
        },
    ];

    const faqs = [
        {
            question: 'Can I upgrade my plan later?',
            answer: 'Yes! You can easily upgrade from Free to Pro or Premium at any time from your account settings.',
        },
        {
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit/debit cards, UPI, net banking, and wallets securely via Razorpay.',
        },
        {
            question: 'How accurate is the placement data?',
            answer: 'Our placement data is gathered directly from official NIRF reports and verified recruiters to ensure maximum accuracy.',
        },
        {
            question: 'Can I cancel my subscription?',
            answer: 'Yes, you can turn off auto-renewal anytime from your profile settings. You will retain access until the end of your billing cycle.',
        },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            {/* Hero Section */}
            <section className="py-20 md:py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        className="text-center max-w-4xl mx-auto mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
                            Simple, <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400">Transparent Pricing</span>
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl">
                            Start free. Upgrade when you're ready to dive deeper with Pro or Premium guidance.
                        </p>
                    </motion.div>

                    {/* Pricing Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
                        {plans.map((plan, index) => (
                            <motion.div
                                key={plan.id}
                                className={`relative flex flex-col h-full bg-slate-900 border ${plan.popular ? 'border-red-500/50 shadow-2xl shadow-red-500/10 md:scale-105 z-10' : 'border-slate-800' } rounded-2xl p-6 md:p-8 backdrop-blur-xl`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <div className="bg-gradient-to-r from-red-500 to-rose-500 px-4 py-1 rounded-full flex items-center gap-1.5 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                                            <Star className="w-3.5 h-3.5 fill-white" />
                                            {plan.badge}
                                        </div>
                                    </div>
                                )}

                                <div className="text-center mb-8 flex-shrink-0">
                                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                                        {plan.name}
                                        {plan.id === 'premium' && <Sparkles className="w-5 h-5 text-red-400" />}
                                        {plan.id === 'pro' && <Zap className="w-5 h-5 text-yellow-400" />}
                                    </h2>
                                    <div className="flex items-baseline justify-center gap-1 mb-2">
                                        <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                                            {plan.price}
                                        </span>
                                        <span className="text-slate-500 font-medium">{plan.period}</span>
                                    </div>
                                    <p className="text-slate-400 text-sm h-10">{plan.description}</p>
                                </div>

                                <ul className="space-y-4 mb-8 flex-grow">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <Check
                                                className={`w-5 h-5 flex-shrink-0 mt-0.5 ${feature.included ? 'text-red-400' : 'text-slate-700'}`}
                                            />
                                            <span className={feature.included ? 'text-slate-300 text-sm' : 'text-slate-600 line-through text-sm'}>
                                                {feature.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-auto">
                                    <button
                                        onClick={() => plan.id === 'free' ? navigate('/') : handleSubscribe(plan.id)}
                                        disabled={loading}
                                        className={`w-full font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] ${plan.buttonStyle}`}
                                    >
                                        {loading && plan.id !== 'free' ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : plan.cta}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.p
                        className="text-center text-slate-500 mt-12 text-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        🔒 Secure payments powered by Razorpay • Instant access upon upgrading
                    </motion.p>
                </div>
            </section>

            {/* Success Stats Banner */}
            <section className="py-12 bg-slate-900 border-y border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="text-xl font-bold text-white mb-8">
                            Join over 5,000+ Students Who Upgraded
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400 mb-2">3.2x</div>
                                <div className="text-slate-400 font-medium">Faster admission decisions</div>
                            </div>
                            <div>
                                <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400 mb-2">4.5+</div>
                                <div className="text-slate-400 font-medium">Better college options found</div>
                            </div>
                            <div>
                                <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400 mb-2">87%</div>
                                <div className="text-slate-400 font-medium">Reduced counseling stress</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 md:py-24">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
                        <p className="text-slate-400">Everything you need to know about the product and billing.</p>
                    </div>

                    <div className="space-y-6">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="flex gap-4 items-start">
                                    <HelpCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-2">{faq.question}</h3>
                                        <p className="text-slate-400 leading-relaxed">{faq.answer}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PricingPage;
