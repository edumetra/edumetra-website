import React from 'react';
import { motion } from 'framer-motion';
import { Plane } from 'lucide-react';

const MBBSAbroadHero = ({ stats }) => {
    return (
        <section className="section pt-32 bg-gradient-to-b from-slate-900 to-slate-900/50">
            <div className="container-custom">
                <motion.div
                    className="text-center max-w-4xl mx-auto mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full mb-6">
                        <Plane className="w-5 h-5 text-red-400" />
                        <span className="text-red-300 text-sm font-semibold">Study MBBS Abroad</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                        Achieve Your <span className="gradient-text">Medical Dreams</span>
                        <br />Without Borders
                    </h1>
                    <p className="text-slate-300 text-lg md:text-xl mb-8">
                        Study MBBS abroad at top NMC-approved universities. Get admitted with lower costs, no donations, and international exposure.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl">
                            Book Free Counseling
                        </button>
                        <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border-2 border-slate-700">
                            Download Country Guide
                        </button>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={index}
                                className="card text-center p-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                            >
                                <Icon className="w-8 h-8 text-red-500 mx-auto mb-3" />
                                <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                                <div className="text-sm text-slate-400">{stat.label}</div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default MBBSAbroadHero;
