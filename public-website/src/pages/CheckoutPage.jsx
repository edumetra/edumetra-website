import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Check, Shield, Lock, CreditCard,
    Zap, Sparkles, Tag, Ticket, ChevronRight,
    FileText, Download, CheckCircle, AlertCircle, Loader2, X
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthProvider';
import { supabase } from '../services/supabaseClient';
import SEO from '../components/SEO';
import { pushLeadToTeleCRM } from '../services/telecrm';
import toast from 'react-hot-toast';

const ORDER_API = '/api/razorpay/create-order';

const PLANS = {
    premium: {
        id: 'premium',
        name: 'Premium',
        price: 3000,
        originalPrice: 10000,
        period: 'One-time payment',
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
        name: 'Plus',
        price: 30000,
        originalPrice: 50000,
        period: 'One-time payment',
        color: 'from-amber-500 to-yellow-500',
        badge: 'Elite Access',
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

// ── Main Component ────────────────────────────────────────────────────────────
const CheckoutPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const planKey = searchParams.get('plan') || 'premium';
    const plan = PLANS[planKey] || PLANS.premium;

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [validating, setValidating] = useState(false);
    const [couponError, setCouponError] = useState('');

    const [paymentState, setPaymentState] = useState('idle'); // idle | loading | processing | success | failed
    const [paymentError, setPaymentError] = useState('');
    const [invoice, setInvoice] = useState(null);
    const [showInvoice, setShowInvoice] = useState(false);

    useEffect(() => {
        if (!user) navigate('/login?redirect=/checkout?plan=' + planKey);
    }, [user, navigate, planKey]);

    useEffect(() => {
        if (user?.email) {
            pushLeadToTeleCRM(
                { email: user.email, status: 'Fresh' },
                ['Checkout Intent', `Plan: ${plan.name}`]
            );
        }
    }, [user, plan.name]);

    const discountedPrice = appliedCoupon
        ? Math.floor(plan.price * (1 - appliedCoupon.discount_percentage / 100))
        : plan.price;

    const savings = plan.originalPrice - discountedPrice;

    // ── Invoice Card ──────────────────────────────────────────────────────────────
    function InvoiceCard({ invoice, onClose }) {
        const [downloading, setDownloading] = useState(false);

        const handleDownload = async () => {
            setDownloading(true);
            try {
                const { default: jsPDF } = await import('jspdf');
                const doc = new jsPDF();
                
                // Professional PDF Header
                doc.setFillColor(15, 23, 42); // slate-900
                doc.rect(0, 0, 210, 40, 'F');
                
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(24);
                doc.setFont('helvetica', 'bold');
                doc.text('EDUMETRA', 20, 25);
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text('INVOICE / RECEIPT', 160, 25);
                
                // Body content
                doc.setTextColor(15, 23, 42);
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text('Bill To:', 20, 60);
                
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.text(user?.user_metadata?.full_name || 'Customer', 20, 68);
                doc.text(invoice.user_email, 20, 73);
                
                // Invoice details
                doc.setFont('helvetica', 'bold');
                doc.text('Invoice Details:', 130, 60);
                doc.setFont('helvetica', 'normal');
                doc.text(`Invoice #: ${invoice.invoice_number}`, 130, 68);
                doc.text(`Date: ${new Date().toLocaleDateString()}`, 130, 73);
                doc.text(`Status: PAID`, 130, 78);
                
                // Table-like structure
                doc.setDrawColor(226, 232, 240); // slate-200
                doc.line(20, 90, 190, 90);
                
                doc.setFont('helvetica', 'bold');
                doc.text('Description', 25, 98);
                doc.text('Period', 100, 98);
                doc.text('Amount', 165, 98);
                
                doc.line(20, 102, 190, 102);
                
                const totalAmount = Number(invoice.total_inr || invoice.total_paise / 100);
                const taxableAmount = totalAmount / 1.18;
                const gstAmount = totalAmount - taxableAmount;

                doc.setFont('helvetica', 'normal');
                doc.text(`${invoice.plan_type.toUpperCase()} Plan`, 25, 112);
                doc.text(invoice.billing_period, 100, 112);
                doc.text(`INR ${taxableAmount.toFixed(2)}`, 165, 112);
                
                doc.line(20, 120, 190, 120);
                
                // Summary
                doc.setFont('helvetica', 'normal');
                doc.text('Subtotal:', 110, 130);
                doc.text(`INR ${taxableAmount.toFixed(2)}`, 165, 130);
                
                doc.text('GST (18%):', 110, 138);
                doc.text(`INR ${gstAmount.toFixed(2)}`, 165, 138);
                
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(12);
                doc.text('Total Amount Paid:', 110, 150);
                doc.text(`INR ${totalAmount.toFixed(2)}`, 165, 150);
                
                // Footer
                doc.setFontSize(9);
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(100, 116, 139);
                doc.text('Thank you for choosing Edumetra. For support, contact support@edumetra.com', 105, 280, { align: 'center' });
                doc.text(`Payment ID: ${invoice.razorpay_payment_id}`, 105, 285, { align: 'center' });
                
                doc.save(`Invoice-${invoice.invoice_number}.pdf`);
            } catch (e) {
                console.error('PDF error:', e);
                window.print();
            } finally {
                setDownloading(false);
            }
        };

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            >
                <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl w-full max-w-lg shadow-2xl shadow-emerald-900/20 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-black text-lg">Payment Successful!</h3>
                                <p className="text-emerald-100 text-xs">Your account has been upgraded</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm">Invoice Number</span>
                            <span className="text-white font-bold font-mono">{invoice.invoice_number}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm">Plan</span>
                            <span className="text-white font-semibold capitalize">{invoice.plan_type} Plan</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm">Billing Period</span>
                            <span className="text-white font-semibold">{invoice.billing_period}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-sm">Email</span>
                            <span className="text-white text-sm truncate max-w-[200px]">{invoice.user_email}</span>
                        </div>
                        <div className="border-t border-slate-800 pt-3 space-y-2">
                            <div className="flex justify-between text-white font-black text-lg pt-1 border-t border-slate-800">
                                <span>Total Paid</span>
                                <span>₹{Number(invoice.total_inr || invoice.total_paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-3 text-xs text-slate-400">
                            <span className="font-mono text-slate-300">Payment ID: </span>
                            {invoice.razorpay_payment_id}
                        </div>
                    </div>

                    <div className="px-6 pb-6 space-y-3">
                        <div className="flex gap-3">
                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all text-sm disabled:opacity-60"
                            >
                                {downloading
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                                    : <><Download className="w-4 h-4" /> Download PDF</>
                                }
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold rounded-xl transition-all text-sm"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

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

    // ── Razorpay Payment Flow (One-time Order) ──────────────────────────────────
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

            // 2. Create order via same-origin serverless function
            const orderRes = await fetch(ORDER_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    planType: plan.id,
                    couponCode: appliedCoupon?.code || null,
                }),
            });

            const orderData = await orderRes.json();
            if (!orderRes.ok || !orderData.orderId) {
                throw new Error(orderData.error || 'Failed to initialize checkout.');
            }

            // 3. Open Razorpay checkout
            setPaymentState('processing');

            const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

            const options = {
                key: razorpayKey,
                amount: orderData.amount,
                currency: 'INR',
                name: 'Edumetra',
                description: `${plan.name} Plan — One-time Payment`,
                order_id: orderData.orderId,
                prefill: {
                    email: user.email,
                    name: user.user_metadata?.full_name || '',
                },
                theme: { color: '#ef4444' },
                modal: {
                    ondismiss: () => {
                        setPaymentState('idle');
                        setPaymentError('Payment cancelled. You can try again.');
                        pushLeadToTeleCRM(
                            { email: user.email, status: 'Fresh' },
                            ['Payment Modal Cancelled', `Plan: ${plan.name}`]
                        );
                    },
                },
                handler: async (response) => {
                    setPaymentState('processing');
                    
                    try {
                        const verifyRes = await fetch('/api/razorpay/verify-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                userId: user.id,
                                planType: plan.id
                            }),
                        });

                        const verifyData = await verifyRes.json();
                        if (verifyRes.ok && verifyData.success) {
                            setInvoice(verifyData.invoice);
                            setPaymentState('success');
                            setShowInvoice(true);
                            toast.success('Payment verified! Invoice generated.');

                            pushLeadToTeleCRM(
                                { email: user.email, status: 'Won' },
                                [`Payment Success: ${plan.name}`, `Invoice: ${verifyData.invoice.invoice_number}`]
                            );
                        } else {
                            throw new Error(verifyData.error || 'Payment verification failed.');
                        }
                    } catch (err) {
                        setPaymentState('failed');
                        setPaymentError('Payment was successful but we couldn\'t generate your invoice. Please contact support with your Payment ID: ' + response.razorpay_payment_id);
                    }
                    setTimeout(() => navigate('/dashboard'), 2000);
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (resp) => {
                setPaymentState('failed');
                setPaymentError(resp.error?.description || 'Payment failed. Please try again.');
                pushLeadToTeleCRM(
                    { email: user.email, status: 'Fresh' },
                    ['Payment Failed', `Plan: ${plan.name}`, `Error: ${resp.error?.description || 'Unknown'}`]
                );
            });
            rzp.open();

        } catch (err) {
            setPaymentState('failed');
            setPaymentError(err.message || 'Something went wrong. Please try again.');
        }
    }, [user, plan, appliedCoupon, navigate]);

    const PlanIcon = plan.icon;

    return (
        <>
            <SEO page="checkout" />

            {/* Invoice Modal */}
            <AnimatePresence>
                {showInvoice && invoice && (
                    <InvoiceCard
                        invoice={invoice}
                        onClose={() => { setShowInvoice(false); navigate('/dashboard'); }}
                    />
                )}
            </AnimatePresence>

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

                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Payment Details</h3>
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
                                
                                <div className="border-t border-slate-800 pt-3 flex justify-between text-slate-400 text-xs">
                                    <span>Taxable Amount</span>
                                    <span>₹{discountedPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-400 text-xs">
                                    <span>GST (18%)</span>
                                    <span>₹{Math.floor(discountedPrice * 0.18).toLocaleString()}</span>
                                </div>

                                <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline">
                                    <span className="text-white font-bold">Total Amount</span>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-white">₹{Math.floor(discountedPrice * 1.18).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                                <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-slate-400" /> Secure checkout</div>
                                <div className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-slate-400" /> Data encrypted</div>
                                <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-slate-400" /> Instant activation</div>
                            </div>
                        </motion.div>

                        {/* ── Right: Payment ── */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-3 space-y-6"
                        >
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

                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <CreditCard className="w-5 h-5 text-red-400" />
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Payment</h3>
                                </div>

                                <div className="bg-slate-950/60 border border-slate-700/50 rounded-xl p-5 mb-6">
                                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-4">Payment powered by Razorpay</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['UPI Payment', 'Credit Card', 'Net Banking', 'Debit Card'].map((method) => (
                                            <div key={method} className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2.5">
                                                <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                                                <span className="text-xs text-slate-300 font-medium">{method}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

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
                                        <><CheckCircle className="w-5 h-5" /> Success!</>
                                    )}
                                    {(paymentState === 'idle' || paymentState === 'failed') && (
                                        <><Lock className="w-5 h-5" /> Pay Now</>
                                    )}
                                </button>

                                <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1.5">
                                    <Shield className="w-3.5 h-3.5" />
                                    Secure one-time payment via Razorpay • Instant access
                                </p>
                            </div>

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
        </>
    );
};

export default CheckoutPage;
