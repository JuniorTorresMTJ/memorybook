import { motion } from 'framer-motion';
import { Palette, Pencil, Sparkles, Droplets } from 'lucide-react';
import type { IllustrationStyle } from './types';

interface StyleSelectorProps {
    value: IllustrationStyle;
    onChange: (value: IllustrationStyle) => void;
}

interface StyleOption {
    id: IllustrationStyle;
    label: string;
    description: string;
    icon: React.ReactNode;
    gradient: string;
}

const styles: StyleOption[] = [
    {
        id: 'coloring',
        label: 'Coloring Page',
        description: 'Simple black & white outlines, perfect for coloring together',
        icon: <Pencil className="w-6 h-6" />,
        gradient: 'from-gray-400 to-gray-600',
    },
    {
        id: 'cartoon',
        label: 'Cartoon',
        description: 'Bright, cheerful illustrations with bold colors',
        icon: <Sparkles className="w-6 h-6" />,
        gradient: 'from-amber-400 to-orange-500',
    },
    {
        id: 'anime',
        label: 'Anime',
        description: 'Soft, expressive style with gentle features',
        icon: <Palette className="w-6 h-6" />,
        gradient: 'from-pink-400 to-purple-500',
    },
    {
        id: 'watercolor',
        label: 'Watercolor',
        description: 'Delicate, dreamy paintings with soft edges',
        icon: <Droplets className="w-6 h-6" />,
        gradient: 'from-teal-400 to-cyan-500',
    },
];

export const StyleSelector = ({ value, onChange }: StyleSelectorProps) => {
    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-text-main">
                Illustration Style
            </label>
            <p className="text-sm text-text-muted">
                Choose how the memories will be illustrated.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
                {styles.map((style) => {
                    const isSelected = value === style.id;

                    return (
                        <motion.button
                            key={style.id}
                            onClick={() => onChange(style.id)}
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
                                    layoutId="styleIndicator"
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

                            {/* Style Preview */}
                            <div
                                className={`w-full aspect-video rounded-xl mb-3 bg-gradient-to-br ${style.gradient} flex items-center justify-center`}
                            >
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white">
                                    {style.icon}
                                </div>
                            </div>

                            {/* Content */}
                            <h3
                                className={`font-semibold ${
                                    isSelected ? 'text-primary-teal' : 'text-text-main'
                                }`}
                            >
                                {style.label}
                            </h3>
                            <p className="text-xs text-text-muted mt-1 line-clamp-2">
                                {style.description}
                            </p>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};
