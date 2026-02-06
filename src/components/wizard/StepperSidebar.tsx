import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { Check } from 'lucide-react';
import type { WizardStep, StepInfo } from './types';
import { WIZARD_STEPS } from './types';

interface StepperSidebarProps {
    currentStep: WizardStep;
    completedSteps: Set<WizardStep>;
    onStepClick?: (step: WizardStep) => void;
    savedStatus?: 'saving' | 'saved' | 'idle';
}

export const StepperSidebar = ({
    currentStep,
    completedSteps,
    onStepClick,
    savedStatus = 'idle',
}: StepperSidebarProps) => {
    const { t } = useLanguage();
    const wz = t.wizard;

    // Translated step titles and descriptions
    const stepTranslations: Record<number, { title: string; description: string }> = {
        1: { title: wz?.bookSetup || 'Book Setup', description: wz?.bookSetupDesc || 'Basic settings and photos' },
        2: { title: wz?.memoriesTitle || 'Memories', description: wz?.memoriesDesc || 'Share their story' },
        3: { title: wz?.review || 'Review & Generate', description: wz?.reviewDesc || 'Final review' },
    };

    const getStepStatus = (step: StepInfo) => {
        if (completedSteps.has(step.number)) return 'completed';
        if (step.number === currentStep) return 'current';
        if (step.number < currentStep) return 'skipped';
        return 'upcoming';
    };

    return (
        <div className="hidden lg:flex flex-col w-72 bg-white border-r border-black/5 p-6">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-text-main">{wz?.createMemoryBook || 'Create Memory Book'}</h2>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-text-muted">
                        {wz?.step || 'Step'} {currentStep} {wz?.of || 'of'} {WIZARD_STEPS.length}
                    </span>
                    {savedStatus === 'saved' && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-xs text-green-600 flex items-center gap-1"
                        >
                            <Check className="w-3 h-3" />
                            {wz?.saved || 'Saved'}
                        </motion.span>
                    )}
                    {savedStatus === 'saving' && (
                        <span className="text-xs text-text-muted">{wz?.saving || 'Saving...'}</span>
                    )}
                </div>
            </div>

            {/* Steps */}
            <nav className="flex-1">
                <ul className="space-y-2">
                    {WIZARD_STEPS.map((step, index) => {
                        const status = getStepStatus(step);
                        const isClickable = step.number <= currentStep || completedSteps.has(step.number);

                        return (
                            <li key={step.number}>
                                <button
                                    onClick={() => isClickable && onStepClick?.(step.number)}
                                    disabled={!isClickable}
                                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left ${
                                        status === 'current'
                                            ? 'bg-primary-teal/10'
                                            : isClickable
                                            ? 'hover:bg-black/5'
                                            : 'opacity-50 cursor-not-allowed'
                                    }`}
                                >
                                    {/* Step Indicator */}
                                    <div className="relative">
                                        {status === 'completed' ? (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"
                                            >
                                                <Check className="w-4 h-4 text-white" />
                                            </motion.div>
                                        ) : status === 'current' ? (
                                            <div className="w-8 h-8 rounded-full bg-primary-teal flex items-center justify-center">
                                                <span className="text-sm font-semibold text-white">
                                                    {step.number}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                                                <span className="text-sm text-text-muted">
                                                    {step.number}
                                                </span>
                                            </div>
                                        )}

                                        {/* Connector line */}
                                        {index < WIZARD_STEPS.length - 1 && (
                                            <div
                                                className={`absolute left-1/2 top-full w-0.5 h-4 -translate-x-1/2 ${
                                                    completedSteps.has(step.number)
                                                        ? 'bg-green-500'
                                                        : 'bg-gray-200'
                                                }`}
                                            />
                                        )}
                                    </div>

                                    {/* Step Info */}
                                    <div className="flex-1 min-w-0 pt-1">
                                        <p
                                            className={`font-medium text-sm truncate ${
                                                status === 'current'
                                                    ? 'text-primary-teal'
                                                    : status === 'completed'
                                                    ? 'text-text-main'
                                                    : 'text-text-muted'
                                            }`}
                                        >
                                            {stepTranslations[step.number]?.title || step.title}
                                        </p>
                                        <p className="text-xs text-text-muted truncate mt-0.5">
                                            {stepTranslations[step.number]?.description || step.description}
                                        </p>
                                        {step.isOptional && (
                                            <span className="text-xs text-amber-600">
                                                {t.common?.optional || 'Optional'}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Progress Bar */}
            <div className="mt-auto pt-6">
                <div className="flex justify-between text-xs text-text-muted mb-2">
                    <span>{wz?.progress || 'Progress'}</span>
                    <span>{Math.round((currentStep / WIZARD_STEPS.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-linear-to-r from-primary-teal to-teal-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep / WIZARD_STEPS.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>
        </div>
    );
};
