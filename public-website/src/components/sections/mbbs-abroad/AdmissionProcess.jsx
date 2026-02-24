import React from 'react';
import { motion } from 'framer-motion';

const AdmissionProcess = ({ steps }) => {
    return (
        <section className="section bg-slate-900/30">
            <div className="container-custom">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Simple <span className="gradient-text">Admission Process</span>
                    </h2>
                    <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                        From university selection to flying abroad - we handle everything
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    {steps.map((process, index) => (
                        <motion.div
                            key={index}
                            className="relative"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            {index < steps.length - 1 && (
                                <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-gradient-to-b from-red-500 to-transparent" />
                            )}

                            <div className="flex gap-6 mb-8">
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                        {process.step}
                                    </div>
                                </div>
                                <div className="flex-1 card">
                                    <h3 className="text-xl font-bold text-white mb-2">{process.title}</h3>
                                    <p className="text-slate-300">{process.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AdmissionProcess;
