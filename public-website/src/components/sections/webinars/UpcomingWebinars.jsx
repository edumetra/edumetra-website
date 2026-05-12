import React from 'react';
import { Calendar, Clock, Users, Phone, Mail, User, X, Loader2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../features/auth/AuthProvider';
import { supabase } from '../../../services/supabaseClient';
import { pushLeadToTeleCRM } from '../../../services/telecrm';

// ------------------------------------------------------------------
// Guest Interest Modal — shown when user is NOT logged in
// ------------------------------------------------------------------
const GuestInterestModal = ({ event, onClose, onSuccess }) => {
    const [form, setForm] = React.useState({ name: '', phone: '', email: '' });
    const [submitting, setSubmitting] = React.useState(false);
    const [error, setError] = React.useState('');

    // UUID v4 validation helper
    const isValidUUID = (str) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            // Only insert if event.id is a valid UUID (guards against slug-as-id DB rows)
            if (isValidUUID(event.id)) {
                const { error: dbErr } = await supabase
                    .from('event_registrations')
                    .insert([{
                        event_id: event.id,
                        user_id: null,
                        registration_type: 'guest',
                        status: 'registered',
                        guest_name: form.name,
                        guest_email: form.email,
                        guest_phone: form.phone
                    }]);

                if (dbErr && dbErr.code !== '23505') {
                    setError('Failed to register. Please try again.');
                    setSubmitting(false);
                    return;
                }
            }

            // TeleCRM touch point
            pushLeadToTeleCRM(
                {
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    status: 'Fresh'
                },
                ['Webinar Interest', event.title, event.category]
            );

            onSuccess(form.name);
        } catch (err) {
            setError('Something went wrong. Please try again.');
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
                initial={{ scale: 0.92, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">Show Interest</h3>
                        <p className="text-slate-400 text-sm line-clamp-2">{event.title}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-4 p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors flex-shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form className="p-6 space-y-4" onSubmit={handleSubmit}>
                    <p className="text-slate-300 text-sm">
                        Drop your details and we'll send you the webinar link & reminders!
                    </p>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Your Full Name"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="tel"
                            placeholder="Phone Number (for WhatsApp updates)"
                            value={form.phone}
                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {submitting ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Registering...</>
                        ) : (
                            '🎯 Register My Interest'
                        )}
                    </button>

                    <p className="text-slate-500 text-xs text-center">
                        We'll send a Zoom link + reminders. No spam, unsubscribe anytime.
                    </p>
                </form>
            </motion.div>
        </motion.div>
    );
};

// ------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------
const UpcomingWebinars = ({ events }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [registering, setRegistering] = React.useState(null);
    const [registeredIds, setRegisteredIds] = React.useState(new Set());
    const [toastMsg, setToastMsg] = React.useState('');
    const [guestModal, setGuestModal] = React.useState(null); // event object or null

    // On mount, check which events the current user is already registered for
    React.useEffect(() => {
        if (!user || events.length === 0) return;
        const eventIds = events.map(e => e.id);
        supabase
            .from('event_registrations')
            .select('event_id')
            .eq('user_id', user.id)
            .in('event_id', eventIds)
            .then(({ data }) => {
                if (data) {
                    setRegisteredIds(new Set(data.map(r => r.event_id)));
                }
            });
    }, [user, events]);

    const showToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 5000);
    };

    const handleShowInterest = async (event) => {
        // Not logged in → show guest capture modal
        if (!user) {
            setGuestModal(event);
            return;
        }

        if (registeredIds.has(event.id)) {
            showToast('You\'re already registered for this event!');
            return;
        }

        setRegistering(event.id);

        // Guard: only insert if event.id is a valid UUID
        const isValidUUID = (str) =>
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

        try {
            const { error } = isValidUUID(event.id)
                ? await supabase
                    .from('event_registrations')
                    .insert([{
                        event_id: event.id,
                        user_id: user.id,
                        registration_type: 'authenticated',
                        status: 'registered'
                    }])
                : { error: null }; // skip DB insert for malformed ids

            if (error && error.code !== '23505') {
                console.error('Registration failed:', error);
                showToast('❌ Registration failed. Please try again.');
            } else {
                // Mark as registered locally
                setRegisteredIds(prev => new Set([...prev, event.id]));

                // TeleCRM: push with phone if available
                const metadata = user.user_metadata || {};
                pushLeadToTeleCRM(
                    {
                        name: metadata.full_name || user.email?.split('@')[0] || 'User',
                        email: user.email,
                        phone: metadata.phone || '',
                        status: 'Fresh'
                    },
                    ['Webinar Interest', event.title, event.category]
                );

                showToast(`🎉 You're registered for "${event.title}"!`);
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setRegistering(null);
        }
    };

    const handleGuestSuccess = (guestName) => {
        setGuestModal(null);
        showToast(`🎉 Got it, ${guestName}! We'll send you the details soon.`);
    };

    return (
        <section className="section">
            <div className="container-custom">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Upcoming <span className="gradient-text">Events</span>
                    </h2>
                    <p className="text-slate-300 text-lg">
                        Register now for our upcoming webinars and workshops
                    </p>
                </div>

                {/* Toast notification */}
                <AnimatePresence>
                    {toastMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, x: '-50%' }}
                            exit={{ opacity: 0, y: -20, x: '-50%' }}
                            className="fixed top-24 left-1/2 z-[100] bg-slate-800/95 backdrop-blur border border-slate-600 text-white px-6 py-3 rounded-full font-semibold shadow-xl flex items-center gap-2 max-w-sm text-center text-sm"
                        >
                            {toastMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Guest modal */}
                <AnimatePresence>
                    {guestModal && (
                        <GuestInterestModal
                            event={guestModal}
                            onClose={() => setGuestModal(null)}
                            onSuccess={handleGuestSuccess}
                        />
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
                    {events.length === 0 ? (
                        <div className="col-span-2 text-center py-16 text-slate-400">
                            No upcoming events right now. Check back soon!
                        </div>
                    ) : events.map((event, index) => {
                        const isAlreadyRegistered = registeredIds.has(event.id);
                        const isThisRegistering = registering === event.id;

                        return (
                            <motion.div
                                key={event.id || index}
                                className={`group relative card overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/20 ${event.featured ? 'ring-2 ring-red-500/50' : ''}`}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5, scale: 1.01 }}
                            >
                                {/* Animated gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 via-red-500/5 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                {event.featured && (
                                    <div className="absolute -top-3 right-6 z-10">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-red-500 blur-sm animate-pulse-slow" />
                                            <div className="relative bg-gradient-to-r from-red-600 to-red-700 px-4 py-1 rounded-full text-white text-xs font-semibold shadow-lg">
                                                ⭐ Featured
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="relative flex flex-col md:flex-row gap-6">
                                    <div className="flex items-center justify-center bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl p-6 w-full md:w-28 h-28 flex-shrink-0 border border-red-500/20 group-hover:border-red-500/40 transition-colors">
                                        <div className="text-5xl group-hover:scale-110 transition-transform duration-300">{event.image}</div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 text-red-400 rounded text-xs font-semibold mb-3">
                                            {event.type}
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-3">
                                            {event.title}
                                        </h3>
                                        <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                                            {event.description}
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                <Calendar className="w-4 h-4 text-red-400" />
                                                {new Date(event.date).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric', year: 'numeric'
                                                })}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                <Clock className="w-4 h-4 text-red-400" />
                                                {event.time}
                                            </div>
                                            {event.attendees != null && (
                                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                                    <Users className="w-4 h-4 text-red-400" />
                                                    {event.attendees} registered
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-700">
                                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                {event.speaker?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-white">{event.speaker}</div>
                                                <div className="text-xs text-slate-400">{event.speakerTitle}</div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <Link
                                                to={`/webinars-seminars/${event.slug}`}
                                                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all text-center text-sm"
                                            >
                                                View Details
                                            </Link>
                                            <button
                                                onClick={() => handleShowInterest(event)}
                                                disabled={isThisRegistering || isAlreadyRegistered}
                                                className={`flex-1 px-4 py-2.5 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 text-sm ${
                                                    isAlreadyRegistered
                                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                                                        : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white disabled:opacity-50'
                                                }`}
                                            >
                                                {isThisRegistering ? (
                                                    <><Loader2 className="w-4 h-4 animate-spin" /> Registering...</>
                                                ) : isAlreadyRegistered ? (
                                                    '✅ Registered'
                                                ) : (
                                                    '🎯 Show Interest'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default UpcomingWebinars;
