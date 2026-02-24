import React from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle } from 'lucide-react';

const CountryDestinations = ({ countries }) => {
    return (
        <section className="section">
            <div className="container-custom">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Popular <span className="gradient-text">Destinations</span>
                    </h2>
                    <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                        Compare top countries for MBBS and choose the best fit for your future
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {countries.map((country, index) => (
                        <motion.div
                            key={index}
                            className={`card ${country.popular ? 'ring-2 ring-red-500' : ''}`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            {country.popular && (
                                <div className="absolute -top-3 right-6">
                                    <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-1 rounded-full text-white text-xs font-semibold">
                                        Most Popular
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-4 mb-6">
                                <div className="text-5xl">{country.flag}</div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">{country.name}</h3>
                                    <p className="text-red-400 font-semibold">{country.universities} Universities</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <div className="text-slate-400 text-sm">Total Fee</div>
                                    <div className="text-white font-semibold">{country.tuitionFee}</div>
                                </div>
                                <div>
                                    <div className="text-slate-400 text-sm">Duration</div>
                                    <div className="text-white font-semibold">{country.duration}</div>
                                </div>
                                <div>
                                    <div className="text-slate-400 text-sm">Medium</div>
                                    <div className="text-white font-semibold">{country.mediumOfTeaching}</div>
                                </div>
                                <div>
                                    <div className="text-slate-400 text-sm">Eligibility</div>
                                    <div className="text-white font-semibold">{country.eligibility}</div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                                    <Award className="w-4 h-4" />
                                    {country.recognition}
                                </div>
                            </div>

                            <div className="space-y-2">
                                {country.highlights.map((highlight, idx) => (
                                    <div key={idx} className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-300 text-sm">{highlight}</span>
                                    </div>
                                ))}
                            </div>

                            <button className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all">
                                View Universities in {country.name}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CountryDestinations;
