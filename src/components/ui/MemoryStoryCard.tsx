import { Heart, Edit3, Download, Trash2, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface MemoryStoryCardProps {
    id: string;
    title: string;
    date: string;
    description: string;
    imageUrl: string;
    isFavorite?: boolean;
    pageCount?: number;
    onClick?: () => void;
    onEdit?: () => void;
    onPrint?: () => void;
    onDelete?: () => void;
}

export const MemoryStoryCard = ({
    title,
    date,
    description,
    imageUrl,
    isFavorite = false,
    pageCount,
    onClick,
    onEdit,
    onPrint,
    onDelete
}: MemoryStoryCardProps) => {
    const [favorite, setFavorite] = useState(isFavorite);
    const [showActions, setShowActions] = useState(false);

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFavorite(!favorite);
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
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
            className="bg-card-bg rounded-2xl overflow-hidden shadow-soft border border-black/5 dark:border-white/10 cursor-pointer hover:shadow-lg transition-shadow group"
        >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Page Count Badge */}
                {pageCount && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                        <BookOpen className="w-3.5 h-3.5 text-white" />
                        <span className="text-xs font-medium text-white">{pageCount} pages</span>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {/* Edit Button */}
                    {onEdit && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: showActions ? 1 : 0, scale: showActions ? 1 : 0.8 }}
                            onClick={handleEditClick}
                            className="p-2 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm hover:bg-white dark:hover:bg-black/70 transition-colors"
                            title="Edit Book"
                        >
                            <Edit3 className="w-4 h-4 text-text-muted hover:text-primary-teal" />
                        </motion.button>
                    )}

                    {/* Download/Print Button */}
                    {onPrint && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: showActions ? 1 : 0, scale: showActions ? 1 : 0.8 }}
                            transition={{ delay: 0.05 }}
                            onClick={handlePrintClick}
                            className="p-2 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm hover:bg-white dark:hover:bg-black/70 transition-colors"
                            title="Download PDF"
                        >
                            <Download className="w-4 h-4 text-text-muted hover:text-primary-teal" />
                        </motion.button>
                    )}

                    {/* Delete Button */}
                    {onDelete && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: showActions ? 1 : 0, scale: showActions ? 1 : 0.8 }}
                            transition={{ delay: 0.1 }}
                            onClick={handleDeleteClick}
                            className="p-2 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors"
                            title="Delete Book"
                        >
                            <Trash2 className="w-4 h-4 text-text-muted hover:text-red-500" />
                        </motion.button>
                    )}

                    {/* Favorite Button - Last */}
                    <button
                        onClick={handleFavoriteClick}
                        className="p-2 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm hover:bg-white dark:hover:bg-black/70 transition-colors"
                    >
                        <Heart
                            className={`w-4 h-4 transition-colors ${
                                favorite
                                    ? 'fill-accent-coral text-accent-coral'
                                    : 'text-text-muted hover:text-accent-coral'
                            }`}
                        />
                    </button>
                </div>

                {/* View Book Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                    <span className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 text-text-main rounded-full text-sm font-medium">
                        <BookOpen className="w-4 h-4" />
                        View Book
                    </span>
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
