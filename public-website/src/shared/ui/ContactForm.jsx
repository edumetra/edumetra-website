import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import Button from './Button';

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setStatus('loading');

        // Simulate API call - replace with actual implementation
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            // TODO: Replace with actual API call
            console.log('Form submitted:', formData);

            setStatus('success');
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: '',
            });

            // Reset success message after 5 seconds
            setTimeout(() => setStatus('idle'), 5000);
        } catch (error) {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-2">
                        Your Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full bg-slate-800/50 border ${errors.name ? 'border-red-500' : 'border-slate-700'
                            } rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all`}
                        placeholder="John Doe"
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                    )}
                </div>

                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
                        Email Address *
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full bg-slate-800/50 border ${errors.email ? 'border-red-500' : 'border-slate-700'
                            } rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all`}
                        placeholder="john@example.com"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                    )}
                </div>

                {/* Subject Field */}
                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-200 mb-2">
                        Subject *
                    </label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`w-full bg-slate-800/50 border ${errors.subject ? 'border-red-500' : 'border-slate-700'
                            } rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all`}
                        placeholder="What's this about?"
                    />
                    {errors.subject && (
                        <p className="mt-1 text-sm text-red-400">{errors.subject}</p>
                    )}
                </div>

                {/* Message Field */}
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-200 mb-2">
                        Message *
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        className={`w-full bg-slate-800/50 border ${errors.message ? 'border-red-500' : 'border-slate-700'
                            } rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none`}
                        placeholder="Tell us how we can help..."
                    />
                    {errors.message && (
                        <p className="mt-1 text-sm text-red-400">{errors.message}</p>
                    )}
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    icon={Send}
                    iconPosition="right"
                    disabled={status === 'loading'}
                    className="w-full"
                >
                    {status === 'loading' ? 'Sending...' : 'Send Message'}
                </Button>

                {/* Success Message */}
                {status === 'success' && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400"
                    >
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm">
                            Thank you! Your message has been sent successfully. We'll get back to you soon.
                        </p>
                    </motion.div>
                )}

                {/* Error Message */}
                {status === 'error' && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm">
                            Oops! Something went wrong. Please try again or contact us directly.
                        </p>
                    </motion.div>
                )}
            </form>
        </div>
    );
};

export default ContactForm;
