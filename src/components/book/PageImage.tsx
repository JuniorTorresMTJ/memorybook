/**
 * PageImage - Image side of a book spread
 *
 * Renders a full-bleed image with:
 * - object-cover to fill the space
 * - Subtle inner ring / frame
 * - Inner shadow for page depth
 * - Fallback for broken images
 */

import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface PageImageProps {
    imageUrl: string;
    alt?: string;
    className?: string;
}

export const PageImage = ({ imageUrl, alt = 'Page illustration', className = '' }: PageImageProps) => {
    const { t } = useLanguage();
    const bv = t.bookViewer as Record<string, string>;
    const [hasError, setHasError] = useState(false);

    if (hasError || !imageUrl) {
        return (
            <div className={`relative w-full h-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center ${className}`}>
                <div className="text-center p-6">
                    <div className="w-16 h-16 bg-stone-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                    </div>
                    <p className="text-sm text-stone-500">{bv?.imageUnavailable || 'Imagem não disponível'}</p>
                </div>
                {/* Inner shadow */}
                <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5" />
            </div>
        );
    }

    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`} role="img" aria-label={alt}>
            <img
                src={imageUrl}
                alt={alt}
                className="w-full h-full object-cover"
                onError={() => setHasError(true)}
            />
            {/* Inner shadow for page depth */}
            <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5" />
            <div className="absolute inset-0 pointer-events-none"
                style={{
                    boxShadow: 'inset 0 0 30px rgba(0,0,0,0.06)',
                }}
            />
        </div>
    );
};
