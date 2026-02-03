import type { Timestamp } from 'firebase/firestore';

// ============================================
// ENUMS / LITERAL TYPES
// ============================================

export type PageCount = 10 | 15 | 20;

export type ImageStyle = 'coloring' | 'cartoon' | 'anime' | 'watercolor';

export type BookTone = 'warm_simple' | 'joyful' | 'calm_reflective';

export type ReadingLevel = 'very_simple' | 'standard';

export type BookStatus = 'draft' | 'generating' | 'ready' | 'error';

export type ImageCategory = 'profile_reference' | 'childhood' | 'teen' | 'adult' | 'laterLife';

export type SectionId = 'childhood' | 'teen' | 'adult' | 'laterLife';

// ============================================
// USER DOCUMENT
// ============================================

export interface UserDocument {
    displayName: string;
    email: string;
    createdAt: Timestamp;
    lastLoginAt: Timestamp;
    photoURL?: string;
}

export interface UserDocumentInput {
    displayName: string;
    email: string;
    photoURL?: string;
}

// ============================================
// MEMORY BOOK DOCUMENT
// ============================================

export interface MemoryBookDocument {
    id?: string; // Added client-side after fetch
    ownerId: string;
    title: string;
    subtitle?: string;
    bookDate: Timestamp;
    pageCount: PageCount;
    imageStyle: ImageStyle;
    tone?: BookTone;
    readingLevel?: ReadingLevel;
    status: BookStatus;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface MemoryBookInput {
    title: string;
    subtitle?: string;
    bookDate?: Date;
    pageCount: PageCount;
    imageStyle: ImageStyle;
    tone?: BookTone;
    readingLevel?: ReadingLevel;
}

export interface MemoryBookUpdate {
    title?: string;
    subtitle?: string;
    bookDate?: Date;
    pageCount?: PageCount;
    imageStyle?: ImageStyle;
    tone?: BookTone;
    readingLevel?: ReadingLevel;
    status?: BookStatus;
}

// ============================================
// SECTION DOCUMENT (Subcollection)
// ============================================

export interface SectionDocument {
    id?: SectionId;
    text: string;
    skipped: boolean;
    updatedAt: Timestamp;
}

export interface SectionInput {
    text: string;
    skipped?: boolean;
}

// ============================================
// IMAGE DOCUMENT (Subcollection)
// ============================================

export interface ImageDocument {
    id?: string;
    category: ImageCategory;
    storagePath: string;
    downloadUrl?: string;
    caption?: string;
    order?: number;
    createdAt: Timestamp;
}

export interface ImageInput {
    category: ImageCategory;
    storagePath: string;
    downloadUrl?: string;
    caption?: string;
    order?: number;
}

// ============================================
// PAGE DOCUMENT (Subcollection)
// ============================================

export interface PageImage {
    storagePath: string;
    downloadUrl?: string;
}

export interface PageDocument {
    id?: string;
    pageNumber: number;
    chapter: string;
    title: string;
    body: string;
    image?: PageImage;
    createdAt: Timestamp;
}

export interface PageInput {
    pageNumber: number;
    chapter: string;
    title: string;
    body: string;
    image?: PageImage;
}

// ============================================
// GENERATION JOB DOCUMENT (Subcollection)
// ============================================

export interface GenerationJobInputSnapshot {
    pageCount: PageCount;
    imageStyle: ImageStyle;
    tone?: BookTone;
    readingLevel?: ReadingLevel;
    sectionsCount: number;
    imagesCount: number;
}

export interface GenerationJobDocument {
    id?: string;
    startedAt: Timestamp;
    finishedAt?: Timestamp;
    inputSnapshot: GenerationJobInputSnapshot;
    errorMessage?: string;
}

// ============================================
// STORAGE PATHS HELPER
// ============================================

export const getStoragePaths = (userId: string, bookId: string) => ({
    profileReferences: (filename: string) =>
        `users/${userId}/books/${bookId}/profile-references/${filename}`,
    sectionReferences: (section: SectionId, filename: string) =>
        `users/${userId}/books/${bookId}/section-references/${section}/${filename}`,
    generatedPages: (pageNumber: number, filename: string) =>
        `users/${userId}/books/${bookId}/generated-pages/${pageNumber}/${filename}`,
});

// ============================================
// COLLECTION PATHS HELPER
// ============================================

export const getCollectionPaths = (bookId?: string) => ({
    users: 'users',
    memoryBooks: 'memoryBooks',
    sections: bookId ? `memoryBooks/${bookId}/sections` : null,
    images: bookId ? `memoryBooks/${bookId}/images` : null,
    pages: bookId ? `memoryBooks/${bookId}/pages` : null,
    generationJobs: bookId ? `memoryBooks/${bookId}/generationJobs` : null,
});
