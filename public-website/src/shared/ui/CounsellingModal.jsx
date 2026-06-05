import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle, AlertCircle, Phone, GraduationCap } from 'lucide-react';
import { useCounselling } from '../../features/counselling/CounsellingContext';
import { supabase } from '../../services/supabaseClient';
import { pushLeadToTeleCRM } from '../../services/telecrm';
import Button from './Button';
import { useAuth } from '../../features/auth/AuthProvider';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CounsellingModal = () => {
    const { isModalOpen, closeModal } = useCounselling();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [profileData, setProfileData] = useState(null);

    // Fetch user profile to ensure we get the latest phone number from user_profiles table
    useEffect(() => {
        let isMounted = true;
        if (isModalOpen && user) {
            const fetchProfile = async () => {
                try {
                    const { data } = await supabase
                        .from('user_profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();
                    if (data && isMounted) {
                        setProfileData(data);
                    }
                } catch (e) {
                    console.warn('Failed to fetch user profile for counselling modal:', e);
                }
            };
            fetchProfile();
        }
        return () => { isMounted = false; };
    }, [isModalOpen, user]);

    // Reset status when modal is closed
    useEffect(() => {
        if (!isModalOpen) {
            setStatus('idle');
        }
    }, [isModalOpen]);

    const userName = profileData?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Registered User';
    const userEmail = profileData?.email || user?.email || '';
    const storedPhone = profileData?.phone_number || user?.phone || user?.user_metadata?.phone || '';

    const handleConfirmBooking = async () => {
        if (!user || status === 'loading') return;
        
        setStatus('loading');
        
        try {
            const { error } = await supabase
                .from('counselling_requests')
                .insert([
                    {
                        name: userName,
                        phone: storedPhone,
                        email: userEmail,
                    }
                ]);

            if (error) throw error;

            // Push to TeleCRM (fire-and-forget)
            pushLeadToTeleCRM(
                {
                    name: userName,
                    phone: storedPhone,
                    email: userEmail,
                    status: 'Fresh',
                },
                ['Counselling Request', 'Free Session']
            );

            // Trigger Meta Pixel Lead event
            if (typeof window !== 'undefined' && window.fbq) {
                window.fbq('track', 'Lead', {
                    content_name: 'Counselling Request',
                });
            }

            if (!import.meta.env.DEV) {
                try {
                    fetch('/api/facebook-capi', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            eventName: 'Lead',
                            email: userEmail,
                            phone: storedPhone,
                            customData: {
                                content_name: 'Counselling Request',
                            }
                        })
                    });
                } catch (capiErr) {
                    console.warn('[CAPI Warning]: Failed to send counselling lead:', capiErr);
                }
            } else {
                console.log('[Dev] Skipped Facebook CAPI fetch on localhost.');
            }

            setStatus('success');
            setTimeout(() => {
                if (isModalOpen) {
                    closeModal();
                    setStatus('idle');
                }
            }, 3000);
        } catch (err) {
            console.error('Error submitting counselling request:', err);
            setStatus('error');
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
                    onClick={status !== 'loading' ? closeModal : undefined}
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
                            disabled={status === 'loading'}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        {!user ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-6"
                            >
                                <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Phone className="w-8 h-8 text-red-500" />
                                </div>
                                <h4 className="text-2xl font-bold text-white mb-2">Login Required</h4>
                                <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8">
                                    To book free counselling on your verified number, please sign in or create a free account.
                                </p>
                                <div className="space-y-3">
                                    <Button
                                        onClick={() => {
                                            closeModal();
                                            navigate(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
                                        }}
                                        variant="primary"
                                        className="w-full bg-red-600 hover:bg-red-700 py-3"
                                    >
                                        Sign In to Account
                                    </Button>
                                    <Link
                                        to={`/signup?returnUrl=${encodeURIComponent(window.location.pathname)}`}
                                        onClick={closeModal}
                                        className="w-full text-center border border-slate-700 hover:border-slate-600 bg-slate-800 text-white font-bold rounded-xl py-3 text-sm transition-all flex items-center justify-center"
                                    >
                                        Create Verified Account
                                    </Link>
                                </div>
                            </motion.div>
                        ) : status === 'success' ? (
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
                        ) : status === 'error' ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-8"
                            >
                                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-10 h-10 text-red-500" />
                                </div>
                                <h4 className="text-2xl font-bold text-white mb-2">Booking Failed</h4>
                                <p className="text-slate-400 mb-6">
                                    Something went wrong while booking your session. Please try again.
                                </p>
                                <Button
                                    onClick={() => setStatus('idle')}
                                    variant="primary"
                                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-sm"
                                >
                                    Try Again
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <p className="text-slate-400 text-sm mb-6">
                                        Please verify your details below. We will contact you on this number for your free counselling session.
                                    </p>
                                </div>
                                
                                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-400">Name</span>
                                        <span className="text-sm font-semibold text-white">{userName}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-400">Email</span>
                                        <span className="text-sm font-semibold text-white">{userEmail}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-400">Phone</span>
                                        <span className="text-sm font-semibold text-white">{storedPhone || 'Not provided'}</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleConfirmBooking}
                                    disabled={status === 'loading'}
                                    variant="primary"
                                    className="w-full bg-red-600 hover:bg-red-700 py-3 mt-4 flex items-center justify-center gap-2"
                                >
                                    {status === 'loading' ? (
                                        'Booking...'
                                    ) : (
                                        <>Confirm Booking <Send className="w-4 h-4" /></>
                                    )}
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CounsellingModal;
