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
        primary: "text-white focus:ring-primary-teal shadow-lg hover:shadow-xl",
        secondary: "bg-transparent text-primary-teal border-2 border-primary-teal hover:bg-primary-teal/10 focus:ring-primary-teal",
    };

    const animatedGradientStyle = variant === 'primary' ? {
        backgroundImage: 'linear-gradient(90deg, #00E5E5, #FF9E91, #00d4d4, #ff8f80, #00E5E5)',
        backgroundSize: '300% 100%',
        animation: 'btnGradientShift 5s ease infinite',
    } : undefined;

    return (
        <>
            {variant === 'primary' && (
                <style>{`
                    @keyframes btnGradientShift {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                `}</style>
            )}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`${baseStyles} ${variants[variant]} ${variant === 'primary' ? 'px-7 py-3.5' : 'px-[26px] py-[10px]'} ${className}`}
                style={animatedGradientStyle}
                onClick={onClick}
                disabled={disabled}
                type={type}
            >
                {children}
            </motion.button>
        </>
    );
};
