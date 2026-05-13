import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, HelpCircle, Star, Zap, Sparkles, Tag, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { pushLeadToTeleCRM } from '../services/telecrm';

const PricingPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [validatingCoupon, setValidatingCoupon] = useState(false);

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

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setValidatingCoupon(true);
        try {
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', couponCode.toUpperCase())
                .eq('is_active', true)
                .single();

            if (error || !data) {
                toast.error('Invalid or inactive coupon code');
                setAppliedCoupon(null);
            } else {
                // Check expiry
                if (data.expires_at && new Date(data.expires_at) < new Date()) {
                    toast.error('This coupon has expired');
                    setAppliedCoupon(null);
                    return;
                }
                // Check usage
                if (data.max_uses && data.used_count >= data.max_uses) {
                    toast.error('Coupon usage limit reached');
                    setAppliedCoupon(null);
                    return;
                }

                setAppliedCoupon(data);
                toast.success(`Coupon "${data.code}" applied! ${data.discount_percentage}% discount.`);
            }
        } catch (err) {
            toast.error('Failed to validate coupon');
        } finally {
            setValidatingCoupon(false);
        }
    };

    const handleSubscribe = async (tier) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('account_type')
                .eq('id', session.user.id)
                .single();
            
            if (profile) {
                const currentTier = profile.account_type || 'free';
                if (currentTier === 'pro') {
                    toast.error('You already have the Plus plan (highest).');
                    return;
                }
                if (currentTier === 'premium' && tier === 'premium') {
                    toast.error('You already have the Premium plan. You can only upgrade to Plus.');
                    return;
                }
            }
        }
        navigate(`/checkout?plan=${tier}`);
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
            originalPrice: '₹10,000',
            price: '₹3,000',
            period: 'One-time payment',
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
            cta: 'Get Premium',
            buttonStyle: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-900/30',
            popular: true,
        },
        {
            id: 'pro',
            name: 'Plus',
            originalPrice: '₹50,000',
            price: '₹30,000',
            period: 'One-time payment',
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
            cta: 'Get Plus',
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
            question: 'What happens after payment?',
            answer: 'After a successful payment, your account is instantly upgraded. You will get immediate access to all the features included in your chosen plan.',
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
                                    <div className="flex flex-col items-center justify-center mb-2">
                                        {plan.originalPrice && (
                                            <span className="text-xl font-semibold text-slate-500 line-through mb-1">
                                                {plan.originalPrice}
                                            </span>
                                        )}
                                        <div className="flex items-baseline justify-center gap-1">
                                            <span className="text-5xl lg:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                                                {appliedCoupon && plan.id !== 'free' 
                                                    ? `₹${Math.floor(parseInt(plan.price.replace('₹', '').replace(/,/g, '')) * (1 - appliedCoupon.discount_percentage / 100))}` 
                                                    : plan.price}
                                            </span>
                                            <span className="text-slate-500 font-medium whitespace-nowrap">{plan.period}</span>
                                        </div>
                                    </div>
                                    {appliedCoupon && plan.id !== 'free' && (
                                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest -mt-1 mb-2">
                                            {appliedCoupon.discount_percentage}% OFF APPLIED
                                        </p>
                                    )}
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

                    {/* Coupon Input */}
                    <motion.div 
                        className="max-w-md mx-auto mt-12 bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-xl"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Tag className="w-5 h-5 text-red-400" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Have a Coupon?</h3>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Enter code (e.g. SAVE10)"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 uppercase font-mono"
                                />
                            </div>
                            <button
                                onClick={handleApplyCoupon}
                                disabled={validatingCoupon || !couponCode}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                            >
                                {validatingCoupon ? '...' : 'Apply'}
                            </button>
                        </div>
                        {appliedCoupon && (
                            <div className="mt-4 flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg">
                                <span className="text-xs font-bold text-emerald-400">
                                    ✓ Coupon {appliedCoupon.code} applied!
                                </span>
                                <button 
                                    onClick={() => {setAppliedCoupon(null); setCouponCode('');}}
                                    className="text-xs text-emerald-400/60 hover:text-emerald-400 underline"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </motion.div>

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

            {/* Final CTA */}
            <section className="py-20 bg-slate-900/30 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center max-w-3xl mx-auto bg-slate-900 border border-slate-800 p-12 rounded-3xl"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Still Have Questions?
                        </h2>
                        <p className="text-slate-400 text-lg mb-8">
                            Our support team is here to help you find the right plan for your medical career.
                        </p>
                        <button 
                            onClick={() => navigate('/contact')}
                            className="bg-white text-slate-950 px-8 py-4 rounded-xl font-bold hover:bg-slate-200 transition-all scale-100 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Contact Support
                        </button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default PricingPage;
