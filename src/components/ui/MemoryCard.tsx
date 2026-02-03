import React from 'react';
import { motion } from 'framer-motion';

interface MemoryCardProps {
    children: React.ReactNode;
    className?: string;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ children, className = '' }) => {
    return (
        <motion.div
            className={`bg-card-bg rounded-xl p-6 shadow-soft border border-black/5 ${className}`}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            {children}
        </motion.div>
    );
};
