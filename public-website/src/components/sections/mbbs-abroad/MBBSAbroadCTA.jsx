import React from 'react';

import { motion } from 'framer-motion';
const MBBSAbroadCTA = () => {
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
                        Ready to Start Your <span className="gradient-text">Medical Journey</span>?
                    </h2>
                    <p className="text-slate-300 text-lg mb-8">
                        Get expert guidance on country selection, university admission, and visa processing.
                        Book your free counseling session today!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl">
                            Book Free Counseling
                        </button>
                        <a 
                            href="tel:03345336366"
                            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border-2 border-slate-700 block sm:inline-block"
                        >
                            Call 033-45336366
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default MBBSAbroadCTA;
