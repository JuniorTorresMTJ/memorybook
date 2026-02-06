import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useState } from 'react';
import type { WizardStep } from './types';
import { WIZARD_STEPS } from './types';

interface StepperTopBarProps {
    currentStep: WizardStep;
    completedSteps: Set<WizardStep>;
    onStepClick?: (step: WizardStep) => void;
    onClose: () => void;
    savedStatus?: 'saving' | 'saved' | 'idle';
}

export const StepperTopBar = ({
    currentStep,
    completedSteps,
    onStepClick,
    onClose,
    savedStatus = 'idle',
}: StepperTopBarProps) => {
    const { t } = useLanguage();
    const wz = t.wizard;

    // Translated step titles
    const stepTranslations: Record<number, string> = {
        1: wz?.bookSetup || 'Book Setup',
        2: wz?.memoriesTitle || 'Memories',
        3: wz?.review || 'Review & Generate',
    };

    const [isExpanded, setIsExpanded] = useState(false);
    const currentStepInfo = WIZARD_STEPS.find((s) => s.number === currentStep);

    return (
        <div className="lg:hidden sticky top-0 z-10 bg-white border-b border-black/5">
            {/* Main Bar */}
            <div className="flex items-center justify-between p-4">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2"
                >
                    <div className="w-8 h-8 rounded-full bg-primary-teal flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">{currentStep}</span>
                    </div>
                    <div className="text-left">
                        <p className="font-medium text-sm text-text-main">
                            {stepTranslations[currentStep] || currentStepInfo?.title}
                        </p>
                        <p className="text-xs text-text-muted">
                            {wz?.step || 'Step'} {currentStep} {wz?.of || 'of'} {WIZARD_STEPS.length}
                        </p>
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-text-muted" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-text-muted" />
                    )}
                </button>

                <div className="flex items-center gap-3">
                    {savedStatus === 'saved' && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-green-600 flex items-center gap-1"
                        >
                            <Check className="w-3 h-3" />
                            {wz?.saved || 'Saved'}
                        </motion.span>
                    )}
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black/5 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-text-muted" />
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-gray-200">
                <motion.div
                    className="h-full bg-linear-to-r from-primary-teal to-teal-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / WIZARD_STEPS.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Expanded Steps List */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden bg-white"
                    >
                        <div className="p-4 space-y-2">
                            {WIZARD_STEPS.map((step) => {
                                const isCompleted = completedSteps.has(step.number);
                                const isCurrent = step.number === currentStep;
                                const isClickable = step.number <= currentStep || isCompleted;

                                return (
                                    <button
                                        key={step.number}
                                        onClick={() => {
                                            if (isClickable) {
                                                onStepClick?.(step.number);
                                                setIsExpanded(false);
                                            }
                                        }}
                                        disabled={!isClickable}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                                            isCurrent
                                                ? 'bg-primary-teal/10'
                                                : isClickable
                                                ? 'hover:bg-black/5'
                                                : 'opacity-50'
                                        }`}
                                    >
                                        {isCompleted ? (
                                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        ) : isCurrent ? (
                                            <div className="w-6 h-6 rounded-full bg-primary-teal flex items-center justify-center">
                                                <span className="text-xs font-semibold text-white">
                                                    {step.number}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                                                <span className="text-xs text-text-muted">
                                                    {step.number}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p
                                                className={`font-medium text-sm ${
                                                    isCurrent ? 'text-primary-teal' : 'text-text-main'
                                                }`}
                                            >
                                                {stepTranslations[step.number] || step.title}
                                            </p>
                                        </div>
                                        {step.isOptional && (
                                            <span className="text-xs text-amber-600">
                                                {t.common?.optional || 'Optional'}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
