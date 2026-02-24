import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Award, CheckCircle, Lock, Users, Star, TrendingUp, Verified } from 'lucide-react';

const TrustSection = () => {
    const certifications = [
        {
            icon: Shield,
            title: 'ISO 9001:2015',
            subtitle: 'Certified',
            color: 'from-red-500 to-red-600'
        },
        {
            icon: Award,
            title: 'NAAC A+',
            subtitle: 'Accredited',
            color: 'from-red-400 to-red-500'
        },
        {
            icon: Lock,
            title: 'SSL Secured',
            subtitle: '256-bit Encryption',
            color: 'from-gray-700 to-gray-800'
        },
        {
            icon: Verified,
            title: 'MCI Approved',
            subtitle: 'Verified Partner',
            color: 'from-gray-800 to-gray-900'
        }
    ];

    const trustStats = [
        { icon: Users, value: '10,000+', label: 'Happy Students', color: 'text-red-600' },
        { icon: Star, value: '4.9/5', label: 'Average Rating', color: 'text-red-500' },
        { icon: TrendingUp, value: '95%', label: 'Success Rate', color: 'text-gray-700' },
        { icon: CheckCircle, value: '500+', label: 'College Partners', color: 'text-gray-800' }
    ];

    const mediaLogos = [
        { name: 'Times of India', width: 'w-24' },
        { name: 'Hindustan Times', width: 'w-28' },
        { name: 'The Hindu', width: 'w-20' },
        { name: 'NDTV', width: 'w-20' },
        { name: 'Education Times', width: 'w-28' }
    ];

    return (
        <section className="section-padding bg-white border-y border-slate-200">
            <div className="container-custom">
                {/* Certifications */}
                <div className="mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-10"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full mb-4">
                            <Shield className="w-4 h-4" />
                            <span className="text-sm font-semibold">Trusted & Certified</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                            Our Certifications & Accreditations
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        {certifications.map((cert, index) => {
                            const Icon = cert.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white border-2 border-slate-200 rounded-xl p-6 text-center hover:border-primary-300 hover:shadow-lg transition-all"
                                >
                                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${cert.color} flex items-center justify-center`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-1">{cert.title}</h3>
                                    <p className="text-sm text-slate-600">{cert.subtitle}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Trust Stats */}
                <div className="mb-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                        {trustStats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="text-center"
                                >
                                    <Icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                                    <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-slate-600">{stat.label}</div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Featured In / As Seen On */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">
                        As Featured In
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60 hover:opacity-80 transition-opacity">
                        {mediaLogos.map((logo, index) => (
                            <div
                                key={index}
                                className={`${logo.width} h-8 bg-slate-300 rounded flex items-center justify-center text-xs font-bold text-slate-600`}
                            >
                                {logo.name}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default TrustSection;
