import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors relative overflow-hidden"
            aria-label="Toggle Theme"
        >
            <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 180 : 0, scale: theme === 'dark' ? 0.8 : 1 }}
            >
                {theme === 'light' ? (
                    <Sun className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                ) : (
                    <Moon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                )}
            </motion.div>
        </button>
    );
};
