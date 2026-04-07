import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    loading = false,
    disabled = false,
    icon: Icon,
    iconPosition = 'left',
    onClick,
    href,
    ...props
}) => {
    const baseClasses = 'btn';

    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        outline: 'btn-outline',
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

    const content = (
        <>
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {!loading && Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
            <span>{children}</span>
            {!loading && Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
        </>
    );

    const MotionButton = motion.button;
    const MotionLink = motion.a;

    if (href) {
        return (
            <MotionLink
                href={href}
                className={buttonClasses}
                whileHover={{ scale: disabled ? 1 : 1.02 }}
                whileTap={{ scale: disabled ? 1 : 0.98 }}
                {...props}
            >
                {content}
            </MotionLink>
        );
    }

    return (
        <MotionButton
            className={buttonClasses}
            disabled={disabled || loading}
            onClick={onClick}
            whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
            {...props}
        >
            {content}
        </MotionButton>
    );
};

export default Button;
