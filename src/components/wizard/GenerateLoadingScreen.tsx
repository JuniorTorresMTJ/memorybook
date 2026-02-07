import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Check, 
    AlertCircle, 
    RefreshCw,
    Loader2,
    BookOpen,
    Circle,
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

// Friendly step name mapping
const STEP_LABELS: Record<string, Record<string, string>> = {
    pt: {
        planning: 'Planejando o livro',
        profiling: 'Criando perfil do personagem',
        generating_pages: 'Gerando páginas',
        reviewing: 'Revisando qualidade',
        assembling: 'Montando o livro final',
        saving_firebase: 'Salvando dados',
        calling_api: 'Enviando para geração',
        waiting_backend: 'Aguardando servidor',
    },
    en: {
        planning: 'Planning the book',
        profiling: 'Creating character profile',
        generating_pages: 'Generating pages',
        reviewing: 'Reviewing quality',
        assembling: 'Assembling final book',
        saving_firebase: 'Saving data',
        calling_api: 'Sending for generation',
        waiting_backend: 'Waiting for server',
    },
};

function getStepLabel(stepName: string, lang: string): string {
    const labels = STEP_LABELS[lang] || STEP_LABELS.en;
    return labels[stepName] || stepName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export const GenerateLoadingScreen = ({ 
    status, 
    error, 
    onComplete, 
    onRetry,
    preBackendStep = null,
}: GenerateLoadingScreenProps) => {
    const { t, language } = useLanguage();
    const wz = t.wizard;
    const hasCompletedRef = useRef(false);

    // Rotating motivational message index
    const [msgIndex, setMsgIndex] = useState(0);

    const MOTIVATIONAL_MSGS = useMemo(() => [
        wz?.loadingMsg1 || 'Every memory is precious...',
        wz?.loadingMsg2 || 'Creating something beautiful...',
        wz?.loadingMsg3 || 'Weaving stories together...',
        wz?.loadingMsg4 || 'Adding warmth to each page...',
        wz?.loadingMsg5 || 'Almost ready to share...',
    ], [wz]);

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

    // Simple progress: small initial value for pre-backend phase, then backend takes over
    const progress = backendProgress > 0 
        ? backendProgress 
        : preBackendStep === 'saving_firebase' ? 2
        : preBackendStep === 'calling_api' ? 5
        : preBackendStep === 'waiting_backend' ? 8
        : 0;

    // Build combined steps: pre-backend + backend steps
    const combinedSteps = useMemo(() => {
        const steps: { name: string; status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped' }[] = [];

        // Pre-backend steps
        const preSteps = ['saving_firebase', 'calling_api', 'waiting_backend'] as const;
        const preStepIndex = preBackendStep ? preSteps.indexOf(preBackendStep) : -1;

        if (!status || status.steps.length === 0) {
            // No backend steps yet — show pre-backend steps
            preSteps.forEach((step, i) => {
                let stepStatus: 'pending' | 'in_progress' | 'completed' = 'pending';
                if (i < preStepIndex) stepStatus = 'completed';
                else if (i === preStepIndex) stepStatus = 'in_progress';
                steps.push({ name: step, status: stepStatus });
            });
        } else {
            // Backend connected — mark pre-backend as completed, show backend steps
            preSteps.forEach((step) => {
                steps.push({ name: step, status: 'completed' });
            });
            status.steps.forEach((step: StepInfo) => {
                steps.push({ name: step.name, status: step.status });
            });
        }

        return steps;
    }, [status, preBackendStep]);

    // If there's an error, show error state
    if (hasError) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center p-6"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-4"
                >
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </motion.div>

                <h2 className="text-xl font-bold text-gray-800 text-center mb-1">
                    {wz?.generationFailed || 'Generation Failed'}
                </h2>

                <p className="text-gray-500 text-sm text-center mb-6 max-w-sm">
                    {error || status?.error || wz?.generationFailedMsg || 'Something went wrong while creating your Memory Book. Please try again.'}
                </p>

                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-teal to-teal-400 hover:from-teal-500 hover:to-teal-400 text-white font-semibold transition-all shadow-lg shadow-primary-teal/20"
                >
                    <RefreshCw className="w-4 h-4" />
                    {wz?.tryAgain || 'Try Again'}
                </button>

                <p className="text-xs text-gray-400 mt-4 text-center max-w-sm">
                    {wz?.persistMsg || 'If the problem persists, please try again later or contact support.'}
                </p>
            </motion.div>
        );
    }

    // Main compact loading UI
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center p-4 md:p-6"
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
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-teal to-teal-400 flex items-center justify-center mb-3 shadow-lg shadow-primary-teal/20"
            >
                <BookOpen className="w-7 h-7 text-white" />
            </motion.div>

            {/* Title */}
            <h2 className="text-lg font-bold text-gray-800 text-center mb-0.5">
                {wz?.creatingBook || 'Creating Your Memory Book'}
            </h2>

            {/* Rotating Motivational Message */}
            <AnimatePresence mode="wait">
                <motion.p
                    key={msgIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="text-gray-500 text-xs text-center mb-4 italic"
                >
                    {MOTIVATIONAL_MSGS[msgIndex]}
                </motion.p>
            </AnimatePresence>

            {/* Progress Bar */}
            <div className="w-full max-w-md mb-5">
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary-teal to-teal-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>{Math.round(progress)}%</span>
                    <span>
                        {status?.status === 'processing' ? (wz?.inProgressLabel || 'Processing...')
                            : status?.status === 'completed' ? (wz?.percentComplete || 'Complete!')
                            : (wz?.startingProcessing || 'Preparing...')}
                    </span>
                </div>
            </div>

            {/* Process Steps */}
            <div className="w-full max-w-md mb-5">
                <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                    {language === 'pt' ? 'Etapas do Processo' : 'Process Steps'}
                </h4>
                <div className="space-y-1">
                    {combinedSteps.map((step, idx) => {
                        const isCompleted = step.status === 'completed';
                        const isActive = step.status === 'in_progress';
                        const isFailed = step.status === 'failed';

                        return (
                            <motion.div
                                key={step.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                                    isCompleted
                                        ? 'bg-gradient-to-r from-primary-teal/10 to-teal-400/10'
                                        : isActive
                                        ? 'bg-gradient-to-r from-accent-coral/10 to-amber-400/10'
                                        : isFailed
                                        ? 'bg-red-50'
                                        : 'bg-gray-50'
                                }`}
                            >
                                {/* Step Icon */}
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                                    isCompleted
                                        ? 'bg-gradient-to-br from-primary-teal to-teal-400 shadow-sm shadow-primary-teal/30'
                                        : isActive
                                        ? 'bg-gradient-to-br from-accent-coral to-amber-400 shadow-sm shadow-accent-coral/30'
                                        : isFailed
                                        ? 'bg-red-500'
                                        : 'bg-gray-200'
                                }`}>
                                    {isCompleted ? (
                                        <Check className="w-3.5 h-3.5 text-white" />
                                    ) : isActive ? (
                                        <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                                    ) : isFailed ? (
                                        <AlertCircle className="w-3 h-3 text-white" />
                                    ) : (
                                        <Circle className="w-3 h-3 text-gray-400" />
                                    )}
                                </div>

                                {/* Step Label */}
                                <span className={`text-sm font-medium flex-1 ${
                                    isCompleted
                                        ? 'text-primary-teal'
                                        : isActive
                                        ? 'text-accent-coral font-semibold'
                                        : isFailed
                                        ? 'text-red-600'
                                        : 'text-gray-400'
                                }`}>
                                    {getStepLabel(step.name, language)}
                                </span>

                                {/* Status indicator */}
                                {isActive && (
                                    <motion.div
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="text-xs text-accent-coral font-medium"
                                    >
                                        {language === 'pt' ? 'em andamento' : 'in progress'}
                                    </motion.div>
                                )}
                                {isCompleted && (
                                    <span className="text-xs text-primary-teal font-medium">✓</span>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Page Generation Progress (Book Pages grid) */}
            {status?.pages && status.pages.length > 0 && (
                <div className="w-full max-w-md">
                    <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">{wz?.bookPagesLabel || 'Book Pages'}</h4>
                    <div className="flex flex-wrap gap-1.5">
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
                                    transition={{ delay: idx * 0.04 }}
                                    className={`w-9 h-11 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                                        isPageCompleted
                                            ? 'bg-gradient-to-br from-primary-teal to-teal-400 text-white shadow-sm shadow-primary-teal/30'
                                            : isGenerating
                                            ? 'bg-gradient-to-br from-accent-coral to-amber-400 text-white animate-pulse shadow-sm shadow-accent-coral/30'
                                            : isPageFailed
                                            ? 'bg-red-500 text-white'
                                            : 'bg-gray-200 text-gray-500'
                                    }`}
                                    title={`${page.page_type} - ${page.status}${page.retry_count > 0 ? ` (${page.retry_count} retries)` : ''}`}
                                >
                                    {isPageCompleted ? <Check className="w-3.5 h-3.5" /> : isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : getLabel()}
                                </motion.div>
                            );
                        })}
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
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
                transition={{ delay: 0.3 }}
                className="mt-4 flex items-center gap-2 text-xs text-gray-400"
            >
                <motion.div
                    className={`w-1.5 h-1.5 rounded-full ${status ? 'bg-primary-teal' : 'bg-amber-400'}`}
                    animate={{ scale: [1, 1.3, 1] }}
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
