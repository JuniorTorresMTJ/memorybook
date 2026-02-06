import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { AlertCircle, X } from 'lucide-react';

interface SkipStepDialogProps {
    isOpen: boolean;
    stepName: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const SkipStepDialog = ({
    isOpen,
    stepName,
    onConfirm,
    onCancel,
}: SkipStepDialogProps) => {
    const { t } = useLanguage();
    const wz = t.wizard;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl p-6 m-4">
                            {/* Close Button */}
                            <button
                                onClick={onCancel}
                                className="absolute top-4 right-4 p-2 hover:bg-black/5 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-text-muted" />
                            </button>

                            {/* Icon */}
                            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto">
                                <AlertCircle className="w-7 h-7 text-amber-600" />
                            </div>

                            {/* Content */}
                            <div className="text-center mt-4">
                                <h3 className="text-xl font-semibold text-text-main">
                                    {wz?.skipTitle || 'Skip'} {stepName}?
                                </h3>
                                <p className="text-text-muted mt-2">
                                    {wz?.skipMessage || "You can always come back later to fill in these memories. The book will still be created with the information you've provided."}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={onCancel}
                                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-text-main font-medium hover:bg-black/5 transition-colors"
                                >
                                    {wz?.keepFilling || 'Keep Filling'}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="flex-1 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
                                >
                                    {wz?.skipForNow || 'Skip for Now'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
