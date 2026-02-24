import React from 'react';
import { motion } from 'framer-motion';

const WebinarCTA = () => {
    return (
        <section className="section">
            <div className="container-custom">
                <motion.div
                    className="card max-w-4xl mx-auto text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to <span className="gradient-text">Transform</span> Your Journey?
                    </h2>
                    <p className="text-slate-300 text-lg mb-8">
                        Join our next webinar and get expert guidance for your medical education journey
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl">
                            View All Events
                        </button>
                        <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border-2 border-slate-700">
                            Contact Us
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default WebinarCTA;
