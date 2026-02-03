import { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Calendar, Type, FileText, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddMemoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (memory: MemoryData) => void;
}

interface MemoryData {
    title: string;
    date: string;
    description: string;
    image: File | null;
}

export const AddMemoryModal = ({ isOpen, onClose, onSubmit }: AddMemoryModalProps) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImageChange(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleImageChange(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit({ title, date, description, image });
        }
        handleClose();
    };

    const handleClose = () => {
        setTitle('');
        setDate('');
        setDescription('');
        setImage(null);
        setImagePreview(null);
        onClose();
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-transparent dark:border-white/10"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-black/5 dark:border-white/10 px-6 py-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-teal/10 rounded-xl flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-primary-teal" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-text-main">Add New Memory</h2>
                                    <p className="text-sm text-text-muted">Capture a precious moment</p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Image Upload */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-text-main mb-2">
                                    <ImageIcon className="w-4 h-4 text-primary-teal" />
                                    Photo
                                </label>
                                
                                {imagePreview ? (
                                    <div className="relative rounded-xl overflow-hidden">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-64 object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-3 right-3 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                                        >
                                            <X className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                                            isDragging
                                                ? 'border-primary-teal bg-primary-teal/5'
                                                : 'border-black/10 dark:border-white/10 hover:border-primary-teal/50 hover:bg-black/2 dark:hover:bg-white/2'
                                        }`}
                                    >
                                        <div className="w-12 h-12 bg-primary-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Upload className="w-6 h-6 text-primary-teal" />
                                        </div>
                                        <p className="text-text-main font-medium mb-1">
                                            Drop your photo here or click to browse
                                        </p>
                                        <p className="text-sm text-text-muted">
                                            Supports JPG, PNG, GIF up to 10MB
                                        </p>
                                    </div>
                                )}
                                
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileInput}
                                    className="hidden"
                                />
                            </div>

                            {/* Title */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-text-main mb-2">
                                    <Type className="w-4 h-4 text-primary-teal" />
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Give this memory a name..."
                                    className="w-full px-4 py-3 bg-bg-soft rounded-xl border border-black/5 dark:border-white/10 text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-teal/30 focus:border-primary-teal transition-all"
                                    required
                                />
                            </div>

                            {/* Date */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-text-main mb-2">
                                    <Calendar className="w-4 h-4 text-primary-teal" />
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-bg-soft rounded-xl border border-black/5 dark:border-white/10 text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-teal/30 focus:border-primary-teal transition-all"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-text-main mb-2">
                                    <FileText className="w-4 h-4 text-primary-teal" />
                                    Story
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Tell the story behind this memory..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-bg-soft rounded-xl border border-black/5 dark:border-white/10 text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-teal/30 focus:border-primary-teal transition-all resize-none"
                                    required
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-6 py-2.5 rounded-xl font-medium text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-primary-teal text-white rounded-xl font-semibold hover:bg-primary-teal/90 transition-colors shadow-md hover:shadow-lg"
                                >
                                    Save Memory
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
