import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
    variant?: 'primary' | 'secondary';
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    children,
    className = '',
    onClick,
    disabled,
    type = 'button'
}) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

    const variants = {
        primary: "bg-gradient-to-r from-[#00E5E5] to-[#FF9E91] text-white hover:from-[#00d4d4] hover:to-[#ff8f80] focus:ring-primary-teal shadow-lg hover:shadow-xl",
        secondary: "bg-transparent text-primary-teal border-2 border-primary-teal hover:bg-primary-teal/10 focus:ring-primary-teal",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${baseStyles} ${variants[variant]} ${variant === 'primary' ? 'px-7 py-3.5' : 'px-[26px] py-[10px]'} ${className}`}
            onClick={onClick}
            disabled={disabled}
            type={type}
        >
            {children}
        </motion.button>
    );
};
