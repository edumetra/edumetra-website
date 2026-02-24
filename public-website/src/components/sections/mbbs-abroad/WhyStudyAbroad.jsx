import React from 'react';
import { motion } from 'framer-motion';

const WhyStudyAbroad = ({ reasons }) => {
    return (
        <section className="section bg-slate-900/30">
            <div className="container-custom">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Why Study <span className="gradient-text">MBBS Abroad</span>?
                    </h2>
                    <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                        Discover the advantages of pursuing your medical degree internationally
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reasons.map((reason, index) => {
                        const Icon = reason.icon;
                        return (
                            <motion.div
                                key={index}
                                className="card hover:shadow-xl transition-all"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
                                    <Icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{reason.title}</h3>
                                <p className="text-slate-300">{reason.description}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default WhyStudyAbroad;
