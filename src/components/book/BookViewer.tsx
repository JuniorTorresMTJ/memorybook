/**
 * BookViewer - Hardcover Memory Book Viewer
 *
 * STATE MACHINE:
 *   closed_front  ->  open (spread 0..N)  ->  closed_back
 *        ^                                         |
 *        |_________ "Voltar ao início" ____________|
 *
 * SPREAD MAPPING: Each content page = 1 spread (image on one side, text on the other).
 *   - Spread 0 (even): left = IMAGE(page0),  right = TEXT(page0)
 *   - Spread 1 (odd):  left = TEXT(page1),    right = IMAGE(page1)
 *   - ...alternating
 *
 * PAGE FLIP: Key-change driven. When currentSpread changes, the new component
 *   mounts with initial rotateY based on flipDirection, then animates to 0.
 *   Forward: right half flips from -180 -> 0 (transform-origin: left)
 *   Backward: left half flips from 180 -> 0 (transform-origin: right)
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    X,
    Edit3,
    Download,
    Trash2,
    Heart,
    RotateCcw,
    BookOpen,
} from 'lucide-react';

import { BookShell } from './BookShell';
import { SpreadView } from './SpreadView';
import { PageImage } from './PageImage';
import { PageText } from './PageText';
import { useLanguage } from '../../contexts/LanguageContext';

// ── Types ────────────────────────────────────────────────────────────────────

export interface BookPage {
    id: string;
    imageUrl: string;
    title?: string;
    description?: string;
    date?: string;
}

interface BookViewerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    pages: BookPage[];
    onEdit?: () => void;
    onPrint?: () => void;
    onDelete?: () => void;
    onPageEdit?: (pageIndex: number) => void;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
}

type ViewerMode = 'closed_front' | 'open' | 'closed_back';

// ── Font constants ───────────────────────────────────────────────────────────

const FONT_TITLE = "'Playfair Display', serif";
const FONT_BODY = "'Lora', serif";

// ── Spread computation ───────────────────────────────────────────────────────

interface Spread {
    page: BookPage;
    leftType: 'image' | 'text';
    rightType: 'image' | 'text';
    spreadIndex: number;
}

function computeSpreads(contentPages: BookPage[]): Spread[] {
    return contentPages.map((page, i) => {
        const isEven = i % 2 === 0;
        return {
            page,
            leftType: isEven ? 'image' : 'text',
            rightType: isEven ? 'text' : 'image',
            spreadIndex: i,
        };
    });
}

// ── Component ────────────────────────────────────────────────────────────────

export const BookViewer = ({
    isOpen,
    onClose,
    title,
    pages,
    onEdit,
    onPrint,
    onDelete,
    isFavorite = false,
    onToggleFavorite,
}: BookViewerProps) => {
    const { t } = useLanguage();
    const bv = t.bookViewer;

    const [mode, setMode] = useState<ViewerMode>('closed_front');
    const [currentSpread, setCurrentSpread] = useState(0);
    const [flipDirection, setFlipDirection] = useState(0);

    // Decompose pages
    const cover = pages[0] ?? null;
    const backCover = pages.length > 1 ? pages[pages.length - 1] : null;
    const contentPages = useMemo(() => pages.length > 2 ? pages.slice(1, -1) : [], [pages]);
    const spreads = useMemo(() => computeSpreads(contentPages), [contentPages]);
    const totalSpreads = spreads.length;

    // Reset state when closing
    useEffect(() => {
        if (!isOpen) {
            setMode('closed_front');
            setCurrentSpread(0);
            setFlipDirection(0);
        }
    }, [isOpen]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); handleNext(); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrev(); }
            if (e.key === 'Escape') { e.preventDefault(); onClose(); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    });

    // ── Navigation (immediate state change, key-driven animation) ────────

    const handleOpen = useCallback(() => {
        setFlipDirection(1);
        setMode('open');
        setCurrentSpread(0);
    }, []);

    const handleNext = useCallback(() => {
        if (mode === 'closed_front') {
            handleOpen();
            return;
        }
        if (mode === 'open') {
            if (currentSpread < totalSpreads - 1) {
                setFlipDirection(1);
                setCurrentSpread(s => s + 1);
            } else {
                setFlipDirection(1);
                setMode('closed_back');
            }
        }
    }, [mode, currentSpread, totalSpreads, handleOpen]);

    const handlePrev = useCallback(() => {
        if (mode === 'closed_back') {
            setFlipDirection(-1);
            setMode('open');
            setCurrentSpread(totalSpreads - 1);
            return;
        }
        if (mode === 'open') {
            if (currentSpread > 0) {
                setFlipDirection(-1);
                setCurrentSpread(s => s - 1);
            } else {
                setFlipDirection(-1);
                setMode('closed_front');
            }
        }
    }, [mode, currentSpread, totalSpreads]);

    const handleReturnToStart = useCallback(() => {
        setFlipDirection(-1);
        setMode('closed_front');
        setCurrentSpread(0);
    }, []);

    // ── Early returns ────────────────────────────────────────────────────

    if (!isOpen) return null;

    if (!pages || pages.length === 0) {
        return (
            <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-coral/20 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-teal/20 blur-[120px] rounded-full -translate-x-1/3 translate-y-1/3" />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="fixed inset-4 lg:inset-8 z-50 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center justify-center"
                >
                    <div className="text-center p-8">
                        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-10 h-10 text-stone-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: FONT_TITLE }}>{title}</h3>
                        <p className="text-gray-500 mb-6" style={{ fontFamily: FONT_BODY }}>{bv?.emptyBookDesc || 'Este livro ainda está sendo gerado ou não possui páginas.'}</p>
                        <button onClick={onClose} className="px-6 py-3 bg-primary-teal text-white rounded-xl font-semibold hover:opacity-90 transition-all">
                            {bv?.back || 'Voltar'}
                        </button>
                    </div>
                </motion.div>
            </>
        );
    }

    // ── Spread rendering helpers ─────────────────────────────────────────

    const renderSpreadSide = (
        page: BookPage,
        type: 'image' | 'text',
        side: 'left' | 'right',
    ) => {
        if (type === 'image') {
            return <PageImage imageUrl={page.imageUrl} alt={page.title || 'Illustration'} />;
        }
        return (
            <PageText
                title={page.title}
                text={page.description}
                pairImageUrl={page.imageUrl}
                side={side}
                lifePhase={page.date}
                pageNumber={contentPages.indexOf(page) + 1}
            />
        );
    };

    // ── Animation config ─────────────────────────────────────────────────

    const coverTransition = {
        type: 'spring' as const,
        stiffness: 200,
        damping: 25,
    };

    const coverVariants = {
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.9, opacity: 0 },
    };

    // Page flip: flexible paper animation with keyframes
    const flipDuration = 0.8;
    const flipTimes = [0, 0.25, 0.5, 0.8, 1];
    const flipEase = [0.22, 1, 0.36, 1];

    // ── Progress info ────────────────────────────────────────────────────

    const progressText = mode === 'closed_front'
        ? (bv?.cover || 'Capa')
        : mode === 'closed_back'
            ? (bv?.backCover || 'Contracapa')
            : `${currentSpread + 1} / ${totalSpreads}`;

    const canGoPrev = mode !== 'closed_front';
    const canGoNext = mode !== 'closed_back';

    // ── Render ───────────────────────────────────────────────────────────

    return (
        <>
            {/* Backdrop with accent circles */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-coral/20 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-teal/20 blur-[120px] rounded-full -translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent-amber/15 blur-[100px] rounded-full -translate-y-1/2" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-teal/25 blur-[90px] rounded-full" />
                <div className="absolute top-1/3 left-2/3 w-64 h-64 bg-accent-coral/15 blur-[80px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-linear-to-tr from-primary-teal/10 via-accent-coral/10 to-transparent blur-3xl rounded-full" />
            </motion.div>

            {/* Main container */}
            <div className="fixed inset-0 z-50 flex flex-col pointer-events-none">
                {/* Header: only action buttons (right-aligned) */}
                <div className="pointer-events-auto flex items-center justify-end px-4 md:px-8 py-3 md:py-4 shrink-0">
                    <div className="flex items-center gap-1">
                        {onToggleFavorite && (
                            <button onClick={onToggleFavorite} className={`p-2 rounded-lg transition-all ${isFavorite ? 'text-red-400' : 'text-white/60 hover:text-red-400'}`} aria-label={bv?.favorite || 'Favoritar'}>
                                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                            </button>
                        )}
                        {onEdit && (
                            <button onClick={onEdit} className="p-2 rounded-lg text-white/60 hover:text-white transition-all" aria-label={bv?.editBook || 'Editar livro'}>
                                <Edit3 className="w-5 h-5" />
                            </button>
                        )}
                        {onPrint && (
                            <button onClick={onPrint} className="p-2 rounded-lg text-white/60 hover:text-white transition-all" aria-label={bv?.downloadPdf || 'Baixar PDF'}>
                                <Download className="w-5 h-5" />
                            </button>
                        )}
                        {onDelete && (
                            <button onClick={onDelete} className="p-2 rounded-lg text-white/60 hover:text-red-400 transition-all" aria-label={bv?.deleteBook || 'Excluir livro'}>
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                        <div className="w-px h-5 bg-white/20 mx-1" />
                        {/* Close button - accent coral */}
                        <button onClick={onClose} className="p-2.5 rounded-full bg-accent-coral/80 hover:bg-accent-coral text-white shadow-lg transition-all" aria-label={bv?.closeViewer || 'Fechar visualização'}>
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Centered title above the book */}
                <div className="pointer-events-none text-center shrink-0 pb-2">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg" style={{ fontFamily: FONT_TITLE }}>
                        {title}
                    </h2>
                    <span className="inline-block mt-1 px-3 py-0.5 bg-white/15 text-white/80 rounded-full text-xs font-medium backdrop-blur-sm" style={{ fontFamily: FONT_BODY }}>
                        {progressText}
                    </span>
                </div>

                {/* Book area - takes all remaining space, book centered */}
                <div className="flex-1 flex items-center justify-center px-4 md:px-16 pointer-events-auto relative" style={{ perspective: '1800px' }}>
                    {/* Prev button - primary teal */}
                    <button
                        onClick={handlePrev}
                        disabled={!canGoPrev}
                        className="absolute left-2 md:left-8 z-30 p-3 md:p-4 bg-primary-teal/80 hover:bg-primary-teal backdrop-blur-sm rounded-full text-white shadow-lg disabled:opacity-0 disabled:pointer-events-none transition-all"
                        aria-label={bv?.prevPage || 'Página anterior'}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Book container */}
                    <div
                        className="w-full max-w-5xl max-h-[70vh]"
                        style={{ aspectRatio: mode === 'open' ? '2 / 1.35' : '1 / 1.35' }}
                    >
                        <AnimatePresence mode="wait" custom={flipDirection}>
                            {/* ── CLOSED FRONT (Cover) ─────────────── */}
                            {mode === 'closed_front' && cover && (
                                <motion.div
                                    key="closed-front"
                                    variants={coverVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={coverTransition}
                                    className="w-full h-full flex justify-center cursor-pointer"
                                    onClick={handleOpen}
                                >
                                    <BookShell mode="closed" className="h-full" style={{ maxWidth: '50%' }}>
                                        <div className="relative w-full h-full">
                                            <img src={cover.imageUrl} alt={cover.title || title} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 flex flex-col justify-end p-6 md:p-8">
                                                <h3 className="text-xl md:text-3xl font-bold text-white drop-shadow-lg leading-tight" style={{ fontFamily: FONT_TITLE }}>{title}</h3>
                                                {cover.description && (
                                                    <p className="text-white/80 text-sm mt-2 line-clamp-2 italic" style={{ fontFamily: FONT_BODY }}>{cover.description}</p>
                                                )}
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                                                <div className="px-5 py-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg flex items-center gap-2">
                                                    <BookOpen className="w-5 h-5" />
                                                    <span className="font-semibold text-stone-700 text-sm">{bv?.openBook || 'Abrir Livro'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </BookShell>
                                </motion.div>
                            )}

                            {/* ── OPEN (Spreads) with page flip ────── */}
                            {mode === 'open' && spreads.length > 0 && (
                                <motion.div
                                    key="open-mode"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={coverTransition}
                                    className="w-full h-full relative"
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    <BookShell mode="open" className="w-full h-full">
                                        <SpreadView
                                            className="h-full relative z-10"
                                            leftContent={
                                                <div className="w-full h-full overflow-hidden" style={{ perspective: '1500px' }}>
                                                    <motion.div
                                                        key={`left-${currentSpread}`}
                                                        className="w-full h-full"
                                                        initial={flipDirection < 0
                                                            ? { rotateY: 180, scaleX: 0.9, skewY: 4, filter: 'drop-shadow(10px 0 15px rgba(0,0,0,0.3))' }
                                                            : { rotateY: 0, scaleX: 1, skewY: 0, filter: 'drop-shadow(0 0 0 rgba(0,0,0,0))' }
                                                        }
                                                        animate={{
                                                            rotateY: flipDirection < 0 ? [180, 130, 60, 15, 0] : 0,
                                                            scaleX: flipDirection < 0 ? [0.9, 0.88, 0.93, 0.98, 1] : 1,
                                                            skewY: flipDirection < 0 ? [4, -5, 3, -1.5, 0] : 0,
                                                            filter: flipDirection < 0
                                                                ? [
                                                                    'drop-shadow(10px 0 15px rgba(0,0,0,0.3))',
                                                                    'drop-shadow(8px 0 20px rgba(0,0,0,0.35))',
                                                                    'drop-shadow(5px 0 12px rgba(0,0,0,0.2))',
                                                                    'drop-shadow(2px 0 6px rgba(0,0,0,0.1))',
                                                                    'drop-shadow(0px 0 0px rgba(0,0,0,0))',
                                                                ]
                                                                : 'drop-shadow(0 0 0 rgba(0,0,0,0))',
                                                        }}
                                                        transition={{ duration: flipDuration, ease: flipEase, times: flipDirection < 0 ? flipTimes : undefined }}
                                                        style={{ transformOrigin: 'right center', transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                                                    >
                                                        {renderSpreadSide(
                                                            spreads[currentSpread].page,
                                                            spreads[currentSpread].leftType,
                                                            'left',
                                                        )}
                                                    </motion.div>
                                                </div>
                                            }
                                            rightContent={
                                                <div className="w-full h-full overflow-hidden" style={{ perspective: '1500px' }}>
                                                    <motion.div
                                                        key={`right-${currentSpread}`}
                                                        className="w-full h-full"
                                                        initial={flipDirection > 0
                                                            ? { rotateY: -180, scaleX: 0.9, skewY: -4, filter: 'drop-shadow(-10px 0 15px rgba(0,0,0,0.3))' }
                                                            : { rotateY: 0, scaleX: 1, skewY: 0, filter: 'drop-shadow(0 0 0 rgba(0,0,0,0))' }
                                                        }
                                                        animate={{
                                                            rotateY: flipDirection > 0 ? [-180, -130, -60, -15, 0] : 0,
                                                            scaleX: flipDirection > 0 ? [0.9, 0.88, 0.93, 0.98, 1] : 1,
                                                            skewY: flipDirection > 0 ? [-4, 5, -3, 1.5, 0] : 0,
                                                            filter: flipDirection > 0
                                                                ? [
                                                                    'drop-shadow(-10px 0 15px rgba(0,0,0,0.3))',
                                                                    'drop-shadow(-8px 0 20px rgba(0,0,0,0.35))',
                                                                    'drop-shadow(-5px 0 12px rgba(0,0,0,0.2))',
                                                                    'drop-shadow(-2px 0 6px rgba(0,0,0,0.1))',
                                                                    'drop-shadow(0px 0 0px rgba(0,0,0,0))',
                                                                ]
                                                                : 'drop-shadow(0 0 0 rgba(0,0,0,0))',
                                                        }}
                                                        transition={{ duration: flipDuration, ease: flipEase, times: flipDirection > 0 ? flipTimes : undefined }}
                                                        style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                                                    >
                                                        {renderSpreadSide(
                                                            spreads[currentSpread].page,
                                                            spreads[currentSpread].rightType,
                                                            'right',
                                                        )}
                                                    </motion.div>
                                                </div>
                                            }
                                        />
                                    </BookShell>
                                </motion.div>
                            )}

                            {/* ── CLOSED BACK (Back Cover) ─────────── */}
                            {mode === 'closed_back' && backCover && (
                                <motion.div
                                    key="closed-back"
                                    variants={coverVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={coverTransition}
                                    className="w-full h-full flex justify-center"
                                >
                                    <BookShell mode="closed" className="h-full" style={{ maxWidth: '50%' }}>
                                        <div className="relative w-full h-full">
                                            <img src={backCover.imageUrl} alt={bv?.backCover || 'Contracapa'} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex flex-col justify-end p-6 md:p-8">
                                                {backCover.description && (
                                                    <p className="text-white/90 text-sm md:text-base italic leading-relaxed" style={{ fontFamily: FONT_BODY }}>
                                                        {backCover.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </BookShell>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Next button - primary teal */}
                    <button
                        onClick={handleNext}
                        disabled={!canGoNext}
                        className="absolute right-2 md:right-8 z-30 p-3 md:p-4 bg-primary-teal/80 hover:bg-primary-teal backdrop-blur-sm rounded-full text-white shadow-lg disabled:opacity-0 disabled:pointer-events-none transition-all"
                        aria-label={bv?.nextPage || 'Próxima página'}
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Overlaid footer controls */}
                    <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex items-center justify-center gap-3 z-20">
                        {mode === 'closed_back' && (
                            <button
                                onClick={handleReturnToStart}
                                className="flex items-center gap-2 px-4 py-2 bg-accent-coral/90 hover:bg-accent-coral backdrop-blur-sm text-white rounded-xl shadow-lg transition-all text-sm font-medium"
                                aria-label={bv?.returnToStart || 'Voltar ao início'}
                            >
                                <RotateCcw className="w-4 h-4" />
                                {bv?.returnToStart || 'Voltar ao início'}
                            </button>
                        )}

                        {mode === 'open' && totalSpreads > 1 && (
                            <div className="flex items-center gap-1.5">
                                {spreads.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setFlipDirection(i > currentSpread ? 1 : -1);
                                            setCurrentSpread(i);
                                        }}
                                        className={`w-2 h-2 rounded-full transition-all ${
                                            i === currentSpread
                                                ? 'bg-white scale-125'
                                                : 'bg-white/30 hover:bg-white/60'
                                        }`}
                                        aria-label={`${bv?.goToSpread || 'Ir para'} ${i + 1}`}
                                    />
                                ))}
                            </div>
                        )}

                        {mode === 'closed_front' && (
                            <button
                                onClick={handleOpen}
                                className="flex items-center gap-2 px-5 py-2.5 bg-primary-teal hover:bg-primary-teal/90 text-white rounded-xl shadow-lg transition-all text-sm font-medium"
                                aria-label={bv?.openBook || 'Abrir livro'}
                            >
                                <BookOpen className="w-4 h-4" />
                                {bv?.openBook || 'Abrir Livro'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
