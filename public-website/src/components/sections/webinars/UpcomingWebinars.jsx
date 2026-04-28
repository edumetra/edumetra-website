import React from 'react';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const UpcomingWebinars = ({ events }) => {
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
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

                                    <Link 
                                        to={`/webinars-seminars/${event.slug}`}
                                        className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                                    >
                                        View Details & Register
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
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
