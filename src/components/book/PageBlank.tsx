/**
 * PageBlank - Empty paper page to fill incomplete spreads
 *
 * Renders a blank paper-like page with:
 * - Warm paper gradient background
 * - Subtle horizontal line texture
 * - Inner shadow for depth
 */

interface PageBlankProps {
    side: 'left' | 'right';
}

export const PageBlank = ({ side }: PageBlankProps) => {
    // Gradient toward the gutter
    const gutterGradient = side === 'left'
        ? 'bg-gradient-to-r from-transparent to-black/[0.03]'
        : 'bg-gradient-to-l from-transparent to-black/[0.03]';

    return (
        <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-amber-50/60 via-stone-50 to-stone-100/60">
            {/* Paper texture - subtle horizontal lines */}
            <div className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 28px, #8B7355 28px, #8B7355 29px)',
                }}
            />

            {/* Gutter gradient */}
            <div className={`absolute inset-0 ${gutterGradient}`} />

            {/* Inner shadow */}
            <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5"
                style={{
                    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.04)',
                }}
            />
        </div>
    );
};
