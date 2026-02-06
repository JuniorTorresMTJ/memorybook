/**
 * SpreadView - Two-page spread layout
 *
 * Renders two pages side-by-side within the BookShell:
 * - CSS grid with 2 equal columns
 * - Central gutter with inner shadow for the spine illusion
 * - Accepts arbitrary ReactNode for each side
 */

interface SpreadViewProps {
    leftContent: React.ReactNode;
    rightContent: React.ReactNode;
    className?: string;
}

export const SpreadView = ({ leftContent, rightContent, className = '' }: SpreadViewProps) => {
    return (
        <div className={`grid grid-cols-2 w-full h-full ${className}`}>
            {/* Left page */}
            <div className="relative overflow-hidden">
                {leftContent}
            </div>

            {/* Right page */}
            <div className="relative overflow-hidden">
                {rightContent}
            </div>
        </div>
    );
};
