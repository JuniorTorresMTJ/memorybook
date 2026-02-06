import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { languages } from '../../constants/translations';
import type { LanguageCode } from '../../constants/translations';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LanguageSelectorProps {
    /** 
     * "dropdown" = default absolute dropdown (for desktop navbars).
     * "inline"   = renders options inline (for mobile menus where overflow is hidden).
     */
    variant?: 'dropdown' | 'inline';
}

export const LanguageSelector = ({ variant = 'dropdown' }: LanguageSelectorProps) => {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLanguage = languages.find(l => l.code === language) || languages[0];

    useEffect(() => {
        if (variant === 'inline') return;
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [variant]);

    const handleSelect = (code: LanguageCode) => {
        setLanguage(code);
        setIsOpen(false);
    };

    // Inline variant: show all language options as a horizontal row
    if (variant === 'inline') {
        return (
            <div className="flex flex-wrap items-center gap-2">
                {languages.map((lang) => {
                    const isActive = language === lang.code;
                    return (
                        <button
                            key={lang.code}
                            onClick={() => handleSelect(lang.code)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                                isActive
                                    ? 'bg-primary-teal/10 ring-1 ring-primary-teal/30'
                                    : 'hover:bg-black/5 dark:hover:bg-white/10'
                            }`}
                        >
                            <span className="flex items-center justify-center w-6 h-6"><lang.flag /></span>
                            <span className={`text-sm font-medium ${isActive ? 'text-primary-teal' : 'text-text-main'}`}>
                                {lang.name}
                            </span>
                            {isActive && <Check className="w-4 h-4 text-primary-teal" />}
                        </button>
                    );
                })}
            </div>
        );
    }

    // Dropdown variant (default)
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
                <span className="flex items-center justify-center w-6 h-6"><currentLanguage.flag /></span>
                <span className="text-sm font-medium text-text-main hidden sm:block">{currentLanguage.name}</span>
                <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-2 w-48 bg-card-bg rounded-xl shadow-xl border border-black/10 dark:border-white/10 py-2 z-50 overflow-hidden"
                    >
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleSelect(lang.code)}
                                className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/10 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center justify-center w-6 h-6"><lang.flag /></span>
                                    <span className={`text-sm font-medium ${language === lang.code ? 'text-primary-teal' : 'text-text-main'}`}>
                                        {lang.name}
                                    </span>
                                </div>
                                {language === lang.code && (
                                    <Check className="w-4 h-4 text-primary-teal" />
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
