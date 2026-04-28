import React from 'react';
import { Bell } from 'lucide-react';

import { motion } from 'framer-motion';
const WebinarRegistration = () => {
    const [status, setStatus] = React.useState('idle');

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('submitting');
        // Simulate API call
        setTimeout(() => {
            setStatus('success');
        }, 1500);
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
                                <Bell className="w-10 h-10 text-green-500" />
                            </motion.div>
                        </div>
                        <h2 className="text-3xl font-bold mb-4 text-white">Registration Successful!</h2>
                        <p className="text-slate-300 text-lg mb-8">
                            Thank you for registering. We'll send you updates and reminders about upcoming webinars to your email.
                        </p>
                        <button
                            onClick={() => setStatus('idle')}
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

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Full Name"
                                className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                                required
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <input
                                type="tel"
                                placeholder="Phone Number"
                                className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                                required
                            />
                            <select className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500" required>
                                <option value="">Select Category</option>
                                <option value="neet">NEET Preparation</option>
                                <option value="counseling">Counseling Guide</option>
                                <option value="abroad">MBBS Abroad</option>
                                <option value="career">Career Guidance</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={status === 'submitting'}
                            className="w-full px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {status === 'submitting' ? 'Registering...' : 'Register for Updates'}
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
