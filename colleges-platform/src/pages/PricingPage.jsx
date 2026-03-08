import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, Zap, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const PricingPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async (tier) => {
        setLoading(true);
        try {
            // 1. Check Auth
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error('Please log in to subscribe.');
                navigate('/login');
                return;
            }

            const user = session.user;

            // 2. Load Razorpay Script (if not already loaded)
            const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
            if (!res) {
                toast.error('Razorpay SDK failed to load. Are you offline?');
                return;
            }

            // 3. Fake Order Creation for Demo (In production, replace this with an API call to your backend to generate a real Razorpay Order ID)
            // For this implementation, we will pass notes to a dummy checkout to simulate the flow
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY',
                amount: tier === 'premium' ? 299900 : 99900, // Amount in paise (e.g., 2999 INR = 299900 paise)
                currency: 'INR',
                name: 'Edumetra',
                description: `${tier.toUpperCase()} Subscription Verification`,
                image: 'https://edumetra.com/logo.png', // Replace with actual logo URL
                // order_id: "order_9A33XWu170gUtm" // In production, this comes from an backend API
                handler: async function (response) {
                    // Triggered on client-side success
                    console.log('Payment Successful', response);
                    toast.success(`Successfully subscribed to ${tier.toUpperCase()}! You will be redirected shortly.`);

                    // Note: The actual database upgrade happens via Webhook using the notes below.
                    setTimeout(() => navigate('/profile'), 2000);
                },
                prefill: {
                    name: user.user_metadata?.full_name || '',
                    email: user.email,
                },
                notes: {
                    user_id: user.id, // Crucial for Webhook
                    plan_type: tier
                },
                theme: {
                    color: '#3B82F6'
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

    // Helper to dynamically load Razorpay script
    const loadScript = (src) => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center">
                    <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Pricing</h2>
                    <p className="mt-2 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                        Upgrade your college hunt.
                    </p>
                    <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
                        Unlock premium data, personalized counseling, and predictive admissions tools to get into your dream college.
                    </p>
                </div>

                <div className="mt-16 sm:mt-24 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">

                    {/* FREE TIER */}
                    <div className="relative p-8 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col hover:border-blue-200 transition-colors">
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900">Signed Up</h3>
                            <p className="mt-4 flex items-baseline text-gray-900">
                                <span className="text-5xl font-extrabold tracking-tight">₹0</span>
                                <span className="ml-1 text-xl font-semibold">/forever</span>
                            </p>
                            <p className="mt-6 text-gray-500">Basic access to our college database.</p>
                            <ul className="mt-6 space-y-6">
                                <li className="flex">
                                    <Check className="flex-shrink-0 w-6 h-6 text-green-500" />
                                    <span className="ml-3 text-gray-500">View Public Colleges</span>
                                </li>
                                <li className="flex">
                                    <Check className="flex-shrink-0 w-6 h-6 text-green-500" />
                                    <span className="ml-3 text-gray-500">Read Verified Reviews</span>
                                </li>
                                <li className="flex">
                                    <Check className="flex-shrink-0 w-6 h-6 text-green-500" />
                                    <span className="ml-3 text-gray-500">Save up to 5 Colleges</span>
                                </li>
                            </ul>
                        </div>
                        <button
                            onClick={() => navigate('/signup')}
                            className="mt-8 block w-full bg-blue-50 border border-blue-200 rounded-lg py-3 px-6 text-center font-medium text-blue-700 hover:bg-blue-100"
                        >
                            Get Started
                        </button>
                    </div>

                    {/* PRO TIER */}
                    <div className="relative p-8 bg-white border-2 border-blue-500 rounded-2xl shadow-xl flex flex-col transform md:-translate-y-4">
                        <div className="absolute top-0 py-1.5 px-4 bg-blue-500 rounded-full text-xs font-semibold uppercase tracking-wide text-white transform -translate-y-1/2">
                            Most Popular
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                                Pro <Zap className="w-5 h-5 ml-2 text-blue-500" />
                            </h3>
                            <p className="mt-4 flex items-baseline text-gray-900">
                                <span className="text-5xl font-extrabold tracking-tight">₹999</span>
                                <span className="ml-1 text-xl font-semibold">/year</span>
                            </p>
                            <p className="mt-6 text-gray-500">Powerful tools for serious students.</p>
                            <ul className="mt-6 space-y-6">
                                <li className="flex">
                                    <Check className="flex-shrink-0 w-6 h-6 text-blue-500" />
                                    <span className="ml-3 text-gray-500 flex-1">Everything in Free</span>
                                </li>
                                <li className="flex">
                                    <Check className="flex-shrink-0 w-6 h-6 text-blue-500" />
                                    <span className="ml-3 text-gray-500 flex-1">Unlock Placement Stats & Cutoffs</span>
                                </li>
                                <li className="flex">
                                    <Check className="flex-shrink-0 w-6 h-6 text-blue-500" />
                                    <span className="ml-3 text-gray-500 flex-1">Unlimited Saving & Shortlisting</span>
                                </li>
                            </ul>
                        </div>
                        <button
                            onClick={() => handleSubscribe('pro')}
                            disabled={loading}
                            className="mt-8 block w-full bg-blue-600 border border-transparent rounded-lg py-3 px-6 text-center font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            Subscribe to Pro
                        </button>
                    </div>

                    {/* PREMIUM TIER */}
                    <div className="relative p-8 bg-gray-900 border border-gray-900 rounded-2xl shadow-sm flex flex-col transition-all">
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-white flex items-center">
                                Premium <Sparkles className="w-5 h-5 ml-2 text-yellow-400" />
                            </h3>
                            <p className="mt-4 flex items-baseline text-white">
                                <span className="text-5xl font-extrabold tracking-tight">₹2999</span>
                                <span className="ml-1 text-xl font-medium text-gray-400">/year</span>
                            </p>
                            <p className="mt-6 text-gray-400">The ultimate edge in admissions.</p>
                            <ul className="mt-6 space-y-6">
                                <li className="flex">
                                    <Check className="flex-shrink-0 w-6 h-6 text-yellow-400" />
                                    <span className="ml-3 text-gray-300">Everything in Pro</span>
                                </li>
                                <li className="flex">
                                    <Check className="flex-shrink-0 w-6 h-6 text-yellow-400" />
                                    <span className="ml-3 text-gray-300">1-on-1 Expert Counseling Server</span>
                                </li>
                                <li className="flex">
                                    <Check className="flex-shrink-0 w-6 h-6 text-yellow-400" />
                                    <span className="ml-3 text-gray-300">Admissions Probability Calculator</span>
                                </li>
                            </ul>
                        </div>
                        <button
                            onClick={() => handleSubscribe('premium')}
                            disabled={loading}
                            className="mt-8 block w-full bg-white border border-transparent rounded-lg py-3 px-6 text-center font-medium text-gray-900 hover:bg-gray-100 disabled:opacity-50"
                        >
                            Get Premium
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PricingPage;
