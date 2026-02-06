import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Sparkles, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type {
    WizardStep,
    MemoryBookData,
    BookSetupData,
    MemoriesData,
    GenerationSettings,
} from './types';
import { getInitialMemoryBookData, WIZARD_STEPS } from './types';
import { StepperSidebar } from './StepperSidebar';
import { StepperTopBar } from './StepperTopBar';
import { GenerateLoadingScreen, type PreBackendStep } from './GenerateLoadingScreen';
import { SuccessScreen } from './SuccessScreen';
import { BookSetupStep } from './steps/BookSetupStep';
import { MemoriesStep } from './steps/MemoriesStep';
import { ReviewStep } from './steps/ReviewStep';
import { useWizardPersistence } from './useWizardPersistence';

// API and Firebase imports
import {
    createJob,
    useJobPolling,
    transformWizardDataToPayload,
    getReferencePhotos,
    detectUserLanguage,
    getAssetUrl,
    type FinalBookPackage,
} from '../../lib/api';
import {
    createMemoryBook,
    createGenerationJob,
    completeGenerationJob,
    failGenerationJob,
    updateMemoryBookStatus,
} from '../../lib/firebase/firestore';
import { downloadBookImages } from '../../lib/firebase/storage';
import { ensureAuthenticated } from '../../lib/firebase/auth';
import { useAuth } from '../../contexts/AuthContext';

interface CreateMemoryBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete?: (data: MemoryBookData) => void;
    onSuccess?: (bookTitle: string) => void;
}

type ModalState = 'wizard' | 'generating' | 'success' | 'error';

export const CreateMemoryBookModal = ({
    isOpen,
    onClose,
    onComplete,
    onSuccess,
}: CreateMemoryBookModalProps) => {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState<WizardStep>(1);
    const { t } = useLanguage();
    const wz = t.wizard;

    const [data, setData] = useState<MemoryBookData>(getInitialMemoryBookData());
    const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(new Set());
    const [savedStatus, setSavedStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [showRestoreDialog, setShowRestoreDialog] = useState(false);
    const [modalState, setModalState] = useState<ModalState>('wizard');
    const [errors, setErrors] = useState<{
        title?: string;
        photos?: string;
    }>({});
    
    // Job tracking state
    const [jobId, setJobId] = useState<string | null>(null);
    const [bookId, setBookId] = useState<string | null>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [, setResult] = useState<FinalBookPackage | null>(null);
    const [preBackendStep, setPreBackendStep] = useState<PreBackendStep>(null);
    
    // Persistence hook
    const { loadSavedData, saveData, clearSavedData, hasSavedData } = useWizardPersistence();
    const hasCheckedSavedData = useRef(false);
    
    // Use polling hook for job status
    const { 
        status: jobStatus, 
        result: jobResult, 
        error: jobError,
        stopPolling 
    } = useJobPolling(jobId);

    // Handle job status updates
    useEffect(() => {
        if (jobStatus?.status === 'completed' && jobResult) {
            handleGenerationComplete(jobResult);
        } else if (jobStatus?.status === 'failed' || jobError) {
            handleGenerationFailed(jobError || jobStatus?.error || 'Generation failed');
        }
    }, [jobStatus, jobResult, jobError]);

    // Check for saved data when modal opens
    useEffect(() => {
        if (isOpen && !hasCheckedSavedData.current) {
            hasCheckedSavedData.current = true;
            
            if (hasSavedData()) {
                setShowRestoreDialog(true);
            }
        }
        
        if (!isOpen) {
            hasCheckedSavedData.current = false;
        }
    }, [isOpen, hasSavedData]);

    // Auto-save data when it changes
    useEffect(() => {
        if (isOpen && modalState === 'wizard' && !showRestoreDialog) {
            saveData(data, currentStep, completedSteps);
        }
    }, [data, currentStep, completedSteps, isOpen, modalState, showRestoreDialog, saveData]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stopPolling) stopPolling();
        };
    }, [stopPolling]);

    // Restore saved data
    const handleRestoreData = useCallback(() => {
        const saved = loadSavedData();
        if (saved) {
            setData(saved.data);
            setCurrentStep(saved.step);
            setCompletedSteps(saved.completedSteps);
        }
        setShowRestoreDialog(false);
    }, [loadSavedData]);

    // Start fresh
    const handleStartFresh = useCallback(() => {
        clearSavedData();
        setData(getInitialMemoryBookData());
        setCurrentStep(1);
        setCompletedSteps(new Set());
        setShowRestoreDialog(false);
    }, [clearSavedData]);

    // Autosave indicator
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

    const updateMemories = useCallback(
        (updates: Partial<MemoriesData>) => {
            setData((prev) => ({
                ...prev,
                memories: { ...prev.memories, ...updates },
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
            newErrors.title = wz?.validationTitle || 'Please enter a title for your Memory Book';
        }

        // Validate based on reference input mode
        if (data.bookSetup.referenceInputMode === 'photos') {
            if (data.bookSetup.referencePhotos.length < 3) {
                newErrors.photos = `${wz?.validationPhotos || 'Please add at least 3 photos'} (${data.bookSetup.referencePhotos.length}/3)`;
            }
        } else if (data.bookSetup.referenceInputMode === 'characteristics') {
            if (!data.bookSetup.physicalCharacteristics.name.trim()) {
                newErrors.photos = wz?.validationName || 'Please enter the person\'s name';
            } else if (!data.bookSetup.physicalCharacteristics.gender) {
                newErrors.photos = wz?.validationGender || 'Please select a gender';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [data.bookSetup.title, data.bookSetup.referencePhotos.length, data.bookSetup.referenceInputMode, data.bookSetup.physicalCharacteristics]);

    // Navigation
    const canGoNext = useCallback((): boolean => {
        if (currentStep === 1) {
            // Title is always required
            if (!data.bookSetup.title.trim()) return false;
            
            // Check reference input mode requirements
            if (data.bookSetup.referenceInputMode === 'photos') {
                return data.bookSetup.referencePhotos.length >= 3;
            } else if (data.bookSetup.referenceInputMode === 'characteristics') {
                return !!(data.bookSetup.physicalCharacteristics.name.trim() && 
                         data.bookSetup.physicalCharacteristics.gender);
            }
        }
        return true;
    }, [currentStep, data.bookSetup.title, data.bookSetup.referencePhotos.length, data.bookSetup.referenceInputMode, data.bookSetup.physicalCharacteristics]);

    const goToStep = useCallback((step: WizardStep) => {
        setCurrentStep(step);
    }, []);

    const goNext = useCallback(() => {
        if (currentStep === 1 && !validateStep1()) {
            return;
        }

        setCompletedSteps((prev) => new Set([...prev, currentStep]));

        if (currentStep < 3) {
            setCurrentStep((prev) => (prev + 1) as WizardStep);
        }
    }, [currentStep, validateStep1]);

    const goBack = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as WizardStep);
        }
    }, [currentStep]);

    // Generation handlers
    const handleGenerate = useCallback(async () => {
        setModalState('generating');
        setGenerationError(null);
        setPreBackendStep('saving_firebase');

        try {
            // Ensure user is authenticated (will sign in anonymously if needed)
            let userId = user?.uid;
            if (!userId) {
                console.log('User not authenticated, signing in anonymously...');
                try {
                    const anonymousUser = await ensureAuthenticated();
                    userId = anonymousUser.uid;
                    console.log('Signed in anonymously:', userId);
                } catch (authError) {
                    console.error('Failed to authenticate:', authError);
                    throw new Error('Failed to authenticate. Please check your Firebase configuration.');
                }
            }
            
            const userLanguage = detectUserLanguage();

            // 1. Create Memory Book in Firebase
            console.log('Creating memory book in Firebase...');
            const newBookId = await createMemoryBook(userId, {
                title: data.bookSetup.title,
                subtitle: data.bookSetup.subtitle || undefined,
                bookDate: data.bookSetup.date ? new Date(data.bookSetup.date) : new Date(),
                pageCount: data.bookSetup.pageCount,
                imageStyle: data.bookSetup.illustrationStyle,
                tone: data.generationSettings.tone,
                readingLevel: data.generationSettings.readingLevel,
            });
            setBookId(newBookId);
            console.log('Memory book created:', newBookId);

            // 2. Transform wizard data to API payload
            setPreBackendStep('calling_api');
            const payload = transformWizardDataToPayload(data, userLanguage);
            const referencePhotos = getReferencePhotos(data);

            // 3. Send to backend API
            console.log('Sending to backend API...');
            const response = await createJob(payload, referencePhotos);
            setJobId(response.job_id);
            setPreBackendStep('waiting_backend');
            console.log('Job created:', response.job_id);

            // 4. Create generation job in Firebase using the backend job ID
            await createGenerationJob(newBookId, {
                backendJobId: response.job_id,
                payload: payload as unknown as Record<string, unknown>,
            }, response.job_id);

            // 5. Update book status
            await updateMemoryBookStatus(newBookId, 'generating');

            // Clear saved data on successful submission
            clearSavedData();

        } catch (error) {
            console.error('Failed to start generation:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to start generation';
            setGenerationError(errorMessage);
            setPreBackendStep(null);
            setModalState('error');
        }
    }, [user, data, clearSavedData]);

    const handleGenerationComplete = useCallback(async (bookResult: FinalBookPackage) => {
        setResult(bookResult);
        
        // Update Firebase - persist images to Firebase Storage, then save result
        if (bookId && jobId) {
            try {
                const resultSnapshot = bookResult as unknown as Record<string, unknown>;
                
                // Try to get image data for persistence
                // First: check if backend embedded image_data in the result
                const imageMap = new Map<string, string>();
                const extractImageData = (page: Record<string, unknown> | undefined, key: string) => {
                    if (page && typeof page.image_data === 'string' && page.image_data.startsWith('data:')) {
                        imageMap.set(key, page.image_data);
                    }
                };
                extractImageData(resultSnapshot.cover as Record<string, unknown>, 'cover');
                extractImageData(resultSnapshot.back_cover as Record<string, unknown>, 'back_cover');
                if (Array.isArray(resultSnapshot.pages)) {
                    (resultSnapshot.pages as Record<string, unknown>[]).forEach((p, i) => {
                        extractImageData(p, `page_${i}`);
                    });
                }
                
                // Fallback: if no embedded images, try downloading from backend 
                // (works if same Cloud Run instance is still alive)
                if (imageMap.size === 0) {
                    try {
                        const downloaded = await downloadBookImages(
                            resultSnapshot,
                            (filename: string) => getAssetUrl(jobId, 'outputs', filename),
                        );
                        downloaded.forEach((v, k) => imageMap.set(k, v));
                        console.log(`Downloaded ${imageMap.size} images from backend`);
                    } catch (dlErr) {
                        console.warn('Failed to download images from backend:', dlErr);
                    }
                } else {
                    console.log(`Using ${imageMap.size} embedded images from backend`);
                }
                
                await completeGenerationJob(bookId, jobId, resultSnapshot, imageMap.size > 0 ? imageMap : undefined);
                await updateMemoryBookStatus(bookId, 'completed');
            } catch (error) {
                console.error('Failed to update Firebase:', error);
            }
        }

        // Clear saved data on success
        clearSavedData();

        // Auto-close modal and trigger success popup
        const bookTitle = data.bookSetup.title;
        
        // Brief delay to show completion, then close
        setTimeout(() => {
            onComplete?.(data);
            onSuccess?.(bookTitle);
            // Close modal inline (to avoid circular dependency)
            if (stopPolling) stopPolling();
            setModalState('wizard');
            setJobId(null);
            setBookId(null);
            setGenerationError(null);
            setResult(null);
            setErrors({});
            onClose();
        }, 500);
    }, [bookId, jobId, data, onComplete, onSuccess, clearSavedData, stopPolling, onClose]);

    const handleGenerationFailed = useCallback(async (errorMessage: string) => {
        setGenerationError(errorMessage);
        
        // Update Firebase
        if (bookId && jobId) {
            try {
                await failGenerationJob(bookId, jobId, errorMessage);
                await updateMemoryBookStatus(bookId, 'error');
            } catch (error) {
                console.error('Failed to update Firebase:', error);
            }
        }

        // Keep saved data on error so user can retry
        setModalState('error');
    }, [bookId, jobId]);

    const handleRetry = useCallback(() => {
        setJobId(null);
        setBookId(null);
        setGenerationError(null);
        setPreBackendStep(null);
        setModalState('wizard');
    }, []);

    const handleOpenViewer = useCallback(() => {
        onClose();
    }, [onClose]);

    const handleBackToDashboard = useCallback(() => {
        onClose();
    }, [onClose]);

    // Handle close - always allow closing
    const handleClose = useCallback(() => {
        if (stopPolling) stopPolling();
        setModalState('wizard');
        setJobId(null);
        setBookId(null);
        setGenerationError(null);
        setPreBackendStep(null);
        setResult(null);
        setErrors({});
        onClose();
    }, [onClose, stopPolling]);

    const currentStepInfo = WIZARD_STEPS.find((s) => s.number === currentStep);

    if (!isOpen) return null;

    // Get title for non-wizard states
    const getHeaderTitle = () => {
        switch (modalState) {
            case 'generating':
                return wz?.creatingBook || 'Creating Your Memory Book';
            case 'success':
                return wz?.bookReady || 'Success!';
            case 'error':
                return wz?.somethingWentWrong || 'Something Went Wrong';
            default:
                return currentStepInfo?.title || '';
        }
    };

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Restore Draft Dialog */}
            <AnimatePresence>
                {showRestoreDialog && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 flex items-center justify-center z-[60] p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-primary-teal/10 flex items-center justify-center">
                                    <RotateCcw className="w-6 h-6 text-primary-teal" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">{wz?.draftTitle || 'Continue where you left off?'}</h3>
                                    <p className="text-sm text-gray-500">{wz?.draftSubtitle || 'We found a saved draft'}</p>
                                </div>
                            </div>
                            
                            <p className="text-gray-600 mb-6">
                                {wz?.draftMessage || 'You have an unfinished Memory Book. Would you like to continue editing it or start fresh?'}
                            </p>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={handleStartFresh}
                                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    {wz?.startFresh || 'Start Fresh'}
                                </button>
                                <button
                                    onClick={handleRestoreData}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-teal to-teal-400 text-white font-medium hover:from-teal-500 hover:to-teal-400 transition-all"
                                >
                                    {wz?.continueDraft || 'Continue Draft'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-4 md:inset-6 lg:inset-y-8 lg:inset-x-auto lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-5xl z-50 flex"
            >
                <div className="w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
                    {/* Sidebar (Desktop) - Only show in wizard state */}
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
                        {/* Header - Always show with close button */}
                        {modalState === 'wizard' ? (
                            <>
                                <StepperTopBar
                                    currentStep={currentStep}
                                    completedSteps={completedSteps}
                                    onStepClick={goToStep}
                                    onClose={handleClose}
                                    savedStatus={savedStatus}
                                />

                                {/* Desktop Header */}
                                <div className="hidden lg:flex items-center justify-between p-6 border-b border-black/5">
                                    <div>
                                        <h2 className="text-xl font-bold text-text-main">
                                            {currentStepInfo?.title}
                                        </h2>
                                        <p className="text-sm text-text-muted">
                                            {currentStepInfo?.description}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="p-2 hover:bg-black/5 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-text-muted" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* Header for non-wizard states */
                            <div className="flex items-center justify-between p-4 lg:p-6 border-b border-black/5">
                                <h2 className="text-lg lg:text-xl font-bold text-gray-800">
                                    {getHeaderTitle()}
                                </h2>
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-black/5 rounded-lg transition-colors"
                                    title={wz?.cancel || 'Fechar'}
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                        )}

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="max-w-3xl mx-auto p-6 lg:p-8">
                                {(modalState === 'generating' || modalState === 'error') && (
                                    <GenerateLoadingScreen
                                        status={jobStatus}
                                        error={generationError}
                                        onComplete={() => {}}
                                        onRetry={handleRetry}
                                        preBackendStep={preBackendStep}
                                    />
                                )}

                                {modalState === 'success' && (
                                    <SuccessScreen
                                        bookTitle={data.bookSetup.title}
                                        onOpenViewer={handleOpenViewer}
                                        onBackToDashboard={handleBackToDashboard}
                                    />
                                )}

                                {modalState === 'wizard' && !showRestoreDialog && (
                                    <>
                                        {currentStep === 1 && (
                                            <BookSetupStep
                                                data={data.bookSetup}
                                                onChange={updateBookSetup}
                                                errors={errors}
                                            />
                                        )}
                                        {currentStep === 2 && (
                                            <MemoriesStep
                                                data={data.memories}
                                                onChange={updateMemories}
                                            />
                                        )}
                                        {currentStep === 3 && (
                                            <ReviewStep
                                                data={data}
                                                onEditSection={goToStep}
                                                onSettingsChange={updateGenerationSettings}
                                                completedSteps={completedSteps}
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions - Only in wizard state */}
                        {modalState === 'wizard' && !showRestoreDialog && (
                            <div className="p-4 lg:p-6 border-t border-black/5 bg-bg-soft">
                                <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                                    {/* Left Actions */}
                                    <div className="flex items-center gap-3">
                                        {currentStep > 1 && (
                                            <button
                                                onClick={goBack}
                                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-text-main font-medium hover:bg-black/5 transition-colors"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                                {wz?.back || 'Back'}
                                            </button>
                                        )}
                                        {currentStep === 1 && (
                                            <button
                                                onClick={handleClose}
                                                className="px-4 py-2.5 rounded-xl border-2 border-gray-200 text-text-main font-medium hover:bg-black/5 transition-colors"
                                            >
                                                {wz?.cancel || 'Cancel'}
                                            </button>
                                        )}
                                    </div>

                                    {/* Right Actions */}
                                    <div className="flex items-center gap-3">
                                        {currentStep < 3 ? (
                                            <button
                                                onClick={goNext}
                                                disabled={currentStep === 1 && !canGoNext()}
                                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all ${
                                                    currentStep === 1 && !canGoNext()
                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-primary-teal to-teal-400 hover:from-teal-500 hover:to-teal-400 text-white shadow-lg shadow-primary-teal/20'
                                                }`}
                                            >
                                                {wz?.next || 'Next'}
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleGenerate}
                                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-teal to-teal-400 hover:from-teal-500 hover:to-teal-400 text-white font-semibold transition-all shadow-lg shadow-primary-teal/20 hover:shadow-xl hover:shadow-primary-teal/30"
                                            >
                                                <Sparkles className="w-5 h-5" />
                                                {wz?.generateBook || 'Generate Memory Book'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

        </>
    );
};
