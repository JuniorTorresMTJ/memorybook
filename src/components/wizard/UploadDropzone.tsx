import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, AlertCircle, Plus } from 'lucide-react';
import type { UploadedImage } from './types';
import { useLanguage } from '../../contexts/LanguageContext';

interface UploadDropzoneProps {
    images: UploadedImage[];
    onChange: (images: UploadedImage[]) => void;
    minImages?: number;
    maxImages?: number;
    label?: string;
    helperText?: string;
    showPrivacyHint?: boolean;
    error?: string;
    required?: boolean;
}

export const UploadDropzone = ({
    images,
    onChange,
    minImages = 0,
    maxImages = 20,
    label = 'Upload photos',
    helperText,
    showPrivacyHint = false,
    error,
    required = false,
}: UploadDropzoneProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { t } = useLanguage();
    const up = t.upload;
    const wz = t.wizard;
    const cm = t.common;

    const generateId = () => Math.random().toString(36).substring(2, 11);

    const openFilePicker = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (inputRef.current && images.length < maxImages) {
            inputRef.current.value = ''; // Reset input to allow selecting same file
            inputRef.current.click();
        }
    };

    const handleFiles = useCallback(
        (files: FileList | null) => {
            if (!files) return;

            const newImages: UploadedImage[] = [];
            const remainingSlots = maxImages - images.length;

            Array.from(files)
                .slice(0, remainingSlots)
                .forEach((file) => {
                    if (file.type.startsWith('image/')) {
                        newImages.push({
                            id: generateId(),
                            file,
                            preview: URL.createObjectURL(file),
                            name: file.name,
                        });
                    }
                });

            onChange([...images, ...newImages]);
        },
        [images, maxImages, onChange]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
        },
        [handleFiles]
    );

    const handleRemove = useCallback(
        (id: string) => {
            const image = images.find((img) => img.id === id);
            if (image) {
                URL.revokeObjectURL(image.preview);
            }
            onChange(images.filter((img) => img.id !== id));
        },
        [images, onChange]
    );

    const hasError = error || (required && minImages > 0 && images.length < minImages);
    const photosWord = minImages > 1 ? (up?.photos || 'fotos') : (up?.photo || 'foto');
    const errorMessage =
        error || (required && minImages > 0 && images.length < minImages
            ? `${up?.addAtLeast || 'Adicione pelo menos'} ${minImages} ${photosWord} ${up?.toContinue || 'para continuar'}.`
            : undefined);

    return (
        <div className="space-y-3">
            {/* Label */}
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-text-main">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <span className="text-xs text-text-muted">
                    {images.length} / {maxImages} {cm?.photos || 'fotos'}
                </span>
            </div>

            {/* Hidden File Input - positioned at document level */}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}
                onChange={(e) => {
                    handleFiles(e.target.files);
                    if (e.target) e.target.value = ''; // Reset for re-selection
                }}
            />

            {/* Dropzone */}
            <button
                type="button"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={(e) => openFilePicker(e)}
                disabled={images.length >= maxImages}
                className={`relative w-full border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer text-center ${
                    images.length >= maxImages
                        ? 'opacity-50 cursor-not-allowed'
                        : isDragging
                        ? 'border-primary-teal bg-primary-teal/5 dark:bg-primary-teal/10'
                        : hasError
                        ? 'border-red-300 dark:border-red-500/50 bg-red-50/50 dark:bg-red-500/5'
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary-teal hover:bg-primary-teal/5 dark:hover:bg-primary-teal/10'
                }`}
            >
                <motion.div
                    animate={{ scale: isDragging ? 1.05 : 1 }}
                    className="flex flex-col items-center gap-3 pointer-events-none"
                >
                    <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                            isDragging
                                ? 'bg-primary-teal/20'
                                : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                    >
                        <Upload
                            className={`w-6 h-6 ${
                                isDragging ? 'text-primary-teal' : 'text-text-muted'
                            }`}
                        />
                    </div>
                    <div>
                        <p className="font-medium text-text-main">
                            {isDragging ? (up?.dropHere || 'Solte as fotos aqui') : (up?.dragDrop || 'Arraste e solte fotos')}
                        </p>
                        <p className="text-sm text-text-muted mt-1">
                            {cm?.or || 'ou'}{' '}
                            <span className="text-primary-teal font-medium">
                                {up?.clickBrowse || 'clique para navegar seus arquivos'}
                            </span>
                        </p>
                    </div>
                </motion.div>
            </button>

            {/* Helper Text */}
            {helperText && !errorMessage && (
                <p className="text-sm text-text-muted">{helperText}</p>
            )}

            {/* Error Message */}
            {errorMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
                >
                    <AlertCircle className="w-4 h-4" />
                    {errorMessage}
                </motion.div>
            )}

            {/* Privacy Hint */}
            {showPrivacyHint && (
                <p className="text-xs text-text-muted flex items-center gap-1">
                    <span className="text-primary-teal">🔒</span>
                    {wz?.photosPrivacy || 'As fotos são usadas apenas para personalizar o livro.'}
                </p>
            )}

            {/* Image Previews */}
            {images.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                    <AnimatePresence>
                        {images.map((image) => (
                            <motion.div
                                key={image.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="relative group"
                            >
                                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-transparent hover:border-primary-teal transition-all">
                                    <img
                                        src={image.preview}
                                        alt={image.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                                    {/* Remove Button */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleRemove(image.id);
                                        }}
                                        className="absolute top-1 right-1 p-1.5 bg-red-500 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    >
                                        <X className="w-3 h-3 text-white" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Add More Button */}
                    {images.length < maxImages && (
                        <motion.button
                            type="button"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openFilePicker();
                            }}
                            className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-teal hover:bg-primary-teal/5 dark:hover:bg-primary-teal/10 transition-all flex flex-col items-center justify-center gap-1"
                        >
                            <Plus className="w-6 h-6 text-text-muted" />
                            <span className="text-xs text-text-muted">{up?.add || 'Adicionar'}</span>
                        </motion.button>
                    )}
                </div>
            )}

            {/* Empty State */}
            {images.length === 0 && minImages > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm">
                    <ImageIcon className="w-4 h-4" />
                    {up?.addAtLeast || 'Adicione pelo menos'} {minImages} {minImages > 1 ? (up?.photos || 'fotos') : (up?.photo || 'foto')} {up?.toContinue || 'para continuar'}.
                </div>
            )}
        </div>
    );
};
