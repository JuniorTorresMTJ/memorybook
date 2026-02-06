/**
 * BookShell - Hardcover book frame
 *
 * Renders the physical appearance of a hardcover book:
 * - Thick border simulating leather/fabric cover
 * - Deep external shadow
 * - Central spine (gutter) with inner shadow
 * - Page stack effect (subtle offset lines)
 * - Paper texture via subtle gradients
 */

import { motion } from 'framer-motion';

interface BookShellProps {
    children: React.ReactNode;
    mode: 'closed' | 'open';
    className?: string;
    style?: React.CSSProperties;
}

export const BookShell = ({ children, mode, className = '', style }: BookShellProps) => {
    return (
        <div className={`relative ${className}`} style={style}>
            {/* Page stack effect - visible "pages" behind the cover */}
            <div className="absolute inset-0 translate-y-[3px] translate-x-[3px] rounded-lg bg-stone-200 opacity-60" />
            <div className="absolute inset-0 translate-y-[6px] translate-x-[5px] rounded-lg bg-stone-300 opacity-40" />

            {/* Main book body */}
            <motion.div
                className="relative h-full rounded-lg overflow-hidden"
                style={{
                    boxShadow: '0 25px 60px -12px rgba(0,0,0,0.35), 0 10px 20px -5px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}
                layout
            >
                {/* Hardcover border / frame */}
                <div className="relative h-full bg-gradient-to-br from-stone-700 via-stone-800 to-stone-900 p-[6px] rounded-lg">
                    {/* Subtle leather texture */}
                    <div className="absolute inset-0 opacity-[0.03] rounded-lg"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                        }}
                    />

                    {/* Inner content area */}
                    <div className="relative h-full bg-white rounded-[4px] overflow-hidden">
                        {children}

                        {/* Spine / gutter shadow - only in open mode */}
                        {mode === 'open' && (
                            <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-8 pointer-events-none z-10"
                                style={{
                                    background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.08) 30%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.08) 70%, transparent)',
                                }}
                            />
                        )}
                    </div>

                    {/* Spine edge highlight for closed mode */}
                    {mode === 'closed' && (
                        <div className="absolute left-0 top-0 bottom-0 w-[14px] rounded-l-lg pointer-events-none"
                            style={{
                                background: 'linear-gradient(to right, rgba(0,0,0,0.3), rgba(0,0,0,0.1) 40%, rgba(255,255,255,0.05) 60%, rgba(0,0,0,0.05))',
                            }}
                        />
                    )}
                </div>
            </motion.div>
        </div>
    );
};
