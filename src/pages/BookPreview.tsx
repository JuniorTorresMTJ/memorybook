/**
 * BookPreview - Demo page for the Hardcover BookViewer
 *
 * Loads the sample book data and renders the BookViewer
 * in an always-open state for demonstration purposes.
 *
 * Route: /book-preview
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookViewer } from '../components/book/BookViewer';
import { getSampleBookPages, getSampleBookDisplay } from '../data/sampleBook';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const BookPreview = () => {
    const [isOpen, setIsOpen] = useState(true);
    const navigate = useNavigate();
    const { language } = useLanguage();

    const sampleBookPages = getSampleBookPages(language);
    const sampleBookDisplay = getSampleBookDisplay(language);

    const handleClose = () => {
        setIsOpen(false);
        // Navigate back after a short delay to let the exit animation play
        setTimeout(() => navigate(-1), 300);
    };

    return (
        <div className="min-h-screen bg-stone-900">
            {/* Fallback UI when viewer is closed (brief moment before navigation) */}
            {!isOpen && (
                <div className="flex items-center justify-center min-h-screen">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Voltar
                    </button>
                </div>
            )}

            {/* Book Viewer */}
            <BookViewer
                isOpen={isOpen}
                onClose={handleClose}
                title={sampleBookDisplay.title}
                pages={sampleBookPages}
                isFavorite={true}
            />
        </div>
    );
};
