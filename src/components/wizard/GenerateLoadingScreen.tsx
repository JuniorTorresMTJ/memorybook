import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Check, 
    Sparkles, 
    Palette, 
    Heart, 
    AlertCircle, 
    RefreshCw,
    Eye,
    FileText,
    Image,
    Loader2,
    Upload,
    Camera,
    BookOpen,
    Save,
    Wifi,
    PenTool
} from 'lucide-react';
import type { JobStatusResponse, StepInfo, PageInfo } from '../../lib/api';
import { useLanguage } from '../../contexts/LanguageContext';

// Pre-backend phases shown before the job status polling starts
export type PreBackendStep = 'saving_firebase' | 'calling_api' | 'waiting_backend' | null;

interface GenerateLoadingScreenProps {
    status: JobStatusResponse | null;
    error: string | null;
    onComplete: () => void;
    onRetry: () => void;
    preBackendStep?: PreBackendStep;
}

// Client-side step definition for the animated progress
interface ClientStep {
    id: string;
    icon: React.ReactNode;
    labelKey: string;
    fallbackLabel: string;
    durationMs: number; // auto-advance duration, 0 = wait for backend
}

export const GenerateLoadingScreen = ({ 
    status, 
    error, 
    onComplete, 
    onRetry,
    preBackendStep = null,
}: GenerateLoadingScreenProps) => {
    const { t } = useLanguage();
    const wz = t.wizard;
    const hasCompletedRef = useRef(false);

    // Client-side animated steps (always shown)
    const CLIENT_STEPS: ClientStep[] = useMemo(() => [
        { id: 'saving', icon: <Save className="w-5 h-5" />, labelKey: 'savingMemories', fallbackLabel: 'Saving your memories...', durationMs: 2000 },
        { id: 'connecting', icon: <Wifi className="w-5 h-5" />, labelKey: 'connectingServer', fallbackLabel: 'Connecting to server...', durationMs: 3000 },
        { id: 'organizing', icon: <FileText className="w-5 h-5" />, labelKey: 'organizingMemories', fallbackLabel: 'Organizing memories...', durationMs: 0 },
        { id: 'planning', icon: <PenTool className="w-5 h-5" />, labelKey: 'creatingChapters', fallbackLabel: 'Creating chapters...', durationMs: 0 },
        { id: 'illustrating', icon: <Palette className="w-5 h-5" />, labelKey: 'generatingIllustrations', fallbackLabel: 'Generating illustrations...', durationMs: 0 },
        { id: 'finalizing', icon: <Heart className="w-5 h-5" />, labelKey: 'finalTouches', fallbackLabel: 'Final touches...', durationMs: 0 },
    ], []);

    // Current client step index
    const [activeClientStep, setActiveClientStep] = useState(0);
    // Rotating motivational message index
    const [msgIndex, setMsgIndex] = useState(0);

    const MOTIVATIONAL_MSGS = useMemo(() => [
        wz?.loadingMsg1 || 'Every memory is precious...',
        wz?.loadingMsg2 || 'Creating something beautiful...',
        wz?.loadingMsg3 || 'Weaving stories together...',
        wz?.loadingMsg4 || 'Adding warmth to each page...',
        wz?.loadingMsg5 || 'Almost ready to share...',
    ], [wz]);

    // Map backend step names to client step indices for synchronization
    const BACKEND_TO_CLIENT: Record<string, number> = useMemo(() => ({
        upload: 2,
        normalization: 2,
        planning: 3,
        visual_analysis: 2,
        cover_creation: 4,
        back_cover_creation: 4,
        prompt_creation: 4,
        prompt_review: 3,
        image_generation: 4,
        illustration_review: 5,
        design_review: 5,
        validation: 5,
        finalization: 5,
    }), []);

    // Map backend step names to display labels
    const STEP_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = useMemo(() => ({
        upload: { label: wz?.organizingMemories || 'Uploading reference photos', icon: <Upload className="w-5 h-5" /> },
        normalization: { label: wz?.organizingMemories || 'Normalizing form data', icon: <FileText className="w-5 h-5" /> },
        planning: { label: wz?.creatingChapters || 'Planning book narrative', icon: <Sparkles className="w-5 h-5" /> },
        visual_analysis: { label: wz?.organizingMemories || 'Analyzing visual characteristics', icon: <Eye className="w-5 h-5" /> },
        cover_creation: { label: wz?.generatingIllustrations || 'Creating cover concept', icon: <Camera className="w-5 h-5" /> },
        back_cover_creation: { label: wz?.generatingIllustrations || 'Creating back cover concept', icon: <Camera className="w-5 h-5" /> },
        prompt_creation: { label: wz?.generatingIllustrations || 'Creating illustration prompts', icon: <Palette className="w-5 h-5" /> },
        prompt_review: { label: wz?.creatingChapters || 'Reviewing prompts', icon: <Eye className="w-5 h-5" /> },
        image_generation: { label: wz?.generatingIllustrations || 'Generating images', icon: <Image className="w-5 h-5" /> },
        illustration_review: { label: wz?.finalTouches || 'Reviewing illustrations', icon: <Sparkles className="w-5 h-5" /> },
        design_review: { label: wz?.finalTouches || 'Final design review', icon: <Eye className="w-5 h-5" /> },
        validation: { label: wz?.finalTouches || 'Quality validation', icon: <Check className="w-5 h-5" /> },
        finalization: { label: wz?.finalTouches || 'Finalizing book', icon: <Heart className="w-5 h-5" /> },
    }), [wz]);

    // Auto-advance client steps that have a fixed duration
    useEffect(() => {
        const step = CLIENT_STEPS[activeClientStep];
        if (!step || step.durationMs === 0) return;

        const timer = setTimeout(() => {
            setActiveClientStep(prev => Math.min(prev + 1, CLIENT_STEPS.length - 1));
        }, step.durationMs);

        return () => clearTimeout(timer);
    }, [activeClientStep, CLIENT_STEPS]);

    // Sync with pre-backend step
    useEffect(() => {
        if (preBackendStep === 'saving_firebase') {
            setActiveClientStep(0);
        } else if (preBackendStep === 'calling_api') {
            setActiveClientStep(prev => Math.max(prev, 1));
        } else if (preBackendStep === 'waiting_backend') {
            setActiveClientStep(prev => Math.max(prev, 2));
        }
    }, [preBackendStep]);

    // Sync with backend status when it arrives
    useEffect(() => {
        if (status?.current_step) {
            const clientIdx = BACKEND_TO_CLIENT[status.current_step];
            if (clientIdx !== undefined) {
                setActiveClientStep(prev => Math.max(prev, clientIdx));
            }
        }
    }, [status?.current_step, BACKEND_TO_CLIENT]);

    // Rotate motivational messages
    useEffect(() => {
        const interval = setInterval(() => {
            setMsgIndex(prev => (prev + 1) % MOTIVATIONAL_MSGS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [MOTIVATIONAL_MSGS.length]);

    // Check for completion
    useEffect(() => {
        if (status?.status === 'completed' && !hasCompletedRef.current) {
            hasCompletedRef.current = true;
            onComplete();
        }
    }, [status, onComplete]);

    const hasError = error || status?.status === 'failed';
    const backendProgress = status?.progress_percent ?? 0;

    // Calculate a combined progress: client steps contribute up to 15%, then backend takes over
    const clientProgress = Math.min((activeClientStep / CLIENT_STEPS.length) * 15, 15);
    const combinedProgress = backendProgress > 0 
        ? Math.max(backendProgress, clientProgress) 
        : clientProgress;

    // If there's an error, show error state
    if (hasError) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[400px] p-8"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 rounded-3xl bg-red-100 flex items-center justify-center mb-8"
                >
                    <AlertCircle className="w-12 h-12 text-red-500" />
                </motion.div>

                <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
                    {wz?.generationFailed || 'Generation Failed'}
                </h2>

                <p className="text-gray-500 text-center mb-8 max-w-md">
                    {error || status?.error || wz?.generationFailedMsg || 'Something went wrong while creating your Memory Book. Please try again.'}
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={onRetry}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-teal to-teal-400 hover:from-teal-500 hover:to-teal-400 text-white font-semibold transition-all shadow-lg shadow-primary-teal/20"
                    >
                        <RefreshCw className="w-5 h-5" />
                        {wz?.tryAgain || 'Try Again'}
                    </button>
                </div>

                <p className="text-sm text-gray-400 mt-6 text-center max-w-md">
                    {wz?.persistMsg || 'If the problem persists, please try again later or contact support.'}
                </p>
            </motion.div>
        );
    }

    // Main loading UI (always shows animated steps)
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
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
                {wz?.creatingBook || 'Creating Your Memory Book'}
            </h2>

            {/* Rotating Motivational Message */}
            <AnimatePresence mode="wait">
                <motion.p
                    key={msgIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-gray-500 text-center mb-8 italic"
                >
                    {MOTIVATIONAL_MSGS[msgIndex]}
                </motion.p>
            </AnimatePresence>

            {/* Progress Bar */}
            <div className="w-full max-w-md mb-8">
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary-teal to-teal-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(combinedProgress, 100)}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <span>{Math.round(combinedProgress)}% {wz?.percentComplete || 'complete'}</span>
                    <span>
                        {status?.status === 'processing' ? (wz?.inProgressLabel || 'Processing...') : 
                         status?.status === 'queued' ? (wz?.startingProcessing || 'Queued...') : 
                         status?.status === 'completed' ? (wz?.percentComplete || 'Complete!') :
                         (wz?.startingProcessing || 'Preparing...')}
                    </span>
                </div>
            </div>

            {/* Client-side Animated Steps (always visible) */}
            <div className="w-full max-w-md space-y-2 mb-6">
                <AnimatePresence mode="popLayout">
                    {CLIENT_STEPS.map((step, index) => {
                        const isCompleted = index < activeClientStep;
                        const isCurrent = index === activeClientStep;
                        const isPending = index > activeClientStep;
                        const label = (wz as Record<string, string>)?.[step.labelKey] || step.fallbackLabel;

                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.08 }}
                                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                                    isCurrent
                                        ? 'bg-primary-teal/10'
                                        : isCompleted
                                        ? 'bg-green-50'
                                        : 'bg-gray-50 opacity-50'
                                }`}
                            >
                                <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                        isCompleted
                                            ? 'bg-green-500 text-white'
                                            : isCurrent
                                            ? 'bg-primary-teal/20 text-primary-teal'
                                            : 'bg-gray-100 text-gray-400'
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
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        step.icon
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span
                                        className={`font-medium block truncate ${
                                            isCompleted
                                                ? 'text-green-700'
                                                : isCurrent
                                                ? 'text-primary-teal'
                                                : 'text-gray-400'
                                        }`}
                                    >
                                        {label}
                                    </span>
                                </div>
                                {isCurrent && (
                                    <motion.div
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        <span className="text-xs text-primary-teal whitespace-nowrap">{wz?.inProgressLabel || 'in progress'}</span>
                                    </motion.div>
                                )}
                                {isPending && (
                                    <span className="text-xs text-gray-300 whitespace-nowrap">{wz?.pendingLabel || 'pending'}</span>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Backend Steps Detail (shown when backend status arrives with steps) */}
            {status?.steps && status.steps.length > 0 && (
                <div className="w-full max-w-md mb-6">
                    <h4 className="text-sm font-medium text-gray-600 mb-3">{wz?.stepsProcess || 'Process Steps'}</h4>
                    <div className="space-y-1">
                        {status.steps.map((step: StepInfo, index: number) => {
                            const config = STEP_CONFIG[step.name];
                            const isStepCompleted = step.status === 'completed';
                            const isStepCurrent = step.status === 'in_progress';
                            const isStepFailed = step.status === 'failed';

                            return (
                                <motion.div
                                    key={step.name}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                                        isStepCurrent ? 'bg-primary-teal/5' : isStepCompleted ? 'bg-green-50/50' : isStepFailed ? 'bg-red-50/50' : 'opacity-40'
                                    }`}
                                >
                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                                        isStepCompleted ? 'bg-green-500 text-white' : isStepCurrent ? 'bg-primary-teal/20 text-primary-teal' : isStepFailed ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                        {isStepCompleted ? <Check className="w-3.5 h-3.5" /> : isStepCurrent ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isStepFailed ? <AlertCircle className="w-3.5 h-3.5" /> : <span className="text-[10px]">{index + 1}</span>}
                                    </div>
                                    <span className={`truncate ${isStepCompleted ? 'text-green-700' : isStepCurrent ? 'text-primary-teal font-medium' : isStepFailed ? 'text-red-700' : 'text-gray-400'}`}>
                                        {config?.label || step.name}
                                    </span>
                                    {step.error && <span className="text-xs text-red-500 truncate ml-auto">{step.error}</span>}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Page Generation Progress */}
            {status?.pages && status.pages.length > 0 && (
                <div className="w-full max-w-md">
                    <h4 className="text-sm font-medium text-gray-600 mb-3">{wz?.bookPagesLabel || 'Book Pages'}</h4>
                    <div className="flex flex-wrap gap-2">
                        {status.pages.map((page: PageInfo, idx: number) => {
                            const isPageCompleted = page.status === 'completed';
                            const isGenerating = page.status === 'generating';
                            const isPageFailed = page.status === 'failed';
                            
                            const getLabel = () => {
                                if (page.page_type === 'cover') return 'C';
                                if (page.page_type === 'back_cover') return 'B';
                                return page.page_number.toString();
                            };

                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`w-10 h-12 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                                        isPageCompleted
                                            ? 'bg-green-500 text-white'
                                            : isGenerating
                                            ? 'bg-primary-teal text-white animate-pulse'
                                            : isPageFailed
                                            ? 'bg-red-500 text-white'
                                            : 'bg-gray-200 text-gray-500'
                                    }`}
                                    title={`${page.page_type} - ${page.status}${page.retry_count > 0 ? ` (${page.retry_count} retries)` : ''}`}
                                >
                                    {getLabel()}
                                </motion.div>
                            );
                        })}
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500">
                        {(() => {
                            const completed = status.pages.filter(p => p.status === 'completed').length;
                            const total = status.pages.length;
                            const generating = status.pages.filter(p => p.status === 'generating').length;
                            
                            if (generating > 0) {
                                return `${wz?.generatingPage || 'Generating page'} ${completed + 1}/${total}...`;
                            }
                            return `${completed}/${total} ${wz?.pagesCompleted || 'pages completed'}`;
                        })()}
                    </div>
                </div>
            )}

            {/* Connection Status */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex items-center gap-2 text-xs text-gray-400"
            >
                <motion.div
                    className={`w-2 h-2 rounded-full ${status ? 'bg-green-500' : 'bg-amber-400'}`}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
                {status 
                    ? `${wz?.connectedServer || 'Connected to server • Job ID'}: ${status?.job_id?.slice(0, 8)}...`
                    : (wz?.waitingConnection || 'Establishing connection...')
                }
            </motion.div>
        </motion.div>
    );
};
