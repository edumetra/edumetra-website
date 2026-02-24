import React from 'react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => {
    return (
        <motion.div
            className="card group cursor-default"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
        >
            <div className="feature-icon group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <h3 className="text-xl md:text-2xl font-semibold mb-3 text-white">
                {title}
            </h3>
            <p className="text-slate-300 leading-relaxed">
                {description}
            </p>
        </motion.div>
    );
};

export default FeatureCard;
