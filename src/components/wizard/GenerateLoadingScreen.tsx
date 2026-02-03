import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, BookOpen, Sparkles, Palette, Heart } from 'lucide-react';

interface GenerateLoadingScreenProps {
    onComplete: () => void;
}

interface LoadingStep {
    id: string;
    label: string;
    icon: React.ReactNode;
    duration: number;
}

const loadingSteps: LoadingStep[] = [
    {
        id: 'organizing',
        label: 'Organizing memories',
        icon: <BookOpen className="w-5 h-5" />,
        duration: 3000,
    },
    {
        id: 'chapters',
        label: 'Creating chapters',
        icon: <Sparkles className="w-5 h-5" />,
        duration: 4000,
    },
    {
        id: 'illustrations',
        label: 'Generating illustrations',
        icon: <Palette className="w-5 h-5" />,
        duration: 5000,
    },
    {
        id: 'final',
        label: 'Final touches',
        icon: <Heart className="w-5 h-5" />,
        duration: 2000,
    },
];

const calmMessages = [
    "Every memory is precious...",
    "Creating something beautiful...",
    "Weaving stories together...",
    "Adding warmth to each page...",
    "Almost ready to share...",
];

export const GenerateLoadingScreen = ({ onComplete }: GenerateLoadingScreenProps) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        if (currentStepIndex >= loadingSteps.length) {
            const timer = setTimeout(onComplete, 1000);
            return () => clearTimeout(timer);
        }

        const currentStep = loadingSteps[currentStepIndex];
        const timer = setTimeout(() => {
            setCompletedSteps((prev) => new Set([...prev, currentStep.id]));
            setCurrentStepIndex((prev) => prev + 1);
        }, currentStep.duration);

        return () => clearTimeout(timer);
    }, [currentStepIndex, onComplete]);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % calmMessages.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const progress = ((currentStepIndex) / loadingSteps.length) * 100;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[400px] p-8"
        >
            {/* Animated Book Icon */}
            <motion.div
                animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-teal to-teal-400 flex items-center justify-center mb-8 shadow-lg shadow-primary-teal/20"
            >
                <BookOpen className="w-12 h-12 text-white" />
            </motion.div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-text-main text-center mb-2">
                Creating Your Memory Book
            </h2>

            {/* Calm Message */}
            <AnimatePresence mode="wait">
                <motion.p
                    key={messageIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-text-muted text-center mb-8"
                >
                    {calmMessages[messageIndex]}
                </motion.p>
            </AnimatePresence>

            {/* Progress Bar */}
            <div className="w-full max-w-md mb-8">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary-teal to-teal-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* Steps */}
            <div className="w-full max-w-md space-y-3">
                {loadingSteps.map((step, index) => {
                    const isCompleted = completedSteps.has(step.id);
                    const isCurrent = index === currentStepIndex;

                    return (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                                isCurrent
                                    ? 'bg-primary-teal/10 dark:bg-primary-teal/20'
                                    : isCompleted
                                    ? 'bg-green-50 dark:bg-green-500/10'
                                    : 'opacity-50'
                            }`}
                        >
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                    isCompleted
                                        ? 'bg-green-500 text-white'
                                        : isCurrent
                                        ? 'bg-primary-teal/20 text-primary-teal'
                                        : 'bg-gray-100 dark:bg-gray-800 text-text-muted'
                                }`}
                            >
                                {isCompleted ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                    >
                                        <Check className="w-5 h-5" />
                                    </motion.div>
                                ) : isCurrent ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "linear",
                                        }}
                                    >
                                        {step.icon}
                                    </motion.div>
                                ) : (
                                    step.icon
                                )}
                            </div>
                            <span
                                className={`font-medium ${
                                    isCompleted
                                        ? 'text-green-700 dark:text-green-400'
                                        : isCurrent
                                        ? 'text-primary-teal'
                                        : 'text-text-muted'
                                }`}
                            >
                                {step.label}
                            </span>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};
