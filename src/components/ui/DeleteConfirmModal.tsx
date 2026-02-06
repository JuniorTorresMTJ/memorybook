import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    bookTitle: string;
    isDeleting?: boolean;
}

export const DeleteConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    bookTitle,
    isDeleting = false,
}: DeleteConfirmModalProps) => {
    const { t } = useLanguage();
    const dc = t.deleteConfirm;
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />

            {/* Modal */}
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-full max-w-md p-4"
                >
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                            <button
                                onClick={onClose}
                                disabled={isDeleting}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Warning Icon */}
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-8 h-8 text-red-500" />
                                </div>
                            </div>

                            {/* Warning Text */}
                            <div className="text-center mb-6">
                                <p className="text-gray-700 mb-2">
                                    {dc?.aboutToDelete || 'Você está prestes a excluir'}
                                </p>
                                <p className="text-lg font-bold text-gray-900 mb-4">
                                    "{bookTitle}"
                                </p>
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <p className="text-red-700 text-sm font-medium">
                                        ⚠️ {dc?.permanentAction || 'Esta ação é permanente e não pode ser desfeita.'}
                                    </p>
                                    <p className="text-red-600 text-sm mt-1">
                                        {dc?.lostForever || 'Todas as páginas, imagens e memórias deste livro serão perdidas para sempre.'}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    {dc?.cancel || 'Cancelar'}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            {dc?.deleting || 'Excluindo...'}
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            {dc?.deletePermanently || 'Excluir Permanentemente'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </>
    );
};
