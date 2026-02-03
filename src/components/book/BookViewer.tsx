import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, 
    ChevronRight, 
    X, 
    Edit3, 
    Download, 
    Trash2,
    ZoomIn,
    ZoomOut,
    Maximize2,
    Heart
} from 'lucide-react';

export interface BookPage {
    id: string;
    imageUrl: string;
    title?: string;
    description?: string;
    date?: string;
}

interface BookViewerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    pages: BookPage[];
    onEdit?: () => void;
    onPrint?: () => void;
    onDelete?: () => void;
    onPageEdit?: (pageIndex: number) => void;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
}

export const BookViewer = ({
    isOpen,
    onClose,
    title,
    pages,
    onEdit,
    onPrint,
    onDelete,
    onPageEdit,
    isFavorite = false,
    onToggleFavorite,
}: BookViewerProps) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoom, setZoom] = useState(1);

    const totalPages = pages.length;

    const goToNextPage = useCallback(() => {
        if (currentPage < totalPages - 1) {
            setDirection(1);
            setCurrentPage((prev) => prev + 1);
        }
    }, [currentPage, totalPages]);

    const goToPrevPage = useCallback(() => {
        if (currentPage > 0) {
            setDirection(-1);
            setCurrentPage((prev) => prev - 1);
        }
    }, [currentPage]);

    const goToPage = useCallback((index: number) => {
        setDirection(index > currentPage ? 1 : -1);
        setCurrentPage(index);
    }, [currentPage]);

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
    const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

    // Page flip animation variants
    const pageVariants = {
        enter: (direction: number) => ({
            rotateY: direction > 0 ? -90 : 90,
            opacity: 0,
            scale: 0.9,
        }),
        center: {
            rotateY: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (direction: number) => ({
            rotateY: direction > 0 ? 90 : -90,
            opacity: 0,
            scale: 0.9,
        }),
    };

    const pageTransition = {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.5,
    };

    if (!isOpen) return null;

    const currentPageData = pages[currentPage];

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />

            {/* Book Viewer Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`fixed z-50 bg-card-bg rounded-3xl shadow-2xl overflow-hidden flex flex-col ${
                    isFullscreen
                        ? 'inset-0 rounded-none'
                        : 'inset-4 lg:inset-8'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-black/5 dark:border-white/10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-text-main">{title}</h2>
                        <span className="px-3 py-1 bg-primary-teal/10 text-primary-teal rounded-full text-sm font-medium">
                            Page {currentPage + 1} of {totalPages}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Favorite Button */}
                        {onToggleFavorite && (
                            <button
                                onClick={onToggleFavorite}
                                className={`p-2.5 rounded-xl transition-all ${
                                    isFavorite
                                        ? 'bg-red-100 dark:bg-red-500/20 text-red-500'
                                        : 'hover:bg-black/5 dark:hover:bg-white/10 text-text-muted'
                                }`}
                            >
                                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                            </button>
                        )}

                        {/* Edit Button */}
                        {onEdit && (
                            <button
                                onClick={onEdit}
                                className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-text-muted hover:text-primary-teal transition-all"
                                title="Edit Book"
                            >
                                <Edit3 className="w-5 h-5" />
                            </button>
                        )}

                        {/* Print/Download Button */}
                        {onPrint && (
                            <button
                                onClick={onPrint}
                                className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-text-muted hover:text-primary-teal transition-all"
                                title="Download PDF"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                        )}

                        {/* Delete Button */}
                        {onDelete && (
                            <button
                                onClick={onDelete}
                                className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-all"
                                title="Delete Book"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}

                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />

                        {/* Zoom Controls */}
                        <button
                            onClick={handleZoomOut}
                            disabled={zoom <= 0.5}
                            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-text-muted disabled:opacity-50 transition-all"
                        >
                            <ZoomOut className="w-5 h-5" />
                        </button>
                        <span className="text-sm text-text-muted min-w-[3rem] text-center">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            disabled={zoom >= 2}
                            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-text-muted disabled:opacity-50 transition-all"
                        >
                            <ZoomIn className="w-5 h-5" />
                        </button>

                        {/* Fullscreen */}
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-text-muted transition-all"
                        >
                            <Maximize2 className="w-5 h-5" />
                        </button>

                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-text-muted transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Book Content */}
                <div className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                    <div 
                        className="relative flex items-center justify-center"
                        style={{ perspective: '2000px' }}
                    >
                        {/* Previous Page Button */}
                        <button
                            onClick={goToPrevPage}
                            disabled={currentPage === 0}
                            className="absolute left-0 z-20 p-3 md:p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all transform -translate-x-1/2 md:-translate-x-full"
                        >
                            <ChevronLeft className="w-6 h-6 text-text-main" />
                        </button>

                        {/* Book Page */}
                        <div 
                            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
                            style={{
                                width: `min(80vw, ${600 * zoom}px)`,
                                height: `min(70vh, ${800 * zoom}px)`,
                                transformStyle: 'preserve-3d',
                            }}
                        >
                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.div
                                    key={currentPage}
                                    custom={direction}
                                    variants={pageVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={pageTransition}
                                    className="absolute inset-0"
                                    style={{
                                        transformStyle: 'preserve-3d',
                                        backfaceVisibility: 'hidden',
                                    }}
                                >
                                    {/* Page Content */}
                                    <div className="w-full h-full flex flex-col">
                                        {/* Image */}
                                        <div className="flex-1 relative overflow-hidden">
                                            <img
                                                src={currentPageData.imageUrl}
                                                alt={currentPageData.title || `Page ${currentPage + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            
                                            {/* Edit Page Button */}
                                            {onPageEdit && (
                                                <button
                                                    onClick={() => onPageEdit(currentPage)}
                                                    className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
                                                    style={{ opacity: 1 }}
                                                >
                                                    <Edit3 className="w-4 h-4 text-primary-teal" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Page Info */}
                                        {(currentPageData.title || currentPageData.description) && (
                                            <div className="p-4 md:p-6 bg-white dark:bg-gray-800 border-t border-black/5 dark:border-white/10">
                                                {currentPageData.title && (
                                                    <h3 className="text-lg font-semibold text-text-main mb-1">
                                                        {currentPageData.title}
                                                    </h3>
                                                )}
                                                {currentPageData.date && (
                                                    <p className="text-sm text-primary-teal mb-2">
                                                        {currentPageData.date}
                                                    </p>
                                                )}
                                                {currentPageData.description && (
                                                    <p className="text-sm text-text-muted line-clamp-2">
                                                        {currentPageData.description}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Page Number */}
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-xs rounded-full">
                                        {currentPage + 1}
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Book Spine Shadow */}
                            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
                        </div>

                        {/* Next Page Button */}
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages - 1}
                            className="absolute right-0 z-20 p-3 md:p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all transform translate-x-1/2 md:translate-x-full"
                        >
                            <ChevronRight className="w-6 h-6 text-text-main" />
                        </button>
                    </div>
                </div>

                {/* Page Thumbnails */}
                <div className="p-4 border-t border-black/5 dark:border-white/10 bg-bg-soft dark:bg-gray-800/50">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 px-4 -mx-4">
                        {pages.map((page, index) => (
                            <button
                                key={page.id}
                                onClick={() => goToPage(index)}
                                className={`flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                    index === currentPage
                                        ? 'border-primary-teal ring-2 ring-primary-teal/30'
                                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                <img
                                    src={page.imageUrl}
                                    alt={`Page ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>
        </>
    );
};
