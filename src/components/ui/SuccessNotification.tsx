import { CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface SuccessNotificationProps {
    isVisible: boolean;
    title: string;
    message: string;
    onClose: () => void;
    autoHideDuration?: number;
}

export const SuccessNotification = ({
    isVisible,
    title,
    message,
    onClose,
    autoHideDuration = 5000
}: SuccessNotificationProps) => {
    // Auto-hide after duration
    useEffect(() => {
        if (isVisible && autoHideDuration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, autoHideDuration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, autoHideDuration, onClose]);

    return (
        <AnimatePresence>
            {isVisible && title && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
                    className="w-full bg-white border border-green-200 rounded-2xl p-4 mb-8 shadow-lg shadow-green-100/50"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-text-main">{title}</h4>
                            <p className="text-sm text-text-muted mt-0.5">{message}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-black/5 transition-colors shrink-0"
                        >
                            <X className="w-5 h-5 text-text-muted" />
                        </button>
                    </div>
                    
                    {/* Progress bar */}
                    <motion.div 
                        className="h-1 bg-green-500 rounded-full mt-3"
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: autoHideDuration / 1000, ease: 'linear' }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};
