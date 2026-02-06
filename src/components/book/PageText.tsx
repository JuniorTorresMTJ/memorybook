/**
 * PageText - Text side of a book spread
 *
 * Renders text content with a background derived from the paired image:
 * - Layer 1: Blurred + scaled image as background
 * - Layer 2: White/translucent overlay for legibility
 * - Layer 3: Directional gradient toward the gutter for depth
 * - Layer 4: Actual text content (life phase tag, title, body, page number)
 *
 * Uses Playfair Display for titles and Lora for body text.
 */

import { Baby, GraduationCap, Briefcase, Heart, Star } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface PageTextProps {
    title?: string;
    text?: string;
    pairImageUrl: string;
    side: 'left' | 'right';
    lifePhase?: string;
    pageNumber?: number;
}

const FONT_TITLE = "'Playfair Display', serif";
const FONT_BODY = "'Lora', serif";

// Life phase config with i18n labels
const getLifePhaseConfig = (phase: string, bv: Record<string, string>) => {
    const p = phase.toLowerCase();
    if (p.includes('child') || p.includes('infância') || p.includes('young'))
        return { icon: Baby, label: bv?.childhood || 'Infância', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    if (p.includes('teen') || p.includes('adolesc') || p.includes('youth'))
        return { icon: GraduationCap, label: bv?.teenage || 'Adolescência', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (p.includes('adult') || p.includes('adulto'))
        return { icon: Briefcase, label: bv?.adultLife || 'Vida Adulta', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (p.includes('elder') || p.includes('senior') || p.includes('golden') || p.includes('idoso') || p.includes('later'))
        return { icon: Heart, label: bv?.goldenAge || 'Fase Dourada', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' };
    return { icon: Star, label: phase, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
};

export const PageText = ({ title, text, pairImageUrl, side, lifePhase, pageNumber }: PageTextProps) => {
    const { t } = useLanguage();
    const bv = t.bookViewer as Record<string, string>;
    const phaseConfig = lifePhase ? getLifePhaseConfig(lifePhase, bv) : null;
    const PhaseIcon = phaseConfig?.icon;

    // Gradient direction: toward the gutter (spine)
    const gutterGradient = side === 'left'
        ? 'bg-gradient-to-r from-transparent to-black/[0.04]'
        : 'bg-gradient-to-l from-transparent to-black/[0.04]';

    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* Layer 1: Blurred image background */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `url(${pairImageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(24px)',
                    transform: 'scale(1.25)',
                }}
            />

            {/* Layer 2: White overlay for legibility */}
            <div className="absolute inset-0 bg-white/[0.78]" />

            {/* Layer 3: Gutter gradient for depth */}
            <div className={`absolute inset-0 ${gutterGradient}`} />

            {/* Layer 4: Text content — vertically centered */}
            <div className="relative z-10 flex flex-col justify-center h-full p-6 md:p-8 lg:p-10">
                {/* Life phase tag */}
                {phaseConfig && PhaseIcon && (
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${phaseConfig.bg} ${phaseConfig.border} self-start mb-4`}>
                        <PhaseIcon className={`w-3.5 h-3.5 ${phaseConfig.color}`} />
                        <span className={`text-xs font-semibold ${phaseConfig.color}`} style={{ fontFamily: FONT_BODY }}>
                            {phaseConfig.label}
                        </span>
                    </div>
                )}

                {/* Title - Playfair Display, italic for elegance */}
                {title && (
                    <h3
                        className="text-xl md:text-2xl lg:text-3xl font-bold text-stone-800 mb-4 leading-tight italic"
                        style={{ fontFamily: FONT_TITLE }}
                    >
                        {title}
                    </h3>
                )}

                {/* Body text - Lora for warm readability */}
                {text && (
                    <div className="overflow-y-auto">
                        <p
                            className="text-sm md:text-base lg:text-lg text-stone-600 leading-relaxed md:leading-loose whitespace-pre-line"
                            style={{ fontFamily: FONT_BODY }}
                        >
                            {text}
                        </p>
                    </div>
                )}

                {/* Page number — pinned to bottom */}
                {pageNumber !== undefined && (
                    <div className={`absolute bottom-4 ${side === 'left' ? 'left-6 md:left-8 lg:left-10' : 'right-6 md:right-8 lg:right-10'}`}>
                        <span className="text-xs text-stone-400 font-medium" style={{ fontFamily: FONT_BODY }}>
                            {pageNumber}
                        </span>
                    </div>
                )}
            </div>

            {/* Inner shadow for page depth */}
            <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5" />
        </div>
    );
};
