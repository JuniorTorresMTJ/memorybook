import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop with gradient blobs */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-md z-50 overflow-hidden"
                        onClick={onClose}
                    >
                        {/* Decorative gradient blobs */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-coral/20 dark:bg-accent-coral/10 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-teal/20 dark:bg-primary-teal/10 blur-[120px] rounded-full -translate-x-1/3 translate-y-1/3"></div>
                        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent-amber/15 dark:bg-accent-amber/10 blur-[100px] rounded-full -translate-y-1/2"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-teal/25 dark:bg-primary-teal/15 blur-[90px] rounded-full"></div>
                        <div className="absolute top-1/3 left-2/3 w-64 h-64 bg-accent-coral/15 dark:bg-accent-coral/10 blur-[80px] rounded-full"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-linear-to-tr from-primary-teal/10 via-accent-coral/10 to-transparent blur-3xl rounded-full"></div>
                    </motion.div>

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="relative bg-card-bg dark:bg-gray-900 rounded-[32px] shadow-2xl w-full max-w-md p-8 pointer-events-auto border border-transparent dark:border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 text-text-muted hover:text-text-main transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {children}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
