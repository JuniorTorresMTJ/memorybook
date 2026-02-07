import { useState, useEffect, useCallback } from 'react';
import { DashboardNavbar } from '../components/layout/DashboardNavbar';
import { DashboardFooter } from '../components/layout/DashboardFooter';
import { MemoryStoryCard } from '../components/ui/MemoryStoryCard';
import { SuccessNotification } from '../components/ui/SuccessNotification';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { PdfDownloadModal } from '../components/ui/PdfDownloadModal';
import type { PdfModalState } from '../components/ui/PdfDownloadModal';
import { CreateMemoryBookModal } from '../components/wizard';
import { BookViewer } from '../components/book';
import type { BookPage } from '../components/book';
import { Plus, Loader2, BookOpen, Search, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
    getUserMemoryBooks, 
    deleteMemoryBook,
    getGenerationJobs,
    getPersistedImages,
    completeGenerationJob,
} from '../lib/firebase/firestore';
import type { MemoryBookDocument } from '../lib/firebase/types';
import { getJobResult, getAssetUrl } from '../lib/api';
import type { FinalBookPackage, BookPage as APIBookPage } from '../lib/api';
import { downloadBookImages, deleteGeneratedImages } from '../lib/firebase/storage';
import { ADDITIONAL_SAMPLE_BOOKS, getAdditionalBookPages, getAdditionalBookDisplay } from '../data/sampleBooks';
import type { SampleBookConfig } from '../data/sampleBooks';

// Interface for display format
interface MemoryBookDisplay {
    id: string;
    title: string;
    date: string;
    description: string;
    imageUrl: string;
    pageImages: string[]; // Array of all page images for slideshow
    isFavorite: boolean;
    pageCount: number;
    status: string;
    pages: BookPage[];
    backendJobId?: string;
    imageStyle: string;
    isSample?: boolean;
}

// Generate a meaningful title from narrative text
function generateTitleFromNarrative(narrative: string | undefined): string | null {
    if (!narrative || narrative.trim() === '') return null;
    
    // Try to extract a title from the first sentence (up to ~50 chars)
    const firstSentence = narrative.split(/[.!?]/)[0]?.trim();
    if (firstSentence && firstSentence.length > 0) {
        // If the first sentence is too long, truncate it
        if (firstSentence.length > 50) {
            const words = firstSentence.split(' ');
            let title = '';
            for (const word of words) {
                if ((title + ' ' + word).length > 47) break;
                title += (title ? ' ' : '') + word;
            }
            return title + '...';
        }
        return firstSentence;
    }
    return null;
}

// Convert backend BookPage to viewer BookPage
// imageOverride: optional data URL from persisted images
function convertAPIPageToViewerPage(page: APIBookPage, jobId: string, imageOverride?: string): BookPage {
    // Check if image was actually generated
    let imageUrl = '';
    
    // Priority: 1) persisted image override, 2) embedded image_data from backend, 
    // 3) data URL in image_path, 4) backend asset URL
    if (imageOverride) {
        imageUrl = imageOverride;
    } else if (page.image_data) {
        // Use base64 data URL embedded by backend in the result
        imageUrl = page.image_data;
    } else if (page.image_path && page.image_path.trim() !== '') {
        // If image_path is already a full URL or data URL, use directly
        if (page.image_path.startsWith('http') || page.image_path.startsWith('data:')) {
            imageUrl = page.image_path;
        } else {
            // Extract filename from image_path (handle both Windows and Unix paths)
            const pathParts = page.image_path.replace(/\\/g, '/').split('/');
            const filename = pathParts.pop() || page.image_path;
            imageUrl = getAssetUrl(jobId, 'outputs', filename);
        }
    }
    
    // Generate meaningful title based on content
    let title: string;
    if (page.page_type === 'cover') {
        title = 'Capa';
    } else if (page.page_type === 'back_cover') {
        title = 'Contracapa';
    } else {
        // Try to get a meaningful title from narrative or memory reference
        const narrativeTitle = generateTitleFromNarrative(page.narrative_text);
        const memoryTitle = page.memory_reference?.trim();
        
        // Use narrative title if available, otherwise memory reference, otherwise fallback
        title = narrativeTitle || memoryTitle || `Memória ${page.page_number}`;
    }
    
    return {
        id: `page-${page.page_number}`,
        imageUrl,
        title,
        description: page.narrative_text || page.memory_reference || '',
        date: page.life_phase,
    };
}

// Convert FinalBookPackage to viewer pages, optionally using persisted images
function convertBookPackageToPages(
    pkg: FinalBookPackage,
    jobId: string,
    persistedImages?: Map<string, string>
): BookPage[] {
    const pages: BookPage[] = [];
    
    // Add cover
    pages.push(convertAPIPageToViewerPage(pkg.cover, jobId, persistedImages?.get('cover')));
    
    // Add content pages
    for (let i = 0; i < pkg.pages.length; i++) {
        pages.push(convertAPIPageToViewerPage(pkg.pages[i], jobId, persistedImages?.get(`page_${i}`)));
    }
    
    // Add back cover
    pages.push(convertAPIPageToViewerPage(pkg.back_cover, jobId, persistedImages?.get('back_cover')));
    
    return pages;
}

// Placeholder images for different styles
const styleImages: Record<string, string> = {
    watercolor: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop',
    cartoon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop',
    anime: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=600&fit=crop',
    coloring: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=600&fit=crop',
};

// Generate placeholder pages for a book
function generatePlaceholderPages(pageCount: number, style: string, title: string): BookPage[] {
    const baseImage = styleImages[style] || styleImages.watercolor;
    const pages: BookPage[] = [];
    
    // Cover page
    pages.push({
        id: 'cover',
        imageUrl: baseImage,
        title: title,
        description: 'Capa do livro',
    });
    
    // Internal pages
    for (let i = 1; i < pageCount - 1; i++) {
        pages.push({
            id: `page-${i}`,
            imageUrl: `https://images.unsplash.com/photo-${1500000000000 + i * 1000}?w=800&h=600&fit=crop`,
            title: `Página ${i}`,
            description: 'Esta página será gerada com suas memórias',
        });
    }
    
    // Back cover
    if (pageCount > 1) {
        pages.push({
            id: 'back-cover',
            imageUrl: baseImage,
            title: 'Contracapa',
            description: 'Final do livro',
        });
    }
    
    return pages;
}

// Convert Firebase document to display format
function convertToDisplayFormat(doc: MemoryBookDocument, backendJobId?: string): MemoryBookDisplay {
    const date = doc.bookDate?.toDate?.() 
        ? doc.bookDate.toDate().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        : 'No date';

    // Generate placeholder pages (will be replaced with real pages when viewing)
    const pages = generatePlaceholderPages(doc.pageCount, doc.imageStyle, doc.title);

    return {
        id: doc.id || '',
        title: doc.title,
        date,
        description: doc.subtitle || `A ${doc.imageStyle} style memory book with ${doc.pageCount} pages`,
        imageUrl: styleImages[doc.imageStyle] || styleImages.watercolor,
        pageImages: [], // Will be populated with real images when available
        isFavorite: false,
        pageCount: doc.pageCount,
        status: doc.status,
        pages,
        backendJobId,
        imageStyle: doc.imageStyle,
    };
}

export const Dashboard = () => {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const db = t.dashboard;

    // 4 sample books (Firebase Storage)
    const sampleBooks: MemoryBookDisplay[] = ADDITIONAL_SAMPLE_BOOKS.map((book: SampleBookConfig) => {
        const display = getAdditionalBookDisplay(book, language);
        const pages = getAdditionalBookPages(book, language);
        return {
            id: display.id,
            title: display.title,
            date: display.date,
            description: display.description,
            imageUrl: display.imageUrl,
            pageImages: display.pageImages,
            isFavorite: true,
            pageCount: display.pageCount,
            status: 'completed',
            pages,
            imageStyle: display.imageStyle,
            isSample: true,
        };
    });
    const [showNotification, setShowNotification] = useState(false);
    const [notificationData, setNotificationData] = useState({ title: '', message: '' });
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isQuickTestOpen, setIsQuickTestOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<MemoryBookDisplay | null>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [bookPages, setBookPages] = useState<BookPage[]>([]);
    
    // Firebase state
    const [memoryBooks, setMemoryBooks] = useState<MemoryBookDisplay[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Delete confirmation state
    const [bookToDelete, setBookToDelete] = useState<MemoryBookDisplay | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Minimized generation state
    const [isGenerationMinimized, setIsGenerationMinimized] = useState(false);
    const [minimizedProgress, setMinimizedProgress] = useState(0);

    // Fetch books with their backend job IDs and real images
    const fetchBooksWithJobs = useCallback(async () => {
        if (!user) {
            setMemoryBooks([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const docs = await getUserMemoryBooks(user.uid);
            
            // Fetch generation jobs for each book to get backendJobId
            const displayBooks = await Promise.all(
                docs.map(async (doc) => {
                    let backendJobId: string | undefined;
                    let pageImages: string[] = [];
                    
                    try {
                        const jobs = await getGenerationJobs(doc.id || '');
                        if (jobs.length > 0 && jobs[0].inputSnapshot?.backendJobId) {
                            backendJobId = jobs[0].inputSnapshot.backendJobId;
                            
                            // Try to load real images for completed books
                            if (doc.status === 'completed' || doc.status === 'ready') {
                                // First try to load persisted images from Firestore subcollection
                                let persistedImages: Map<string, string> | undefined;
                                const jobDocId = jobs[0].id || backendJobId;
                                try {
                                    persistedImages = await getPersistedImages(doc.id || '', jobDocId);
                                    if (persistedImages.size > 0) {
                                        console.log(`Loaded ${persistedImages.size} persisted images for book:`, doc.id);
                                    }
                                } catch (piErr) {
                                    console.warn('Failed to load persisted images:', piErr);
                                }

                                try {
                                    const result = await getJobResult(backendJobId);
                                    
                                    // If backend is available and no persisted images, try downloading now
                                    if (!persistedImages || persistedImages.size === 0) {
                                        console.log('[Dashboard] No persisted images, attempting download from backend...');
                                        try {
                                            const downloaded = await downloadBookImages(
                                                result as unknown as Record<string, unknown>,
                                                (filename: string) => getAssetUrl(backendJobId!, 'outputs', filename),
                                            );
                                            if (downloaded.size > 0) {
                                                console.log(`[Dashboard] Downloaded ${downloaded.size} images, saving to Firestore...`);
                                                persistedImages = downloaded;
                                                // Save for future loads (fire and forget)
                                                completeGenerationJob(doc.id || '', jobDocId, undefined, downloaded)
                                                    .then(() => console.log('[Dashboard] Images persisted to Firestore'))
                                                    .catch(err => console.warn('[Dashboard] Failed to persist images:', err));
                                            }
                                        } catch (dlErr) {
                                            console.warn('[Dashboard] Failed to download images:', dlErr);
                                        }
                                    }
                                    
                                    const realPages = convertBookPackageToPages(result, backendJobId, persistedImages);
                                    pageImages = realPages
                                        .map(page => page.imageUrl)
                                        .filter(url => url && url.trim() !== '');
                                } catch (imgErr) {
                                    console.warn('Backend unavailable for book:', doc.id, imgErr);
                                    
                                    // Fallback: use resultSnapshot from Firestore + persisted images
                                    if (jobs[0].resultSnapshot) {
                                        try {
                                            const savedResult = jobs[0].resultSnapshot as unknown as FinalBookPackage;
                                            const savedPages = convertBookPackageToPages(savedResult, backendJobId, persistedImages);
                                            pageImages = savedPages
                                                .map(page => page.imageUrl)
                                                .filter(url => url && url.trim() !== '');
                                            console.log('Using cached result from Firestore for book:', doc.id);
                                        } catch (cacheErr) {
                                            console.warn('Failed to use cached result:', cacheErr);
                                        }
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        console.warn('Failed to get generation jobs for book:', doc.id, e);
                    }
                    
                    const displayBook = convertToDisplayFormat(doc, backendJobId);
                    
                    // Update with real images if available
                    if (pageImages.length > 0) {
                        displayBook.imageUrl = pageImages[0]; // Cover image
                        displayBook.pageImages = pageImages;
                    }
                    
                    return displayBook;
                })
            );
            
            setMemoryBooks(displayBooks);
        } catch (err) {
            console.error('Failed to fetch memory books:', err);
            setError('Failed to load memory books');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');

    // Filter function
    const filterBySearch = (book: MemoryBookDisplay) => {
        if (searchQuery.trim() === '') return true;
        const query = searchQuery.toLowerCase().trim();
        return (
            book.title.toLowerCase().includes(query) ||
            book.description.toLowerCase().includes(query) ||
            book.date.toLowerCase().includes(query)
        );
    };

    // Separate user books from sample books, both filtered
    const userBooksFiltered = memoryBooks.filter(filterBySearch);
    const sampleBooksFiltered = sampleBooks.filter(filterBySearch);
    const allBooks = [...userBooksFiltered, ...sampleBooksFiltered];

    // Fetch books from Firebase
    useEffect(() => {
        fetchBooksWithJobs();
    }, [fetchBooksWithJobs]);

    // Refresh books after creation
    const refreshBooks = useCallback(async () => {
        await fetchBooksWithJobs();
    }, [fetchBooksWithJobs]);

    // State for loading pages from backend (used to show loading indicator)
    const [, setIsLoadingPages] = useState(false);

    const handleOpenBook = useCallback(async (book: MemoryBookDisplay) => {
        setSelectedBook(book);
        
        // Sample book uses its own static pages
        if (book.isSample) {
            setBookPages(book.pages);
            setIsViewerOpen(true);
            return;
        }
        
        // If book has backendJobId and is completed, try to load real pages
        if (book.backendJobId && (book.status === 'completed' || book.status === 'ready')) {
            setIsLoadingPages(true);
            try {
                console.log('Loading pages from backend for job:', book.backendJobId);
                const result = await getJobResult(book.backendJobId);
                const realPages = convertBookPackageToPages(result, book.backendJobId);
                console.log('Loaded', realPages.length, 'pages from backend');
                setBookPages(realPages);
            } catch (err) {
                console.warn('Backend unavailable, trying Firestore cache:', err);
                
                // Fallback: try to load from Firestore resultSnapshot
                let loaded = false;
                try {
                    const jobs = await getGenerationJobs(book.id);
                    if (jobs.length > 0 && jobs[0].resultSnapshot) {
                        const savedResult = jobs[0].resultSnapshot as unknown as FinalBookPackage;
                        const savedPages = convertBookPackageToPages(savedResult, book.backendJobId!);
                        console.log('Loaded', savedPages.length, 'pages from Firestore cache');
                        setBookPages(savedPages);
                        loaded = true;
                    }
                } catch (cacheErr) {
                    console.warn('Failed to load from Firestore cache:', cacheErr);
                }
                
                if (!loaded) {
                    setBookPages(book.pages);
                }
            } finally {
                setIsLoadingPages(false);
            }
        } else {
            // Use placeholder pages
            setBookPages(book.pages);
        }
        
        setIsViewerOpen(true);
    }, []);


    // PDF generation state
    const [pdfModal, setPdfModal] = useState<PdfModalState>({
        isOpen: false,
        bookTitle: '',
        percent: 0,
        currentStep: '',
        status: 'preparing',
    });

    const closePdfModal = useCallback(() => {
        setPdfModal(prev => ({ ...prev, isOpen: false }));
    }, []);

    const handlePrintBook = async (book: MemoryBookDisplay) => {
        if (pdfModal.isOpen) return;

        // Open modal immediately
        setPdfModal({
            isOpen: true,
            bookTitle: book.title,
            percent: 0,
            currentStep: db?.generatingPdf || 'Preparando...',
            status: 'preparing',
        });

        try {
            const { downloadBookAsPdf } = await import('../lib/generatePdf');

            // Step 1: Preparing — determine best source of pages with images
            setPdfModal(prev => ({ ...prev, percent: 10, status: 'preparing', currentStep: 'Preparando páginas...' }));

            let pagesToPrint = book.pages;

            // Check if book.pages already has real images loaded (base64 data URLs or valid URLs)
            const hasLoadedImages = book.pages.length > 0 &&
                book.pages.some(p => p.imageUrl && (
                    p.imageUrl.startsWith('data:') ||
                    p.imageUrl.startsWith('https://firebasestorage.googleapis.com') ||
                    p.imageUrl.startsWith('https://storage.googleapis.com')
                ));

            if (hasLoadedImages) {
                // Pages already have images (from Firestore persistence or Firebase Storage URLs)
                console.log('[PDF] Using already-loaded pages with images:', book.pages.length);
                pagesToPrint = book.pages;
            } else if (book.backendJobId && (book.status === 'completed' || book.status === 'ready')) {
                // Fallback: try to fetch from backend
                console.log('[PDF] No loaded images, trying backend for:', book.backendJobId);
                try {
                    const result = await getJobResult(book.backendJobId);
                    const realPages = convertBookPackageToPages(result, book.backendJobId);
                    if (realPages.length > 0) pagesToPrint = realPages;
                } catch {
                    console.warn('[PDF] Backend unavailable, using cached pages for book:', book.id);
                }
            }

            console.log('[PDF] Pages to print:', pagesToPrint.length, 'Sample URL:', pagesToPrint[0]?.imageUrl?.substring(0, 80));

            setPdfModal(prev => ({ ...prev, percent: 20, status: 'loading_images', currentStep: 'Carregando imagens...' }));

            // Step 2-3: Generate PDF with progress
            await downloadBookAsPdf(book.title, pagesToPrint, (progress) => {
                const basePercent = 20;
                const remaining = 75;
                const stepPercent = basePercent + (progress.current / progress.total) * remaining;

                const newStatus = progress.current < progress.total * 0.3
                    ? 'loading_images' as const
                    : 'building_pdf' as const;

                setPdfModal(prev => ({
                    ...prev,
                    percent: Math.min(stepPercent, 95),
                    currentStep: progress.label,
                    status: newStatus,
                }));
            });

            // Done!
            setPdfModal(prev => ({
                ...prev,
                percent: 100,
                currentStep: db?.pdfReady || 'PDF Gerado!',
                status: 'done',
            }));

        } catch (err) {
            console.error('[PDF] Failed to generate PDF:', err);
            setPdfModal(prev => ({
                ...prev,
                status: 'error',
                currentStep: 'Erro ao gerar PDF',
                errorMessage: 'Não foi possível gerar o PDF. Tente novamente.',
            }));
        }
    };

    const handleDeleteBook = (book: MemoryBookDisplay) => {
        setBookToDelete(book);
    };

    const confirmDeleteBook = async () => {
        if (!bookToDelete) return;
        
        setIsDeleting(true);
        try {
            // deleteMemoryBook now returns backendJobIds for Storage cleanup
            const backendJobIds = await deleteMemoryBook(bookToDelete.id);
            // Clean up generated images from Firebase Storage
            if (backendJobIds.length > 0) {
                deleteGeneratedImages(backendJobIds).catch(err =>
                    console.warn('Failed to clean Storage images:', err)
                );
            }
            setMemoryBooks(prev => prev.filter(b => b.id !== bookToDelete.id));
            setNotificationData({ 
                title: db?.bookDeleted || 'Memory Book excluído', 
                message: `"${bookToDelete.title}" ${db?.removedPermanently || 'foi removido permanentemente.'}` 
            });
            setShowNotification(true);
            setBookToDelete(null);
        } catch (err) {
            console.error('Failed to delete book:', err);
            setNotificationData({
                title: db?.deleteError || 'Erro ao excluir',
                message: db?.deleteErrorMsg || 'Não foi possível excluir o livro. Tente novamente.'
            });
            setShowNotification(true);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleFavorite = async (bookId: string) => {
        const book = memoryBooks.find(b => b.id === bookId);
        if (!book) return;

        const newFavorite = !book.isFavorite;
        
        // Optimistic update
        setMemoryBooks(prev => prev.map(b => 
            b.id === bookId ? { ...b, isFavorite: newFavorite } : b
        ));

        // Note: isFavorite is not stored in Firebase yet, only local state
    };


    const userName = user?.displayName || 'Guest';
    const userEmail = user?.email || 'guest@guest.com';

    return (
        <div className="min-h-screen bg-bg-soft flex flex-col">
            <DashboardNavbar 
                userName={userName} 
                userEmail={userEmail} 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
                {/* Success Notification */}
                <SuccessNotification
                    isVisible={showNotification}
                    title={notificationData.title}
                    message={notificationData.message}
                    onClose={() => setShowNotification(false)}
                />

                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-text-main mb-2">
                        {db?.title || 'Our Family Album'}
                    </h1>
                    <p className="text-text-muted text-lg">
                        {db?.description || 'A gentle collection of your favorite moments and stories.'}
                    </p>
                </div>

                {/* My Books Section */}
                <section>
                    <h2 className="text-2xl font-bold text-text-main mb-6">{db?.myMemoryBooks || 'My Memory Books'}</h2>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="w-10 h-10 text-primary-teal animate-spin mb-4" />
                            <p className="text-text-muted">{db?.loading || 'Loading your memory books...'}</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                            <p className="text-red-600">{error}</p>
                            <button 
                                onClick={refreshBooks}
                                className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                                {db?.tryAgain || 'Try Again'}
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && !error && memoryBooks.length === 0 && (
                        <div className="bg-gray-50 rounded-2xl p-8 text-center mb-6">
                            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-7 h-7 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">
                                {db?.createFirst || 'Crie seu primeiro Memory Book'}
                            </h3>
                            <p className="text-gray-500 mb-4 max-w-md mx-auto text-sm">
                                {db?.createFirstDesc || 'Veja os exemplos abaixo para inspiração e depois crie o seu!'}
                            </p>
                            <div className="flex items-center gap-3 justify-center flex-wrap">
                                <button 
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-teal to-teal-400 text-white rounded-xl font-semibold hover:from-teal-500 hover:to-teal-400 transition-all shadow-lg shadow-primary-teal/20"
                                >
                                    <Plus className="w-5 h-5" />
                                    {db?.createMemoryBook || 'Criar Memory Book'}
                                </button>
                                <button 
                                    onClick={() => setIsQuickTestOpen(true)}
                                    className="inline-flex items-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-amber-500/20 text-sm"
                                    title="Gera um livro mock com dados pré-preenchidos para teste rápido"
                                >
                                    <Zap className="w-4 h-4" />
                                    Teste Rápido
                                </button>
                            </div>
                        </div>
                    )}

                    {/* No search results */}
                    {!isLoading && !error && searchQuery.trim() !== '' && allBooks.length === 0 && (
                        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-8 text-center mb-6">
                            <div className="w-14 h-14 bg-gray-100 dark:bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Search className="w-7 h-7 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                                {db?.noResults || 'Nenhum resultado encontrado'}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                {db?.noResultsDesc || 'Tente buscar com outras palavras.'}
                            </p>
                        </div>
                    )}

                    {/* User Books Grid */}
                    {!isLoading && !error && userBooksFiltered.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {userBooksFiltered.map((book, index) => (
                                <motion.div
                                    key={book.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className="relative"
                                >
                                    <MemoryStoryCard
                                        id={book.id}
                                        title={book.title}
                                        date={book.date}
                                        description={book.description}
                                        imageUrl={book.imageUrl}
                                        pageImages={book.pageImages}
                                        isFavorite={book.isFavorite}
                                        pageCount={book.pageCount}
                                        onClick={() => handleOpenBook(book)}
                                        onPrint={() => handlePrintBook(book)}
                                        onDelete={() => handleDeleteBook(book)}
                                        onToggleFavorite={() => handleToggleFavorite(book.id)}
                                    />
                                    {/* Status Badge */}
                                    {book.status !== 'completed' && book.status !== 'ready' && (
                                        <div className={`mt-2 text-center text-sm font-medium px-3 py-1 rounded-full ${
                                            book.status === 'generating' 
                                                ? 'bg-yellow-100 text-yellow-700' 
                                                : book.status === 'error'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {book.status === 'generating' ? (db?.generating || 'Generating...') :
                                             book.status === 'error' ? (db?.generationFailed || 'Generation Failed') :
                                             book.status === 'draft' ? (db?.draft || 'Draft') : book.status}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </section>

                {/* Examples Section - separate from user books */}
                <section className="mt-12">
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-2xl font-bold text-text-main">{db?.example || 'Exemplos'}</h2>
                        <span className="px-3 py-1 bg-accent-coral/10 text-accent-coral text-xs font-bold rounded-full">
                            {sampleBooks.length}
                        </span>
                    </div>
                    <p className="text-text-muted text-sm mb-6">
                        Explore livros de memórias de exemplo para se inspirar antes de criar o seu.
                    </p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
                    >
                        {sampleBooksFiltered.map((book, index) => (
                            <motion.div
                                key={book.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.08 }}
                                className="relative"
                            >
                                <div className="absolute -top-2 -right-2 z-30 px-2.5 py-0.5 bg-accent-coral text-white text-xs font-bold rounded-full shadow-lg">
                                    {db?.example || 'Exemplo'}
                                </div>
                                <MemoryStoryCard
                                    id={book.id}
                                    title={book.title}
                                    date={book.date}
                                    description={book.description}
                                    imageUrl={book.imageUrl}
                                    pageImages={book.pageImages}
                                    isFavorite={book.isFavorite}
                                    pageCount={book.pageCount}
                                    onPrint={() => handlePrintBook(book)}
                                    onClick={() => handleOpenBook(book)}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* Create New Book CTA - Only show if there are books */}
                {!isLoading && memoryBooks.length > 0 && (
                    <section className="mt-16 mb-8">
                        <div className="bg-gradient-to-br from-primary-teal/5 to-accent-coral/5 rounded-3xl border border-primary-teal/20 p-8 md:p-12 text-center">
                            <div className="max-w-xl mx-auto">
                                <div className="w-16 h-16 bg-primary-teal/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <BookOpen className="w-8 h-8 text-primary-teal" />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold text-text-main mb-3">
                                    {db?.createNewBook || 'Create New Memory Book'}
                                </h3>
                                <p className="text-text-muted mb-8">
                                    {db?.createNewBookDesc || 'Start a new collection of precious moments. Perfect for special occasions, family milestones, or everyday treasures.'}
                                </p>
                                <div className="flex items-center gap-3 justify-center flex-wrap">
                                    <button 
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#00E5E5] to-[#FF9E91] text-white rounded-xl font-semibold hover:from-[#00d4d4] hover:to-[#ff8f80] transition-all shadow-lg shadow-primary-teal/20 hover:shadow-xl hover:shadow-primary-teal/30"
                                    >
                                        <Plus className="w-5 h-5" />
                                        {db?.createNewBook || 'Create New Memory Book'}
                                    </button>
                                    <button 
                                        onClick={() => setIsQuickTestOpen(true)}
                                        className="inline-flex items-center gap-2 px-5 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-amber-500/20 text-sm"
                                        title="Gera um livro mock com dados pré-preenchidos para teste rápido"
                                    >
                                        <Zap className="w-4 h-4" />
                                        Teste Rápido
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <DashboardFooter />

            {/* Create Memory Book Modal */}
            <CreateMemoryBookModal
                isOpen={isCreateModalOpen || isGenerationMinimized}
                isMinimized={isGenerationMinimized}
                onMinimize={() => {
                    setIsGenerationMinimized(true);
                    setIsCreateModalOpen(false);
                }}
                onProgressUpdate={(p) => setMinimizedProgress(p)}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setIsGenerationMinimized(false);
                }}
                onComplete={() => {
                    // Refresh books list when wizard completes
                    refreshBooks();
                }}
                onSuccess={(bookTitle) => {
                    // Show success notification when book is generated
                    setNotificationData({ 
                        title: db?.bookGenerated || 'Memory Book Gerado!', 
                        message: `${db?.bookGeneratedMsg || 'Seu Memory Book foi criado com sucesso!'} "${bookTitle}"` 
                    });
                    setShowNotification(true);
                    setIsGenerationMinimized(false);
                    // Refresh books list
                    refreshBooks();
                }}
            />

            {/* Quick Test Modal */}
            <CreateMemoryBookModal
                isOpen={isQuickTestOpen}
                onClose={() => setIsQuickTestOpen(false)}
                quickTest={true}
                onComplete={() => {
                    refreshBooks();
                }}
                onSuccess={(bookTitle) => {
                    setNotificationData({ 
                        title: 'Teste concluído!', 
                        message: `Livro de teste gerado: "${bookTitle}"` 
                    });
                    setShowNotification(true);
                    refreshBooks();
                }}
            />

            {/* Book Viewer */}
            {selectedBook && (
                <BookViewer
                    isOpen={isViewerOpen}
                    onClose={() => {
                        setIsViewerOpen(false);
                        setSelectedBook(null);
                    }}
                    title={selectedBook.title}
                    pages={selectedBook.isSample ? selectedBook.pages : bookPages}
                    isFavorite={selectedBook.isSample ? true : (memoryBooks.find(b => b.id === selectedBook.id)?.isFavorite ?? false)}
                    onToggleFavorite={selectedBook.isSample ? undefined : () => handleToggleFavorite(selectedBook.id)}
                    onPrint={() => handlePrintBook(selectedBook)}
                    onDelete={selectedBook.isSample ? undefined : () => {
                        handleDeleteBook(selectedBook);
                        setIsViewerOpen(false);
                        setSelectedBook(null);
                    }}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={!!bookToDelete}
                onClose={() => setBookToDelete(null)}
                onConfirm={confirmDeleteBook}
                title={db?.deleteModalTitle || "Excluir Memory Book"}
                bookTitle={bookToDelete?.title || ''}
                isDeleting={isDeleting}
            />

            {/* PDF Download Modal */}
            <PdfDownloadModal state={pdfModal} onClose={closePdfModal} />

            {/* Floating Generation Widget (shown when modal is minimized) */}
            {isGenerationMinimized && (
                <motion.button
                    initial={{ opacity: 0, y: 40, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.8 }}
                    onClick={() => {
                        setIsGenerationMinimized(false);
                        setIsCreateModalOpen(true);
                    }}
                    className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white rounded-2xl shadow-2xl border border-gray-200 px-4 py-3 hover:shadow-xl transition-shadow cursor-pointer"
                >
                    <div className="relative">
                        <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-teal to-teal-400 flex items-center justify-center"
                        >
                            <BookOpen className="w-5 h-5 text-white" />
                        </motion.div>
                        <motion.div
                            className="absolute -top-1 -right-1 w-3 h-3 bg-primary-teal rounded-full"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-semibold text-gray-800">
                            {db?.generating || 'Gerando livro...'}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-primary-teal to-teal-400 rounded-full"
                                    animate={{ width: `${Math.min(minimizedProgress, 100)}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                            <span className="text-xs text-gray-500 font-medium min-w-[32px]">{Math.round(minimizedProgress)}%</span>
                        </div>
                    </div>
                </motion.button>
            )}
        </div>
    );
};
