import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const StatsCounter = ({ end, duration = 2, suffix = '', prefix = '', label }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;

        let startTime;
        let animationFrame;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = (currentTime - startTime) / (duration * 1000);

            if (progress < 1) {
                setCount(Math.floor(end * progress));
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [end, duration, isInView]);

    return (
        <motion.div
            ref={ref}
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                {prefix}{count.toLocaleString()}{suffix}
            </div>
            <div className="text-slate-300 text-sm md:text-base">
                {label}
            </div>
        </motion.div>
    );
};

export default StatsCounter;
