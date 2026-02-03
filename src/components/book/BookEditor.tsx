import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    Upload, 
    Trash2, 
    GripVertical,
    Plus,
    Save,
    ArrowLeft,
    Image as ImageIcon
} from 'lucide-react';
import type { BookPage } from './BookViewer';

interface BookEditorProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    pages: BookPage[];
    onSave: (pages: BookPage[]) => void;
}

export const BookEditor = ({
    isOpen,
    onClose,
    title,
    pages: initialPages,
    onSave,
}: BookEditorProps) => {
    const [pages, setPages] = useState<BookPage[]>(initialPages);
    const [selectedPage, setSelectedPage] = useState<number | null>(null);
    const [replacePageIndex, setReplacePageIndex] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const replaceInputRef = useRef<HTMLInputElement>(null);

    const generateId = () => Math.random().toString(36).substring(2, 11);

    const openAddPagePicker = () => {
        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.click();
        }
    };

    const openReplaceImagePicker = (pageIndex: number) => {
        setReplacePageIndex(pageIndex);
        setTimeout(() => {
            if (replaceInputRef.current) {
                replaceInputRef.current.value = '';
                replaceInputRef.current.click();
            }
        }, 0);
    };

    const handleAddNewPages = (files: FileList | null) => {
        if (!files) return;

        const newPages: BookPage[] = [];
        Array.from(files).forEach((file) => {
            if (file.type.startsWith('image/')) {
                newPages.push({
                    id: generateId(),
                    imageUrl: URL.createObjectURL(file),
                    title: '',
                    description: '',
                });
            }
        });
        setPages((prev) => [...prev, ...newPages]);
    };

    const handleReplaceImage = (files: FileList | null) => {
        if (!files || files.length === 0 || replacePageIndex === null) return;

        const file = files[0];
        if (file.type.startsWith('image/')) {
            setPages((prev) => 
                prev.map((p, i) => 
                    i === replacePageIndex 
                        ? { ...p, imageUrl: URL.createObjectURL(file) } 
                        : p
                )
            );
        }
        setReplacePageIndex(null);
    };

    const handleRemovePage = (index: number) => {
        setPages((prev) => prev.filter((_, i) => i !== index));
        if (selectedPage === index) {
            setSelectedPage(null);
        }
    };

    const handleUpdatePage = (index: number, updates: Partial<BookPage>) => {
        setPages((prev) => 
            prev.map((p, i) => (i === index ? { ...p, ...updates } : p))
        );
    };

    const handleSave = () => {
        onSave(pages);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm z-50"
            />

            {/* Editor Modal */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed inset-4 lg:inset-8 z-50 bg-card-bg rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row"
            >
                {/* Sidebar - Page List */}
                <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-black/5 dark:border-white/10 flex flex-col bg-card-bg dark:bg-gray-800/50">
                    {/* Header */}
                    <div className="p-4 border-b border-black/5 dark:border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <button
                                onClick={onClose}
                                className="flex items-center gap-2 text-text-muted hover:text-text-main transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Back
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-teal text-white rounded-xl font-medium hover:bg-primary-teal/90 transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                Save
                            </button>
                        </div>
                        <h2 className="text-lg font-bold text-text-main">{title}</h2>
                        <p className="text-sm text-text-muted">{pages.length} pages</p>
                    </div>

                    {/* Page Thumbnails */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-3 lg:grid-cols-2 gap-3">
                            {pages.map((page, index) => (
                                <motion.div
                                    key={page.id}
                                    layoutId={page.id}
                                    onClick={() => setSelectedPage(index)}
                                    className={`relative aspect-3/4 rounded-xl overflow-hidden cursor-pointer group ${
                                        selectedPage === index
                                            ? 'ring-2 ring-primary-teal ring-offset-2 dark:ring-offset-gray-800'
                                            : 'hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600'
                                    }`}
                                >
                                    <img
                                        src={page.imageUrl}
                                        alt={`Page ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    
                                    {/* Page Number */}
                                    <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 text-white text-xs rounded-full">
                                        {index + 1}
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemovePage(index);
                                        }}
                                        className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </motion.div>
                            ))}

                            {/* Add New Page */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    openAddPagePicker();
                                }}
                                className="aspect-3/4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-teal hover:bg-primary-teal/5 transition-all flex flex-col items-center justify-center gap-2"
                            >
                                <Plus className="w-6 h-6 text-text-muted" />
                                <span className="text-xs text-text-muted">Add Page</span>
                            </button>
                        </div>
                    </div>

                    {/* Hidden input for adding new pages */}
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                            handleAddNewPages(e.target.files);
                            e.target.value = '';
                        }}
                    />
                </div>

                {/* Main Content - Page Editor */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {selectedPage !== null ? (
                        <>
                            {/* Editor Header */}
                            <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
                                <h3 className="font-semibold text-text-main">
                                    Editing Page {selectedPage + 1}
                                </h3>
                                <button
                                    onClick={() => setSelectedPage(null)}
                                    className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-text-muted" />
                                </button>
                            </div>

                            {/* Page Preview & Edit */}
                            <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                                <div className="max-w-2xl mx-auto space-y-6">
                                    {/* Image Preview */}
                                    <div className="relative aspect-3/4 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 group">
                                        <img
                                            src={pages[selectedPage].imageUrl}
                                            alt={`Page ${selectedPage + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        
                                        {/* Replace Image Overlay */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    openReplaceImagePicker(selectedPage);
                                                }}
                                                className="flex items-center gap-2 px-6 py-3 bg-white/90 text-gray-900 rounded-xl font-medium hover:bg-white transition-colors"
                                            >
                                                <Upload className="w-5 h-5" />
                                                Replace Image
                                            </button>
                                        </div>
                                    </div>

                                    {/* Page Details */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-text-main mb-2">
                                                Page Title
                                            </label>
                                            <input
                                                type="text"
                                                value={pages[selectedPage].title || ''}
                                                onChange={(e) => 
                                                    handleUpdatePage(selectedPage, { title: e.target.value })
                                                }
                                                placeholder="Enter a title for this page..."
                                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-transparent text-text-main placeholder:text-text-muted/60 focus:border-primary-teal focus:outline-none transition-colors"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-text-main mb-2">
                                                Date
                                            </label>
                                            <input
                                                type="text"
                                                value={pages[selectedPage].date || ''}
                                                onChange={(e) => 
                                                    handleUpdatePage(selectedPage, { date: e.target.value })
                                                }
                                                placeholder="e.g., July 2023"
                                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-transparent text-text-main placeholder:text-text-muted/60 focus:border-primary-teal focus:outline-none transition-colors"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-text-main mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                value={pages[selectedPage].description || ''}
                                                onChange={(e) => 
                                                    handleUpdatePage(selectedPage, { description: e.target.value })
                                                }
                                                placeholder="Write a short description or story for this page..."
                                                rows={4}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-transparent text-text-main placeholder:text-text-muted/60 focus:border-primary-teal focus:outline-none transition-colors resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Empty State */
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <ImageIcon className="w-10 h-10 text-text-muted" />
                                </div>
                                <h3 className="text-lg font-semibold text-text-main mb-2">
                                    Select a page to edit
                                </h3>
                                <p className="text-text-muted">
                                    Click on any page thumbnail to edit its details
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Hidden input for replacing page image */}
                <input
                    ref={replaceInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        handleReplaceImage(e.target.files);
                        e.target.value = '';
                    }}
                />
            </motion.div>
        </>
    );
};
