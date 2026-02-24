import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Play } from 'lucide-react';

const PastWebinars = ({ events }) => {
    return (
        <section className="section">
            <div className="container-custom">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Past <span className="gradient-text">Webinars</span>
                    </h2>
                    <p className="text-slate-300 text-lg">
                        Watch recordings of our popular past sessions
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {events.map((event, index) => (
                        <motion.div
                            key={index}
                            className="card group hover:shadow-2xl transition-all cursor-pointer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="relative flex items-center justify-center bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-xl p-8 mb-4">
                                <div className="text-6xl">{event.image}</div>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                                        <Play className="w-6 h-6 text-white ml-1" />
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">
                                {event.title}
                            </h3>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(event.date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <Clock className="w-4 h-4" />
                                    {event.duration}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <Play className="w-4 h-4" />
                                    {event.views.toLocaleString()} views
                                </div>
                            </div>

                            <button className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2">
                                <Play className="w-4 h-4" />
                                Watch Recording
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PastWebinars;
