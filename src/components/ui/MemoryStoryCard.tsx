import { Heart, Edit3, Download, Trash2, BookOpen } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MemoryStoryCardProps {
    id: string;
    title: string;
    date: string;
    description: string;
    imageUrl: string;
    pageImages?: string[]; // Array of all page images for slideshow
    isFavorite?: boolean;
    pageCount?: number;
    onClick?: () => void;
    onEdit?: () => void;
    onPrint?: () => void;
    onDelete?: () => void;
    onToggleFavorite?: () => void;
}

export const MemoryStoryCard = ({
    title,
    date,
    description,
    imageUrl,
    pageImages = [],
    isFavorite = false,
    pageCount,
    onClick,
    onEdit,
    onPrint,
    onDelete,
    onToggleFavorite
}: MemoryStoryCardProps) => {
    const [showActions, setShowActions] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Get all images - use pageImages if available, otherwise just the cover
    const allImages = pageImages.length > 0 ? pageImages : [imageUrl];
    
    // Slideshow effect on hover
    const startSlideshow = useCallback(() => {
        if (allImages.length <= 1) return;
        
        intervalRef.current = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % allImages.length);
        }, 1200); // Change image every 1.2 seconds
    }, [allImages.length]);

    const stopSlideshow = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setCurrentImageIndex(0); // Reset to cover image
    }, []);

    useEffect(() => {
        if (isHovering) {
            startSlideshow();
        } else {
            stopSlideshow();
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isHovering, startSlideshow, stopSlideshow]);

    const handleMouseEnter = () => {
        setShowActions(true);
        setIsHovering(true);
    };

    const handleMouseLeave = () => {
        setShowActions(false);
        setIsHovering(false);
    };

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleFavorite?.();
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit?.();
    };

    const handlePrintClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onPrint?.();
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete?.();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="bg-white rounded-2xl overflow-hidden shadow-soft border border-black/5 cursor-pointer hover:shadow-lg transition-shadow group"
        >
            {/* Image with Slideshow */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary-teal/20 to-accent-coral/20">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentImageIndex}
                        src={allImages[currentImageIndex] || imageUrl}
                        alt={`${title} - ${currentImageIndex === 0 ? 'Capa' : `Página ${currentImageIndex}`}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                            // Fallback to gradient if image fails to load
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                </AnimatePresence>
                
                {/* Image Progress Dots (only show if multiple images and hovering) */}
                {allImages.length > 1 && isHovering && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
                        {allImages.map((_, index) => (
                            <div
                                key={index}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                    index === currentImageIndex 
                                        ? 'bg-white w-3' 
                                        : 'bg-white/50'
                                }`}
                            />
                        ))}
                    </div>
                )}
                
                {/* Page Count Badge */}
                {pageCount && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                        <BookOpen className="w-3.5 h-3.5 text-white" />
                        <span className="text-xs font-medium text-white">{pageCount} pages</span>
                    </div>
                )}

                {/* View Book Overlay - Below action buttons */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 pointer-events-none z-10">
                    <span className="flex items-center gap-2 px-4 py-2 bg-white/90 text-text-main rounded-full text-sm font-medium shadow-lg">
                        <BookOpen className="w-4 h-4 text-primary-teal" />
                        View Book
                    </span>
                </div>

                {/* Action Buttons - Above overlay */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                    {/* Edit Button */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: showActions ? 1 : 0, scale: showActions ? 1 : 0.8 }}
                        onClick={handleEditClick}
                        className="p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
                        title="Edit Book"
                    >
                        <Edit3 className="w-4 h-4 text-text-muted hover:text-primary-teal" />
                    </motion.button>

                    {/* Download/Print Button */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: showActions ? 1 : 0, scale: showActions ? 1 : 0.8 }}
                        transition={{ delay: 0.05 }}
                        onClick={handlePrintClick}
                        className="p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
                        title="Download PDF"
                    >
                        <Download className="w-4 h-4 text-text-muted hover:text-primary-teal" />
                    </motion.button>

                    {/* Delete Button */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: showActions ? 1 : 0, scale: showActions ? 1 : 0.8 }}
                        transition={{ delay: 0.1 }}
                        onClick={handleDeleteClick}
                        className="p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-red-50 transition-colors shadow-sm"
                        title="Delete Book"
                    >
                        <Trash2 className="w-4 h-4 text-text-muted hover:text-red-500" />
                    </motion.button>

                    {/* Favorite Button - Always visible */}
                    <button
                        onClick={handleFavoriteClick}
                        className={`p-2 rounded-full backdrop-blur-sm transition-colors shadow-sm ${
                            isFavorite 
                                ? 'bg-red-50 hover:bg-red-100' 
                                : 'bg-white/90 hover:bg-white'
                        }`}
                    >
                        <Heart
                            className={`w-4 h-4 transition-colors ${
                                isFavorite
                                    ? 'fill-accent-coral text-accent-coral'
                                    : 'text-text-muted hover:text-accent-coral'
                            }`}
                        />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-bold text-text-main line-clamp-1">
                        {title}
                    </h3>
                </div>
                
                <p className="text-sm text-primary-teal font-medium mb-3">
                    {date}
                </p>
                
                <p className="text-text-muted text-sm leading-relaxed line-clamp-3">
                    {description}
                </p>
            </div>
        </motion.div>
    );
};
