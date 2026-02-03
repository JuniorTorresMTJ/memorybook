import { motion } from 'framer-motion';
import { Check, BookOpen, ArrowRight, Home } from 'lucide-react';

interface SuccessScreenProps {
    bookTitle: string;
    onOpenViewer: () => void;
    onBackToDashboard: () => void;
}

export const SuccessScreen = ({
    bookTitle,
    onOpenViewer,
    onBackToDashboard,
}: SuccessScreenProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center"
        >
            {/* Success Icon */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative mb-8"
            >
                {/* Outer glow */}
                <div className="absolute inset-0 w-32 h-32 bg-green-400/20 rounded-full blur-xl" />
                
                {/* Main circle */}
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                    >
                        <Check className="w-16 h-16 text-white" strokeWidth={3} />
                    </motion.div>
                </div>

                {/* Decorative sparkles */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className="absolute w-3 h-3 bg-amber-400 rounded-full"
                        style={{
                            top: `${20 + Math.sin(i * 1.2) * 40}%`,
                            left: `${50 + Math.cos(i * 1.2) * 60}%`,
                        }}
                    />
                ))}
            </motion.div>

            {/* Title */}
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-text-main mb-3"
            >
                Your Memory Book is Ready!
            </motion.h2>

            {/* Book Name */}
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-text-muted mb-2"
            >
                <span className="font-semibold text-primary-teal">{bookTitle}</span>
            </motion.p>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-text-muted max-w-md mb-8"
            >
                We've created a beautiful, personalized book filled with precious memories.
                It's ready for you to view, print, or share with family.
            </motion.p>

            {/* Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-3 w-full max-w-md"
            >
                <button
                    onClick={onOpenViewer}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-primary-teal to-teal-400 hover:from-teal-500 hover:to-teal-400 text-white font-semibold transition-all shadow-lg shadow-primary-teal/20 hover:shadow-xl hover:shadow-primary-teal/30"
                >
                    <BookOpen className="w-5 h-5" />
                    Open Book Viewer
                    <ArrowRight className="w-5 h-5" />
                </button>
                <button
                    onClick={onBackToDashboard}
                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-text-main font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                    <Home className="w-5 h-5" />
                    Dashboard
                </button>
            </motion.div>

            {/* Additional info */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-xs text-text-muted mt-8"
            >
                You can access your Memory Book anytime from your dashboard
            </motion.p>
        </motion.div>
    );
};
