import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import type {
    WizardStep,
    MemoryBookData,
    BookSetupData,
    ChildhoodData,
    TeenageData,
    AdultLifeData,
    LaterLifeData,
    GenerationSettings,
} from './types';
import { getInitialMemoryBookData, WIZARD_STEPS } from './types';
import { StepperSidebar } from './StepperSidebar';
import { StepperTopBar } from './StepperTopBar';
import { SkipStepDialog } from './SkipStepDialog';
import { GenerateLoadingScreen } from './GenerateLoadingScreen';
import { SuccessScreen } from './SuccessScreen';
import { BookSetupStep } from './steps/BookSetupStep';
import { ChildhoodStep } from './steps/ChildhoodStep';
import { TeenageStep } from './steps/TeenageStep';
import { AdultLifeStep } from './steps/AdultLifeStep';
import { LaterLifeStep } from './steps/LaterLifeStep';
import { ReviewStep } from './steps/ReviewStep';

interface CreateMemoryBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete?: (data: MemoryBookData) => void;
}

type ModalState = 'wizard' | 'generating' | 'success';

export const CreateMemoryBookModal = ({
    isOpen,
    onClose,
    onComplete,
}: CreateMemoryBookModalProps) => {
    const [currentStep, setCurrentStep] = useState<WizardStep>(1);
    const [data, setData] = useState<MemoryBookData>(getInitialMemoryBookData());
    const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(new Set());
    const [savedStatus, setSavedStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [showSkipDialog, setShowSkipDialog] = useState(false);
    const [modalState, setModalState] = useState<ModalState>('wizard');
    const [errors, setErrors] = useState<{
        title?: string;
        photos?: string;
    }>({});

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1);
            setData(getInitialMemoryBookData());
            setCompletedSteps(new Set());
            setSavedStatus('idle');
            setModalState('wizard');
            setErrors({});
        }
    }, [isOpen]);

    // Simulate autosave
    const triggerAutosave = useCallback(() => {
        setSavedStatus('saving');
        setTimeout(() => {
            setSavedStatus('saved');
            setTimeout(() => setSavedStatus('idle'), 2000);
        }, 500);
    }, []);

    // Update data handlers
    const updateBookSetup = useCallback(
        (updates: Partial<BookSetupData>) => {
            setData((prev) => ({
                ...prev,
                bookSetup: { ...prev.bookSetup, ...updates },
            }));
            triggerAutosave();
        },
        [triggerAutosave]
    );

    const updateChildhood = useCallback(
        (updates: Partial<ChildhoodData>) => {
            setData((prev) => ({
                ...prev,
                childhood: { ...prev.childhood, ...updates },
            }));
            triggerAutosave();
        },
        [triggerAutosave]
    );

    const updateTeenage = useCallback(
        (updates: Partial<TeenageData>) => {
            setData((prev) => ({
                ...prev,
                teenage: { ...prev.teenage, ...updates },
            }));
            triggerAutosave();
        },
        [triggerAutosave]
    );

    const updateAdultLife = useCallback(
        (updates: Partial<AdultLifeData>) => {
            setData((prev) => ({
                ...prev,
                adultLife: { ...prev.adultLife, ...updates },
            }));
            triggerAutosave();
        },
        [triggerAutosave]
    );

    const updateLaterLife = useCallback(
        (updates: Partial<LaterLifeData>) => {
            setData((prev) => ({
                ...prev,
                laterLife: { ...prev.laterLife, ...updates },
            }));
            triggerAutosave();
        },
        [triggerAutosave]
    );

    const updateGenerationSettings = useCallback(
        (updates: Partial<GenerationSettings>) => {
            setData((prev) => ({
                ...prev,
                generationSettings: { ...prev.generationSettings, ...updates },
            }));
        },
        []
    );

    // Validation
    const validateStep1 = useCallback((): boolean => {
        const newErrors: typeof errors = {};

        if (!data.bookSetup.title.trim()) {
            newErrors.title = 'Please enter a title for your Memory Book';
        }

        if (data.bookSetup.referencePhotos.length < 3) {
            newErrors.photos = `Please add at least 3 photos (${data.bookSetup.referencePhotos.length}/3)`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [data.bookSetup.title, data.bookSetup.referencePhotos.length]);

    // Navigation
    const canGoNext = useCallback((): boolean => {
        if (currentStep === 1) {
            return data.bookSetup.title.trim().length > 0 && data.bookSetup.referencePhotos.length >= 3;
        }
        return true;
    }, [currentStep, data.bookSetup.title, data.bookSetup.referencePhotos.length]);

    const goToStep = useCallback((step: WizardStep) => {
        setCurrentStep(step);
    }, []);

    const goNext = useCallback(() => {
        if (currentStep === 1 && !validateStep1()) {
            return;
        }

        setCompletedSteps((prev) => new Set([...prev, currentStep]));

        if (currentStep < 6) {
            setCurrentStep((prev) => (prev + 1) as WizardStep);
        }
    }, [currentStep, validateStep1]);

    const goBack = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as WizardStep);
        }
    }, [currentStep]);

    const handleSkipStep = useCallback(() => {
        setShowSkipDialog(true);
    }, []);

    const confirmSkip = useCallback(() => {
        setShowSkipDialog(false);
        if (currentStep < 6) {
            setCurrentStep((prev) => (prev + 1) as WizardStep);
        }
    }, [currentStep]);

    const handleGenerate = useCallback(() => {
        setModalState('generating');
    }, []);

    const handleGenerationComplete = useCallback(() => {
        setModalState('success');
        onComplete?.(data);
    }, [data, onComplete]);

    const handleOpenViewer = useCallback(() => {
        // In a real app, navigate to the book viewer
        onClose();
    }, [onClose]);

    const handleBackToDashboard = useCallback(() => {
        onClose();
    }, [onClose]);

    const currentStepInfo = WIZARD_STEPS.find((s) => s.number === currentStep);
    const isOptionalStep = currentStepInfo?.isOptional ?? false;

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={modalState === 'wizard' ? onClose : undefined}
                className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-4 md:inset-6 lg:inset-y-8 lg:inset-x-auto lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-5xl z-50 flex"
            >
                <div className="w-full h-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-transparent dark:border-white/10">
                    {/* Sidebar (Desktop) */}
                    {modalState === 'wizard' && (
                        <StepperSidebar
                            currentStep={currentStep}
                            completedSteps={completedSteps}
                            onStepClick={goToStep}
                            savedStatus={savedStatus}
                        />
                    )}

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Top Bar (Mobile) / Header (Desktop) */}
                        {modalState === 'wizard' && (
                            <>
                                <StepperTopBar
                                    currentStep={currentStep}
                                    completedSteps={completedSteps}
                                    onStepClick={goToStep}
                                    onClose={onClose}
                                    savedStatus={savedStatus}
                                />

                                {/* Desktop Header */}
                                <div className="hidden lg:flex items-center justify-between p-6 border-b border-black/5 dark:border-white/10">
                                    <div>
                                        <h2 className="text-xl font-bold text-text-main">
                                            {currentStepInfo?.title}
                                        </h2>
                                        <p className="text-sm text-text-muted">
                                            {currentStepInfo?.description}
                                        </p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-text-muted" />
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="max-w-3xl mx-auto p-6 lg:p-8">
                                <AnimatePresence mode="wait">
                                    {modalState === 'generating' && (
                                        <GenerateLoadingScreen
                                            key="loading"
                                            onComplete={handleGenerationComplete}
                                        />
                                    )}

                                    {modalState === 'success' && (
                                        <SuccessScreen
                                            key="success"
                                            bookTitle={data.bookSetup.title}
                                            onOpenViewer={handleOpenViewer}
                                            onBackToDashboard={handleBackToDashboard}
                                        />
                                    )}

                                    {modalState === 'wizard' && (
                                        <>
                                            {currentStep === 1 && (
                                                <BookSetupStep
                                                    key="step1"
                                                    data={data.bookSetup}
                                                    onChange={updateBookSetup}
                                                    errors={errors}
                                                />
                                            )}
                                            {currentStep === 2 && (
                                                <ChildhoodStep
                                                    key="step2"
                                                    data={data.childhood}
                                                    onChange={updateChildhood}
                                                />
                                            )}
                                            {currentStep === 3 && (
                                                <TeenageStep
                                                    key="step3"
                                                    data={data.teenage}
                                                    onChange={updateTeenage}
                                                />
                                            )}
                                            {currentStep === 4 && (
                                                <AdultLifeStep
                                                    key="step4"
                                                    data={data.adultLife}
                                                    onChange={updateAdultLife}
                                                />
                                            )}
                                            {currentStep === 5 && (
                                                <LaterLifeStep
                                                    key="step5"
                                                    data={data.laterLife}
                                                    onChange={updateLaterLife}
                                                />
                                            )}
                                            {currentStep === 6 && (
                                                <ReviewStep
                                                    key="step6"
                                                    data={data}
                                                    onEditSection={goToStep}
                                                    onSettingsChange={updateGenerationSettings}
                                                    completedSteps={completedSteps}
                                                />
                                            )}
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        {modalState === 'wizard' && (
                            <div className="p-4 lg:p-6 border-t border-black/5 dark:border-white/10 bg-bg-soft dark:bg-gray-800/50">
                                <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                                    {/* Left Actions */}
                                    <div className="flex items-center gap-3">
                                        {currentStep > 1 && (
                                            <button
                                                onClick={goBack}
                                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-text-main font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                                Back
                                            </button>
                                        )}
                                        {currentStep === 1 && (
                                            <button
                                                onClick={onClose}
                                                className="px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-text-main font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>

                                    {/* Right Actions */}
                                    <div className="flex items-center gap-3">
                                        {isOptionalStep && currentStep < 6 && (
                                            <button
                                                onClick={handleSkipStep}
                                                className="px-4 py-2.5 text-text-muted hover:text-text-main font-medium transition-colors"
                                            >
                                                Skip this step
                                            </button>
                                        )}

                                        {currentStep < 6 ? (
                                            <button
                                                onClick={goNext}
                                                disabled={currentStep === 1 && !canGoNext()}
                                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all ${
                                                    currentStep === 1 && !canGoNext()
                                                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                                        : 'bg-linear-to-r from-primary-teal to-teal-400 hover:from-teal-500 hover:to-teal-400 text-white shadow-lg shadow-primary-teal/20'
                                                }`}
                                            >
                                                Next
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleGenerate}
                                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-primary-teal to-teal-400 hover:from-teal-500 hover:to-teal-400 text-white font-semibold transition-all shadow-lg shadow-primary-teal/20 hover:shadow-xl hover:shadow-primary-teal/30"
                                            >
                                                <Sparkles className="w-5 h-5" />
                                                Generate Memory Book
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Skip Step Dialog */}
            <SkipStepDialog
                isOpen={showSkipDialog}
                stepName={currentStepInfo?.title || ''}
                onConfirm={confirmSkip}
                onCancel={() => setShowSkipDialog(false)}
            />
        </>
    );
};
