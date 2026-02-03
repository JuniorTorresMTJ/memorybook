import { motion } from 'framer-motion';
import { Check, AlertCircle, Edit3, Image as ImageIcon } from 'lucide-react';

interface ReviewSummaryCardProps {
    title: string;
    icon: React.ReactNode;
    gradient: string;
    promptsAnswered: number;
    totalPrompts: number;
    imagesAdded: number;
    onEdit: () => void;
    isSkipped?: boolean;
}

export const ReviewSummaryCard = ({
    title,
    icon,
    gradient,
    promptsAnswered,
    totalPrompts,
    imagesAdded,
    onEdit,
    isSkipped = false,
}: ReviewSummaryCardProps) => {
    const completionPercent = totalPrompts > 0 ? Math.round((promptsAnswered / totalPrompts) * 100) : 0;
    const isComplete = promptsAnswered > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative p-4 rounded-2xl border-2 transition-all ${
                isSkipped
                    ? 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30'
                    : isComplete
                    ? 'border-green-200 dark:border-green-500/30 bg-green-50/50 dark:bg-green-500/10'
                    : 'border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/10'
            }`}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center ${
                            isSkipped ? 'opacity-50' : ''
                        }`}
                    >
                        {icon}
                    </div>
                    <div>
                        <h3 className={`font-semibold text-text-main ${isSkipped ? 'opacity-60' : ''}`}>
                            {title}
                        </h3>
                        {isSkipped ? (
                            <p className="text-xs text-text-muted">Skipped</p>
                        ) : (
                            <p className="text-xs text-text-muted">
                                {promptsAnswered} of {totalPrompts} prompts answered
                            </p>
                        )}
                    </div>
                </div>

                {/* Status Badge */}
                {!isSkipped && (
                    <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            isComplete
                                ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                                : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                        }`}
                    >
                        {isComplete ? (
                            <>
                                <Check className="w-3 h-3" />
                                Ready
                            </>
                        ) : (
                            <>
                                <AlertCircle className="w-3 h-3" />
                                Pending
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            {!isSkipped && (
                <div className="mt-3">
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${completionPercent}%` }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className={`h-full rounded-full ${
                                isComplete ? 'bg-green-500' : 'bg-amber-500'
                            }`}
                        />
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1 text-xs text-text-muted">
                    <ImageIcon className="w-3.5 h-3.5" />
                    {imagesAdded} photo{imagesAdded !== 1 ? 's' : ''}
                </div>
                <button
                    onClick={onEdit}
                    className="flex items-center gap-1 text-xs font-medium text-primary-teal hover:text-primary-teal/80 transition-colors"
                >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                </button>
            </div>
        </motion.div>
    );
};
