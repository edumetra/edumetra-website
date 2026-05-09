import React from 'react';
import { Bell, CheckCircle, Loader2 } from 'lucide-react';
import { pushLeadToTeleCRM } from '../../../services/telecrm';
import { supabase } from '../../../services/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

const WebinarRegistration = () => {
    const [status, setStatus] = React.useState('idle'); // idle | submitting | success | error
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        phone: '',
        category: ''
    });
    const [errorMsg, setErrorMsg] = React.useState('');

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        setErrorMsg('');

        try {
            // 1. Save to Supabase webinar_interests table
            const { error: dbError } = await supabase
                .from('webinar_interests')
                .insert([{
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    category: formData.category || null,
                    source: 'webinar-page'
                }]);

            if (dbError) {
                console.warn('[WebinarRegistration] DB insert warning:', dbError.message);
                // Don't block the user — still proceed
            }

            // 2. Fire-and-forget TeleCRM push
            pushLeadToTeleCRM(
                {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    status: 'Fresh',
                },
                ['Webinar Interest', ...(formData.category ? [formData.category] : [])].filter(Boolean)
            );

            setStatus('success');
        } catch (err) {
            console.error('[WebinarRegistration] Unexpected error:', err);
            setErrorMsg('Something went wrong. Please try again.');
            setStatus('error');
        }
    };

    const reset = () => {
        setStatus('idle');
        setFormData({ name: '', email: '', phone: '', category: '' });
        setErrorMsg('');
    };

    if (status === 'success') {
        return (
            <section className="section bg-slate-900/30">
                <div className="container-custom">
                    <motion.div
                        className="card max-w-3xl mx-auto text-center py-12"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            >
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </motion.div>
                        </div>
                        <h2 className="text-3xl font-bold mb-4 text-white">You're on the list! 🎉</h2>
                        <p className="text-slate-300 text-lg mb-8">
                            Thanks for registering your interest, <span className="text-white font-semibold">{formData.name}</span>!
                            We'll notify you about upcoming webinars and share exclusive resources.
                        </p>
                        <button
                            onClick={reset}
                            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all"
                        >
                            Register for Another Topic
                        </button>
                    </motion.div>
                </div>
            </section>
        );
    }

    return (
        <section className="section bg-slate-900/30">
            <div className="container-custom">
                <motion.div
                    className="card max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bell className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">
                            Never Miss an <span className="gradient-text">Event</span>
                        </h2>
                        <p className="text-slate-300">
                            Register to get notified about upcoming webinars and exclusive study materials
                        </p>
                    </div>

                    <AnimatePresence>
                        {status === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm text-center"
                            >
                                ⚠️ {errorMsg}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Full Name"
                                className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email Address"
                                className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                                required
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Phone Number"
                                className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                                required
                            />
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                required
                            >
                                <option value="">Select Category of Interest</option>
                                <option value="NEET Preparation">NEET Preparation</option>
                                <option value="Counseling Guide">Counseling Guide</option>
                                <option value="MBBS Abroad">MBBS Abroad</option>
                                <option value="Career Guidance">Career Guidance</option>
                                <option value="Study Tips">Study Tips</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={status === 'submitting'}
                            className="w-full px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {status === 'submitting' ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Registering...
                                </>
                            ) : (
                                <>
                                    <Bell className="w-4 h-4" />
                                    Notify Me About Webinars
                                </>
                            )}
                        </button>
                        <p className="text-slate-400 text-sm text-center">
                            By registering, you agree to receive webinar notifications and updates. Unsubscribe anytime.
                        </p>
                    </form>
                </motion.div>
            </div>
        </section>
    );
};

export default WebinarRegistration;
