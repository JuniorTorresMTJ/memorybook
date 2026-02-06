import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { Sparkles, BookMarked, BookOpen } from 'lucide-react';
import type { PageCount } from './types';

interface PageCountSelectorProps {
    value: PageCount;
    onChange: (value: PageCount) => void;
}

interface PageOption {
    count: PageCount;
    label: string;
    description: string;
    icon: React.ReactNode;
}

export const PageCountSelector = ({ value, onChange }: PageCountSelectorProps) => {
    const { t } = useLanguage();
    const wz = t.wizard;

    const options: PageOption[] = [
        {
            count: 10,
            label: wz?.pages10 || '10 Pages',
            description: wz?.pages10Desc || 'A brief, heartfelt collection',
            icon: <BookOpen className="w-6 h-6" />,
        },
        {
            count: 15,
            label: wz?.pages15 || '15 Pages',
            description: wz?.pages15Desc || 'A balanced story of memories',
            icon: <Sparkles className="w-6 h-6" />,
        },
        {
            count: 20,
            label: wz?.pages20 || '20 Pages',
            description: wz?.pages20Desc || 'A rich journey through life',
            icon: <BookMarked className="w-6 h-6" />,
        },
    ];

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-text-main">
                {wz?.howManyPages || 'How many pages?'}
            </label>
            <p className="text-sm text-text-muted">
                {wz?.morePages || 'More pages means more moments and chapters.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                {options.map((option) => {
                    const isSelected = value === option.count;

                    return (
                        <motion.button
                            key={option.count}
                            onClick={() => onChange(option.count)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`relative p-4 rounded-2xl border-2 transition-all text-left ${
                                isSelected
                                    ? 'border-primary-teal bg-primary-teal/5 dark:bg-primary-teal/10'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                        >
                            {/* Selected Indicator */}
                            {isSelected && (
                                <motion.div
                                    layoutId="pageCountIndicator"
                                    className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-teal flex items-center justify-center"
                                >
                                    <svg
                                        className="w-3 h-3 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </motion.div>
                            )}

                            {/* Icon */}
                            <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                                    isSelected
                                        ? 'bg-primary-teal/20 text-primary-teal'
                                        : 'bg-gray-100 dark:bg-gray-800 text-text-muted'
                                }`}
                            >
                                {option.icon}
                            </div>

                            {/* Content */}
                            <h3
                                className={`font-semibold text-lg ${
                                    isSelected ? 'text-primary-teal' : 'text-text-main'
                                }`}
                            >
                                {option.label}
                            </h3>
                            <p className="text-sm text-text-muted mt-1">
                                {option.description}
                            </p>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};
