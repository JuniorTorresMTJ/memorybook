/**
 * PdfDownloadModal — Animated modal showing PDF generation progress
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, FileText, Check, AlertCircle, Loader2, BookOpen } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export interface PdfModalState {
    isOpen: boolean;
    bookTitle: string;
    /** 0 – 100 */
    percent: number;
    currentStep: string;
    status: 'preparing' | 'loading_images' | 'building_pdf' | 'done' | 'error';
    errorMessage?: string;
}

interface Props {
    state: PdfModalState;
    onClose: () => void;
}

const STEPS = [
    { key: 'preparing', icon: BookOpen },
    { key: 'loading_images', icon: Download },
    { key: 'building_pdf', icon: FileText },
    { key: 'done', icon: Check },
] as const;

export function PdfDownloadModal({ state, onClose }: Props) {
    const { t } = useLanguage();
    const db = t.dashboard;

    const stepLabels: Record<string, string> = {
        preparing: db?.generatingPdf || 'Preparando...',
        loading_images: 'Carregando imagens...',
        building_pdf: 'Montando PDF...',
        done: db?.pdfReady || 'PDF Gerado!',
        error: 'Erro ao gerar PDF',
    };

    const stepIndex = STEPS.findIndex(s => s.key === state.status);

    return (
        <AnimatePresence>
            {state.isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm"
                        onClick={state.status === 'done' || state.status === 'error' ? onClose : undefined}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 40 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="pointer-events-auto w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="relative bg-gradient-to-r from-primary-teal to-teal-400 px-6 py-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-lg">
                                                {state.status === 'done' ? (db?.pdfReady || 'PDF Pronto!') : (db?.generatingPdf || 'Gerando PDF...')}
                                            </h3>
                                            <p className="text-white/70 text-xs truncate max-w-[240px]">
                                                {state.bookTitle}
                                            </p>
                                        </div>
                                    </div>
                                    {(state.status === 'done' || state.status === 'error') && (
                                        <button
                                            onClick={onClose}
                                            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                                        >
                                            <X className="w-4 h-4 text-white" />
                                        </button>
                                    )}
                                </div>

                                {/* Animated shimmer on header */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    style={{ width: '50%' }}
                                />
                            </div>

                            {/* Body */}
                            <div className="px-6 py-6">
                                {/* Progress Bar */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">
                                            {state.currentStep}
                                        </span>
                                        <span className="text-sm font-bold text-primary-teal">
                                            {Math.round(state.percent)}%
                                        </span>
                                    </div>
                                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full rounded-full ${
                                                state.status === 'error'
                                                    ? 'bg-red-400'
                                                    : state.status === 'done'
                                                    ? 'bg-gradient-to-r from-primary-teal to-emerald-400'
                                                    : 'bg-gradient-to-r from-primary-teal to-teal-400'
                                            }`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${state.percent}%` }}
                                            transition={{ duration: 0.5, ease: 'easeOut' }}
                                        />
                                    </div>
                                </div>

                                {/* Steps */}
                                <div className="space-y-3">
                                    {STEPS.map((step, idx) => {
                                        const isCompleted = idx < stepIndex || state.status === 'done';
                                        const isActive = idx === stepIndex && state.status !== 'done' && state.status !== 'error';
                                        const isFailed = state.status === 'error' && idx === stepIndex;

                                        const StepIcon = step.icon;

                                        return (
                                            <motion.div
                                                key={step.key}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                                    isCompleted
                                                        ? 'bg-gradient-to-r from-primary-teal/10 to-emerald-50 border border-primary-teal/20'
                                                        : isActive
                                                        ? 'bg-gradient-to-r from-teal-50 to-cyan-50 border border-primary-teal/30 shadow-sm'
                                                        : isFailed
                                                        ? 'bg-red-50 border border-red-200'
                                                        : 'bg-gray-50 border border-gray-100'
                                                }`}
                                            >
                                                {/* Icon */}
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                    isCompleted
                                                        ? 'bg-primary-teal text-white'
                                                        : isActive
                                                        ? 'bg-gradient-to-br from-primary-teal to-teal-400 text-white'
                                                        : isFailed
                                                        ? 'bg-red-400 text-white'
                                                        : 'bg-gray-200 text-gray-400'
                                                }`}>
                                                    {isCompleted ? (
                                                        <Check className="w-4 h-4" />
                                                    ) : isActive ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : isFailed ? (
                                                        <AlertCircle className="w-4 h-4" />
                                                    ) : (
                                                        <StepIcon className="w-4 h-4" />
                                                    )}
                                                </div>

                                                {/* Label */}
                                                <div className="flex-1 min-w-0">
                                                    <span className={`text-sm font-medium ${
                                                        isCompleted ? 'text-primary-teal' :
                                                        isActive ? 'text-gray-800' :
                                                        isFailed ? 'text-red-600' :
                                                        'text-gray-400'
                                                    }`}>
                                                        {stepLabels[step.key]}
                                                    </span>
                                                </div>

                                                {/* Status indicator */}
                                                {isActive && (
                                                    <motion.div
                                                        className="w-2 h-2 rounded-full bg-primary-teal"
                                                        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                                                        transition={{ duration: 1.2, repeat: Infinity }}
                                                    />
                                                )}
                                                {isCompleted && (
                                                    <span className="text-xs text-primary-teal/60 font-medium">
                                                        ✓
                                                    </span>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Error message */}
                                {state.status === 'error' && state.errorMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl"
                                    >
                                        <p className="text-sm text-red-600">{state.errorMessage}</p>
                                    </motion.div>
                                )}

                                {/* Success message */}
                                {state.status === 'done' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 p-4 bg-gradient-to-r from-primary-teal/5 to-emerald-50 border border-primary-teal/20 rounded-xl text-center"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.2 }}
                                            className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-teal to-emerald-400 flex items-center justify-center mx-auto mb-3"
                                        >
                                            <Check className="w-6 h-6 text-white" />
                                        </motion.div>
                                        <p className="text-sm font-semibold text-gray-800 mb-1">
                                            {db?.pdfReady || 'PDF Gerado com Sucesso!'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {db?.pdfDownloaded || 'O arquivo foi baixado automaticamente.'}
                                        </p>
                                    </motion.div>
                                )}
                            </div>

                            {/* Footer */}
                            {(state.status === 'done' || state.status === 'error') && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="px-6 pb-6"
                                >
                                    <button
                                        onClick={onClose}
                                        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                                            state.status === 'done'
                                                ? 'bg-gradient-to-r from-primary-teal to-teal-400 text-white hover:shadow-lg'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {state.status === 'done' ? 'Fechar' : 'Tentar novamente'}
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
