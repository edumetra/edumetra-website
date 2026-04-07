import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle, AlertCircle, Phone, User, Mail, GraduationCap, MapPin } from 'lucide-react';
import { useCounselling } from '../../features/counselling/CounsellingContext';
import { supabase } from '../../services/supabaseClient';
import Button from './Button';

const CounsellingModal = () => {
    const { isModalOpen, closeModal } = useCounselling();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        neet_marks: '',
        city: '',
    });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Enter a valid 10-digit phone number';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Enter a valid email address';
        }
        if (!formData.neet_marks) {
          newErrors.neet_marks = 'NEET marks are required';
        } else if (isNaN(formData.neet_marks) || formData.neet_marks < 0 || formData.neet_marks > 720) {
          newErrors.neet_marks = 'Enter valid NEET marks (0-720)';
        }
        if (!formData.city.trim()) newErrors.city = 'City is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setStatus('loading');
        try {
            const { error } = await supabase
                .from('counselling_requests')
                .insert([
                    {
                        name: formData.name,
                        phone: formData.phone,
                        email: formData.email,
                        neet_marks: parseInt(formData.neet_marks),
                        city: formData.city,
                    }
                ]);

            if (error) throw error;

            // Trigger Meta Pixel Lead event
            if (typeof window !== 'undefined' && window.fbq) {
                window.fbq('track', 'Lead', {
                    content_name: 'Counselling Request',
                    city: formData.city
                });
            }

            setStatus('success');
            setFormData({ name: '', phone: '', email: '', neet_marks: '', city: '' });
            setTimeout(() => {
                closeModal();
                setStatus('idle');
            }, 3000);
        } catch (err) {
            console.error('Error submitting counselling request:', err);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    if (!isModalOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={closeModal}
                    className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Book Free Counselling</h3>
                        </div>
                        <button
                            onClick={closeModal}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        {status === 'success' ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-8"
                            >
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-10 h-10 text-green-500" />
                                </div>
                                <h4 className="text-2xl font-bold text-white mb-2">Thank You!</h4>
                                <p className="text-slate-400">
                                    Your request has been received. Our expert counsellors will contact you shortly.
                                </p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Name */}
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                            <User className="w-4 h-4" /> Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Full Name"
                                            className={`w-full bg-slate-800/50 border ${errors.name ? 'border-red-500' : 'border-slate-700'} rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all`}
                                        />
                                        {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                            <Phone className="w-4 h-4" /> Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="10-digit number"
                                            className={`w-full bg-slate-800/50 border ${errors.phone ? 'border-red-500' : 'border-slate-700'} rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all`}
                                        />
                                        {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                        <Mail className="w-4 h-4" /> Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john@example.com"
                                        className={`w-full bg-slate-800/50 border ${errors.email ? 'border-red-500' : 'border-slate-700'} rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all`}
                                    />
                                    {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* NEET Marks */}
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4" /> NEET Marks
                                        </label>
                                        <input
                                            type="number"
                                            name="neet_marks"
                                            value={formData.neet_marks}
                                            onChange={handleChange}
                                            placeholder="Expected / Actual"
                                            className={`w-full bg-slate-800/50 border ${errors.neet_marks ? 'border-red-500' : 'border-slate-700'} rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all`}
                                        />
                                        {errors.neet_marks && <p className="text-xs text-red-400">{errors.neet_marks}</p>}
                                    </div>

                                    {/* City */}
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                            <MapPin className="w-4 h-4" /> City
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            placeholder="Your City"
                                            className={`w-full bg-slate-800/50 border ${errors.city ? 'border-red-500' : 'border-slate-700'} rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all`}
                                        />
                                        {errors.city && <p className="text-xs text-red-400">{errors.city}</p>}
                                    </div>
                                </div>

                                {status === 'error' && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        Failed to submit. Please try again.
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full bg-red-600 hover:bg-red-700 py-3"
                                    disabled={status === 'loading'}
                                >
                                    {status === 'loading' ? 'Submitting...' : 'Book Free Counselling'}
                                </Button>
                                
                                <p className="text-[10px] text-center text-slate-500 mt-4">
                                    By clicking this button, you agree to our terms and conditions.
                                </p>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CounsellingModal;
