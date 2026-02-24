import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQSection = ({ faqs, title = 'Frequently Asked Questions', subtitle }) => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="relative section bg-slate-900/20 overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />

            <div className="container-custom relative z-10">
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full mb-6">
                        <HelpCircle className="w-5 h-5 text-red-400" />
                        <span className="text-red-300 text-sm font-semibold">Got Questions?</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                            {subtitle}
                        </p>
                    )}
                </motion.div>

                <div className="max-w-3xl mx-auto space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            className="group"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <div
                                className={`relative card cursor-pointer overflow-hidden transition-all duration-300 ${openIndex === index
                                        ? 'ring-2 ring-red-500/50 shadow-lg shadow-red-500/10'
                                        : 'hover:ring-2 hover:ring-red-500/30'
                                    }`}
                                onClick={() => toggleFAQ(index)}
                            >
                                {/* Gradient border effect on hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative flex items-center justify-between gap-4">
                                    <h3 className="text-lg font-semibold text-white flex-1 pr-4">
                                        {faq.question}
                                    </h3>
                                    <motion.div
                                        animate={{ rotate: openIndex === index ? 180 : 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="flex-shrink-0"
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300 ${openIndex === index
                                                ? 'bg-gradient-to-br from-red-500 to-red-600'
                                                : 'bg-slate-800 group-hover:bg-slate-700'
                                            }`}>
                                            <ChevronDown className={`w-5 h-5 transition-colors duration-300 ${openIndex === index ? 'text-white' : 'text-red-400'
                                                }`} />
                                        </div>
                                    </motion.div>
                                </div>

                                <AnimatePresence>
                                    {openIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pt-4 mt-4 border-t border-slate-700/50">
                                                <p className="text-slate-300 leading-relaxed">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Additional help CTA */}
                <motion.div
                    className="text-center mt-12"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                >
                    <p className="text-slate-400 mb-4">Still have questions?</p>
                    <a
                        href="/contact"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        <HelpCircle className="w-5 h-5" />
                        Contact Our Support Team
                    </a>
                </motion.div>
            </div>
        </section>
    );
};

export default FAQSection;
