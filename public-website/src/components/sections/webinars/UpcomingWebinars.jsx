import React from 'react';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../features/auth/AuthProvider';
import { supabase } from '../../../services/supabaseClient';
import { pushLeadToTeleCRM } from '../../../services/telecrm';

const UpcomingWebinars = ({ events }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [registering, setRegistering] = React.useState(null);
    const [successMessage, setSuccessMessage] = React.useState('');

    const handleShowInterest = async (event) => {
        if (!user) {
            // Redirect to login with returnUrl
            navigate(`/login?returnUrl=${encodeURIComponent(location.pathname)}`);
            return;
        }

        setRegistering(event.id);
        try {
            const { error } = await supabase
                .from('event_registrations')
                .insert([{ event_id: event.id, user_id: user.id, status: 'registered' }]);

            if (error && error.code !== '23505') { // Ignore unique constraint violation if already registered
                console.error('Registration failed:', error);
                alert('Failed to register. Please try again.');
            } else {
                // TeleCRM Integration
                try {
                    pushLeadToTeleCRM({
                        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User',
                        email: user.email,
                        status: 'Fresh'
                    }, ['Webinar Interest', event.title]);
                } catch(e) {}

                setSuccessMessage('Thank you for your registration!');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setRegistering(null);
        }
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto relative">
                    <AnimatePresence>
                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -20, x: '-50%' }}
                                animate={{ opacity: 1, y: 0, x: '-50%' }}
                                exit={{ opacity: 0, y: -20, x: '-50%' }}
                                className="fixed top-24 left-1/2 z-[100] bg-emerald-500/90 backdrop-blur border border-emerald-400 text-white px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2"
                            >
                                <span>🎉</span> {successMessage}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {events.map((event, index) => (
                        <motion.div
                            key={index}
                            className={`group relative card overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/20 ${event.featured ? 'ring-2 ring-red-500/50' : ''
                                }`}
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
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <Clock className="w-4 h-4 text-red-400" />
                                            {event.time}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <Users className="w-4 h-4 text-red-400" />
                                            {event.attendees} registered
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-700">
                                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {event.speaker.charAt(0)}
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
                                            disabled={registering === event.id}
                                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                                        >
                                            {registering === event.id ? 'Registering...' : 'Show Interest'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default UpcomingWebinars;
