import React from 'react';
import { motion } from 'framer-motion';

const AnimatedCard = ({
    children,
    className = '',
    variant = 'default',
    delay = 0,
    hover = true,
    ...props
}) => {
    const variants = {
        default: {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            whileHover: hover ? {
                y: -6,
                scale: 1.02,
                transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
            } : {}
        },
        glass: {
            initial: { opacity: 0, scale: 0.95 },
            animate: { opacity: 1, scale: 1 },
            whileHover: hover ? {
                scale: 1.03,
                y: -4,
                transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
            } : {}
        },
        glow: {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            whileHover: hover ? {
                y: -8,
                scale: 1.02,
                boxShadow: '0 0 40px rgba(59, 130, 246, 0.5)',
                transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
            } : {}
        },
        tilt: {
            initial: { opacity: 0, rotateX: 10, y: 20 },
            animate: { opacity: 1, rotateX: 0, y: 0 },
            whileHover: hover ? {
                rotateX: 5,
                y: -6,
                scale: 1.02,
                transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
            } : {}
        }
    };

    const variantStyle = variant === 'glass'
        ? 'glass glass-hover'
        : variant === 'glow'
            ? 'card card-glow'
            : variant === 'premium'
                ? 'card card-premium'
                : 'card';

    return (
        <motion.div
            className={`${variantStyle} ${className}`}
            initial={variants[variant === 'premium' ? 'glow' : variant]?.initial}
            animate={variants[variant === 'premium' ? 'glow' : variant]?.animate}
            whileHover={variants[variant === 'premium' ? 'glow' : variant]?.whileHover}
            transition={{
                duration: 0.5,
                delay,
                ease: [0.4, 0, 0.2, 1]
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default AnimatedCard;
