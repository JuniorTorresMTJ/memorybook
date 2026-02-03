import { CheckCircle, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SuccessNotificationProps {
    isVisible: boolean;
    title: string;
    message: string;
    onClose: () => void;
    onViewDetails?: () => void;
}

export const SuccessNotification = ({
    isVisible,
    title,
    message,
    onClose,
    onViewDetails
}: SuccessNotificationProps) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 border border-primary-teal/20 rounded-2xl p-4 mb-8"
                >
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary-teal/20 flex items-center justify-center shrink-0">
                                <CheckCircle className="w-5 h-5 text-primary-teal" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-text-main">{title}</h4>
                                <p className="text-sm text-text-muted">{message}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            {onViewDetails && (
                                <button
                                    onClick={onViewDetails}
                                    className="flex items-center gap-2 text-text-main font-medium hover:text-primary-teal transition-colors"
                                >
                                    View details
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
