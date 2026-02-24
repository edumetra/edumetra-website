import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const TestimonialCard = ({
    name,
    role,
    avatar,
    quote,
    rating = 5,
    delay = 0
}) => {
    return (
        <motion.div
            className="card"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
        >
            {/* Rating Stars */}
            <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`w-5 h-5 ${i < rating
                            ? 'fill-red-400 text-red-400'
                            : 'text-slate-600'
                            }`}
                    />
                ))}
            </div>

            {/* Quote */}
            <p className="text-slate-200 italic mb-6 leading-relaxed">
                "{quote}"
            </p>

            {/* Author Info */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
                    {avatar || name.charAt(0)}
                </div>
                <div>
                    <h4 className="text-white font-semibold">{name}</h4>
                    <p className="text-slate-400 text-sm">{role}</p>
                </div>
            </div>
        </motion.div>
    );
};

export default TestimonialCard;
