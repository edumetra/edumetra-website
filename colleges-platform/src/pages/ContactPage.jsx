import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, User, MessageSquare, Send, CheckCircle2, ChevronRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import SEOHead from '../components/SEOHead';
import { pushLeadToTeleCRM } from '../services/telecrm';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.phone) {
            toast.error("Please provide your name and phone number.");
            return;
        }

        // Basic phone validation (10 digits)
        const phoneRegex = /^[0-9]{10}$/;
        const cleanPhone = formData.phone.replace(/\D/g, '');
        if (!phoneRegex.test(cleanPhone)) {
            toast.error("Please enter a valid 10-digit phone number.");
            return;
        }

        setLoading(true);

        try {
            // Push lead directly to TeleCRM
            await pushLeadToTeleCRM({
                name: formData.name,
                phone: formData.phone,
                query: formData.message || "Requested expert callback"
            }, ['Expert Counselling Request', 'Contact Page']);

            setSubmitted(true);
            toast.success("Request received! An expert will call you shortly.");
            
            // Track conversion if FB pixel is loaded
            if (typeof window !== 'undefined' && window.fbq) {
                window.fbq('track', 'Lead');
            }
        } catch (err) {
            toast.error("Something went wrong. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 pt-24 pb-20">
            <SEOHead
                title="Talk to an Expert | Edumetra"
                description="Get personalized, expert guidance for your medical college admission journey. Request a callback from our senior counsellors today."
                url="/contact"
            />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    
                    {/* Left side text / info */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-wider mb-6">
                                <ShieldCheck className="w-4 h-4" /> Trusted Counselling
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                                Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400">Expert Guidance</span> for Your Future
                            </h1>
                            <p className="text-slate-400 text-lg md:text-xl leading-relaxed">
                                Don't let confusing admission processes cost you a medical seat. Talk directly to our senior counsellors to build a foolproof admission strategy based on your exact profile.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {[
                                "Personalised admission roadmap based on your exam score",
                                "Hidden gems and alternative college options",
                                "Direct assistance with complex state counselling procedures"
                            ].map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-1">
                                        <CheckCircle2 className="w-4 h-4 text-red-400" />
                                    </div>
                                    <p className="text-slate-300 font-medium">{feature}</p>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                            <p className="text-sm text-slate-400 italic">
                                "The expert counselling I received was a game changer. I secured a seat in a college I didn't even know I was eligible for!"
                            </p>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                    A
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">Anjali S.</p>
                                    <p className="text-slate-500 text-xs">Medical Aspirant (2024)</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right side form */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />
                        
                        {submitted ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-4">Request Received!</h3>
                                <p className="text-slate-400 mb-8">
                                    Thank you, {formData.name}. One of our senior admission experts will call you shortly on +91 {formData.phone.replace(/\D/g, '')}.
                                </p>
                                <button 
                                    onClick={() => {
                                        setSubmitted(false);
                                        setFormData({ name: '', phone: '', message: '' });
                                    }}
                                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
                                >
                                    Submit Another Request
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold text-white mb-2">Request a Call Back</h2>
                                <p className="text-slate-400 mb-8 text-sm">Enter your details below and we'll reach out to you within 24 hours.</p>

                                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                            <input 
                                                type="text" 
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="John Doe"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                            <span className="absolute left-11 top-1/2 -translate-y-1/2 text-slate-400 font-medium">+91</span>
                                            <input 
                                                type="tel" 
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="98765 43210"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-20 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">Message or Query (Optional)</label>
                                        <div className="relative">
                                            <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                                            <textarea 
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                placeholder="Briefly describe what you need help with..."
                                                rows="3"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all resize-none"
                                            ></textarea>
                                        </div>
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-red-900/30"
                                    >
                                        {loading ? 'Submitting...' : (
                                            <>Get Expert Callback <Send className="w-4 h-4 ml-1" /></>
                                        )}
                                    </button>
                                    <p className="text-center text-slate-500 text-xs mt-4">
                                        Your information is secure. We never share your data.
                                    </p>
                                </form>
                            </>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
