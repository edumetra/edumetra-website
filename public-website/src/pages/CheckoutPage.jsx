import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Check, Shield, Lock, CreditCard,
    Zap, Sparkles, Tag, Ticket, ChevronRight, Clock
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthProvider';
import { supabase } from '../services/supabaseClient';
import SEO from '../components/SEO';

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

const CheckoutPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const planKey = searchParams.get('plan') || 'premium';
    const plan = PLANS[planKey] || PLANS.premium;

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setCouponApplied] = useState(null);
    const [validating, setValidating] = useState(false);
    const [couponError, setCouponError] = useState('');

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    const discountedPrice = appliedCoupon
        ? Math.floor(plan.price * (1 - appliedCoupon.discount_percentage / 100))
        : plan.price;

    const savings = plan.originalPrice - discountedPrice;

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
                setCouponApplied(null);
            } else if (data.expires_at && new Date(data.expires_at) < new Date()) {
                setCouponError('This coupon has expired.');
                setCouponApplied(null);
            } else if (data.max_uses && data.used_count >= data.max_uses) {
                setCouponError('Coupon usage limit reached.');
                setCouponApplied(null);
            } else {
                setCouponApplied(data);
                setCouponError('');
            }
        } catch {
            setCouponError('Failed to validate coupon.');
        } finally {
            setValidating(false);
        }
    };

    const PlanIcon = plan.icon;

    return (
        <>
            <SEO page="checkout" />
            <div className="min-h-screen bg-slate-950 pt-32 pb-20 px-4">
                <div className="max-w-5xl mx-auto">
                    {/* Back */}
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
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Order Summary</h3>
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
                                    <span className="text-white font-bold">Total</span>
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

                            {/* Trust */}
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-slate-400" /> Secure checkout</div>
                                <div className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-slate-400" /> Data encrypted</div>
                                <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> Cancel anytime</div>
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
                                        <button onClick={() => { setCouponApplied(null); setCouponCode(''); }} className="text-xs text-emerald-400/60 hover:text-emerald-400 underline">Remove</button>
                                    </div>
                                )}
                            </div>

                            {/* Payment Section */}
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <CreditCard className="w-5 h-5 text-red-400" />
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Payment</h3>
                                </div>

                                {/* Coming Soon Placeholder */}
                                <div className="bg-slate-950 border-2 border-dashed border-slate-700 rounded-xl p-10 text-center mb-6">
                                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <CreditCard className="w-8 h-8 text-slate-500" />
                                    </div>
                                    <h4 className="text-white font-bold text-lg mb-2">Payment Gateway</h4>
                                    <p className="text-slate-400 text-sm max-w-xs mx-auto">
                                        Secure payment via Razorpay is being integrated. You'll be able to pay with UPI, Cards, Net Banking & Wallets.
                                    </p>
                                    <div className="flex items-center justify-center gap-3 mt-5 text-slate-600 text-xs font-semibold">
                                        <span>UPI</span><span>•</span><span>VISA</span><span>•</span><span>Mastercard</span><span>•</span><span>Net Banking</span>
                                    </div>
                                </div>

                                {/* Proceed Button (disabled until payment is integrated) */}
                                <button
                                    disabled
                                    className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-lg rounded-xl transition-all shadow-lg shadow-red-900/20 opacity-50 cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    <Lock className="w-5 h-5" />
                                    Proceed to Payment — ₹{discountedPrice.toLocaleString()}/{plan.period.replace('per ', '')}
                                </button>

                                <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1.5">
                                    <Shield className="w-3.5 h-3.5" />
                                    Payment integration coming soon. Your order details have been saved.
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
                                <Link to="/dashboard" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                                    Dashboard <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CheckoutPage;
