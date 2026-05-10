import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Check, Shield, Lock, CreditCard,
    Zap, Sparkles, Tag, Ticket, ChevronRight,
    FileText, Download, CheckCircle, AlertCircle, Loader2, X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const SUBSCRIPTION_API = '/api/razorpay/create-subscription';

const PLANS = {
    premium: {
        id: 'premium',
        name: 'Premium',
        price: 3000,
        originalPrice: 10000,
        period: 'per month',
        color: 'from-red-500 to-rose-600',
        badge: 'Most Popular',
        badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30',
        icon: Sparkles,
        features: [
            'Everything in Free',
            'Full placement stats & recruiters',
            'Unlimited college shortlisting',
            'Side-by-side comparison (up to 4)',
            'Unlimited reviews access',
            'Priority deadline reminders',
            'Application tracker',
        ],
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        price: 30000,
        originalPrice: 50000,
        period: 'per month',
        color: 'from-amber-500 to-yellow-500',
        badge: 'Full Access',
        badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        icon: Zap,
        features: [
            'Everything in Premium',
            '1-on-1 expert counselling (2/month)',
            'Personalised college roadmap',
            'Priority application reviews',
            'Early access to new features',
            'Dedicated account manager',
            'Interview preparation resources',
            'Scholarship discovery engine',
        ],
    },
};

// ── Load Razorpay SDK ─────────────────────────────────────────────────────────
function loadRazorpaySDK() {
    return new Promise((resolve) => {
        if (window.Razorpay) { resolve(true); return; }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

const CheckoutPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const planKey = searchParams.get('plan') || 'premium';
    const plan = PLANS[planKey] || PLANS.premium;

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [validating, setValidating] = useState(false);
    const [couponError, setCouponError] = useState('');

    const [paymentState, setPaymentState] = useState('idle'); // idle | loading | processing | success | failed
    const [paymentError, setPaymentError] = useState('');

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error('Please log in to continue.');
                navigate(`/login?redirect=/checkout?plan=${planKey}`);
                return;
            }
            setUser(session.user);
        };
        checkAuth();
    }, [navigate, planKey]);

    const discountedPrice = appliedCoupon
        ? Math.floor(plan.price * (1 - appliedCoupon.discount_percentage / 100))
        : plan.price;

    const savings = plan.originalPrice - discountedPrice;

    // ── Coupon Validation ─────────────────────────────────────────────────────
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setValidating(true);
        setCouponError('');
        try {
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', couponCode.toUpperCase())
                .eq('is_active', true)
                .single();

            if (error || !data) {
                setCouponError('Invalid or inactive coupon code.');
                setAppliedCoupon(null);
            } else if (data.expires_at && new Date(data.expires_at) < new Date()) {
                setCouponError('This coupon has expired.');
                setAppliedCoupon(null);
            } else if (data.max_uses && data.used_count >= data.max_uses) {
                setCouponError('Coupon usage limit reached.');
                setAppliedCoupon(null);
            } else {
                setAppliedCoupon(data);
                setCouponError('');
                toast.success(`Coupon "${data.code}" applied!`);
            }
        } catch {
            setCouponError('Failed to validate coupon.');
        } finally {
            setValidating(false);
        }
    };

    // ── Razorpay Payment Flow (Subscription) ──────────────────────────────────
    const handlePayment = useCallback(async () => {
        if (!user) return;
        setPaymentState('loading');
        setPaymentError('');

        try {
            // 1. Load SDK
            const sdkLoaded = await loadRazorpaySDK();
            if (!sdkLoaded) {
                throw new Error('Failed to load payment SDK. Please check your internet connection.');
            }

            // 2. Create subscription via same-origin serverless function (no CORS)
            const subRes = await fetch(SUBSCRIPTION_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    planType: plan.id,
                    couponCode: appliedCoupon?.code || null,
                }),
            });

            const subData = await subRes.json();
            if (!subRes.ok || !subData.subscriptionId) {
                throw new Error(subData.error || 'Failed to initialize subscription checkout.');
            }

            // 3. Open Razorpay checkout
            setPaymentState('processing');

            const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

            const options = {
                key: razorpayKey,
                subscription_id: subData.subscriptionId,
                name: 'Edumetra',
                description: `${plan.name} Plan — Subscription Verification`,
                prefill: {
                    email: user.email,
                    name: user.user_metadata?.full_name || '',
                },
                theme: { color: '#ef4444' },
                modal: {
                    ondismiss: () => {
                        setPaymentState('idle');
                        setPaymentError('Payment cancelled. You can try again.');
                    },
                },
                handler: async (response) => {
                    console.log('Payment Successful', response);
                    setPaymentState('success');
                    toast.success('Successfully subscribed!');
                    
                    if (typeof window !== 'undefined' && window.fbq) {
                        window.fbq('track', 'Purchase', {
                            currency: 'INR',
                            value: plan.price,
                            content_name: `${plan.name.toUpperCase()} Subscription`
                        });
                    }

                    setTimeout(() => navigate('/profile'), 2000);
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (resp) => {
                setPaymentState('failed');
                setPaymentError(resp.error?.description || 'Payment failed. Please try again.');
            });
            rzp.open();

        } catch (err) {
            setPaymentState('failed');
            setPaymentError(err.message || 'Something went wrong. Please try again.');
        }
    }, [user, plan, appliedCoupon, navigate]);

    const PlanIcon = plan.icon;

    if (!user) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 pt-32 pb-20 px-4">
            <div className="max-w-5xl mx-auto">
                <Link to="/pricing" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-10 transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> Back to Pricing
                </Link>

                <div className="grid lg:grid-cols-5 gap-8 items-start">
                    {/* ── Left: Order Summary ── */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        {/* Plan Card */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg`}>
                                    <PlanIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${plan.badgeColor}`}>{plan.badge}</span>
                                    <h2 className="text-xl font-black text-white">{plan.name} Plan</h2>
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                {plan.features.map((f, i) => (
                                    <div key={i} className="flex items-start gap-2.5">
                                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-slate-300">{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Subscription Details</h3>
                            <div className="flex justify-between text-slate-300 text-sm">
                                <span>{plan.name} Plan</span>
                                <span className="line-through text-slate-500">₹{plan.originalPrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-300 text-sm">
                                <span>Launch Discount</span>
                                <span className="text-emerald-400">−₹{(plan.originalPrice - plan.price).toLocaleString()}</span>
                            </div>
                            {appliedCoupon && (
                                <div className="flex justify-between text-slate-300 text-sm">
                                    <span>Coupon ({appliedCoupon.code})</span>
                                    <span className="text-emerald-400">−₹{(plan.price - discountedPrice).toLocaleString()}</span>
                                </div>
                            )}
                            <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline">
                                <span className="text-white font-bold">Total Due Now</span>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-white">₹{discountedPrice.toLocaleString()}</span>
                                    <span className="text-slate-500 text-sm">/{plan.period.replace('per ', '')}</span>
                                </div>
                            </div>
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5" />
                                You save ₹{savings.toLocaleString()} compared to regular price!
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-slate-400" /> Secure checkout</div>
                            <div className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-slate-400" /> Data encrypted</div>
                            <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-slate-400" /> Automatic billing</div>
                        </div>
                    </motion.div>

                    {/* ── Right: Payment ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-3 space-y-6"
                    >
                        {/* Coupon */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Ticket className="w-5 h-5 text-red-400" />
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Have a Coupon Code?</h3>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                                    placeholder="Enter code (e.g. SAVE20)"
                                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm uppercase font-mono focus:outline-none focus:border-red-500 transition-colors placeholder:normal-case placeholder:font-sans"
                                />
                                <button
                                    onClick={handleApplyCoupon}
                                    disabled={validating || !couponCode}
                                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
                                >
                                    {validating ? '...' : 'Apply'}
                                </button>
                            </div>
                            {couponError && <p className="text-red-400 text-xs mt-2">{couponError}</p>}
                            {appliedCoupon && (
                                <div className="mt-3 flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg">
                                    <span className="text-xs font-bold text-emerald-400">✓ {appliedCoupon.code} — {appliedCoupon.discount_percentage}% off applied!</span>
                                    <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="text-xs text-emerald-400/60 hover:text-emerald-400 underline">Remove</button>
                                </div>
                            )}
                        </div>

                        {/* Payment Section */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <CreditCard className="w-5 h-5 text-red-400" />
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Payment</h3>
                            </div>

                            {/* Payment Methods */}
                            <div className="bg-slate-950/60 border border-slate-700/50 rounded-xl p-5 mb-6">
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-4">Subscription powered by Razorpay</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {['UPI Auto-pay', 'Credit Card Autopay', 'Net Banking', 'Debit Card Autopay'].map((method) => (
                                        <div key={method} className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                                            <span className="text-xs text-slate-300 font-medium">{method}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Error State */}
                            <AnimatePresence>
                                {paymentError && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3"
                                    >
                                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-300">{paymentError}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Pay Button */}
                            <button
                                onClick={handlePayment}
                                disabled={paymentState === 'loading' || paymentState === 'processing' || paymentState === 'success'}
                                className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-lg rounded-xl transition-all shadow-lg shadow-red-900/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {paymentState === 'loading' && (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Preparing Checkout...</>
                                )}
                                {paymentState === 'processing' && (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                                )}
                                {paymentState === 'success' && (
                                    <><CheckCircle className="w-5 h-5" /> Subscribed!</>
                                )}
                                {(paymentState === 'idle' || paymentState === 'failed') && (
                                    <><Lock className="w-5 h-5" /> Start Subscription</>
                                )}
                            </button>

                            <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1.5">
                                <Shield className="w-3.5 h-3.5" />
                                Secure recurring payments via Razorpay • Instant access
                            </p>
                        </div>

                        {/* Logged in as */}
                        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    {user?.email?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Purchasing as</p>
                                    <p className="text-sm text-white font-semibold">{user?.email}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
