import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import type { IllustrationStyle } from './types';

// Import style images
import animeImg from '../../assets/anime.png';
import cartoonImg from '../../assets/cartoon.png';
import coloringImg from '../../assets/coloring_book.png';
import heroWomanImg from '../../assets/hero-woman.png';

interface StyleSelectorProps {
    value: IllustrationStyle;
    onChange: (value: IllustrationStyle) => void;
}

interface StyleOption {
    id: IllustrationStyle;
    label: string;
    description: string;
    image?: string;
    gradient?: string;
}

export const StyleSelector = ({ value, onChange }: StyleSelectorProps) => {
    const { t } = useLanguage();
    const wz = t.wizard;

    const styles: StyleOption[] = [
        {
            id: 'coloring',
            label: wz?.styleColoring || 'Coloring Page',
            description: wz?.styleColoringDesc || 'Simple black & white outlines, perfect for coloring together',
            image: coloringImg,
        },
        {
            id: 'cartoon',
            label: wz?.styleCartoon || 'Cartoon',
            description: wz?.styleCartoonDesc || 'Bright, cheerful illustrations with bold colors',
            image: cartoonImg,
        },
        {
            id: 'anime',
            label: wz?.styleAnime || 'Anime',
            description: wz?.styleAnimeDesc || 'Soft, expressive style with gentle features',
            image: animeImg,
        },
        {
            id: 'watercolor',
            label: wz?.styleWatercolor || 'Watercolor',
            description: wz?.styleWatercolorDesc || 'Delicate, dreamy paintings with soft edges',
            image: heroWomanImg,
        },
    ];

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-text-main">
                {wz?.illustrationStyle || 'Illustration Style'}
            </label>
            <p className="text-sm text-text-muted">
                {wz?.illustrationStyleDesc || 'Choose how the memories will be illustrated.'}
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
                                className={`w-full aspect-video rounded-xl mb-3 overflow-hidden ${
                                    style.gradient ? `bg-gradient-to-br ${style.gradient} flex items-center justify-center` : ''
                                }`}
                            >
                                {style.image ? (
                                    <img
                                        src={style.image}
                                        alt={style.label}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white">
                                        <span className="text-2xl">🎨</span>
                                    </div>
                                )}
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
