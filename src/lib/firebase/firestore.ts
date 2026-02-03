import {
    collection,
    doc,
    addDoc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp,
    type DocumentReference,
    type QueryConstraint,
} from 'firebase/firestore';
import { db } from './config';
import type {
    MemoryBookDocument,
    MemoryBookInput,
    MemoryBookUpdate,
    SectionDocument,
    SectionInput,
    SectionId,
    ImageDocument,
    ImageInput,
    PageDocument,
    PageInput,
    GenerationJobDocument,
    GenerationJobInputSnapshot,
    BookStatus,
} from './types';

// ============================================
// MEMORY BOOKS CRUD
// ============================================

/**
 * Create a new Memory Book
 */
export const createMemoryBook = async (
    userId: string,
    data: MemoryBookInput
): Promise<string> => {
    const memoryBooksRef = collection(db, 'memoryBooks');
    
    const bookData = {
        ownerId: userId,
        title: data.title,
        subtitle: data.subtitle || null,
        bookDate: data.bookDate ? Timestamp.fromDate(data.bookDate) : serverTimestamp(),
        pageCount: data.pageCount,
        imageStyle: data.imageStyle,
        tone: data.tone || null,
        readingLevel: data.readingLevel || null,
        status: 'draft' as BookStatus,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(memoryBooksRef, bookData);
    return docRef.id;
};

/**
 * Get a single Memory Book by ID
 */
export const getMemoryBook = async (
    bookId: string
): Promise<MemoryBookDocument | null> => {
    const bookRef = doc(db, 'memoryBooks', bookId);
    const bookDoc = await getDoc(bookRef);
    
    if (bookDoc.exists()) {
        return { id: bookDoc.id, ...bookDoc.data() } as MemoryBookDocument;
    }
    
    return null;
};

/**
 * Get all Memory Books for a user
 */
export const getUserMemoryBooks = async (
    userId: string,
    options?: {
        status?: BookStatus;
        limitCount?: number;
    }
): Promise<MemoryBookDocument[]> => {
    const memoryBooksRef = collection(db, 'memoryBooks');
    
    const constraints: QueryConstraint[] = [
        where('ownerId', '==', userId),
        orderBy('updatedAt', 'desc'),
    ];
    
    if (options?.status) {
        constraints.splice(1, 0, where('status', '==', options.status));
    }
    
    if (options?.limitCount) {
        constraints.push(limit(options.limitCount));
    }
    
    const q = query(memoryBooksRef, ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as MemoryBookDocument));
};

/**
 * Update a Memory Book
 */
export const updateMemoryBook = async (
    bookId: string,
    data: MemoryBookUpdate
): Promise<void> => {
    const bookRef = doc(db, 'memoryBooks', bookId);
    
    const updateData: Record<string, unknown> = {
        ...data,
        updatedAt: serverTimestamp(),
    };
    
    if (data.bookDate) {
        updateData.bookDate = Timestamp.fromDate(data.bookDate);
    }
    
    await updateDoc(bookRef, updateData);
};

/**
 * Update Memory Book status
 */
export const updateMemoryBookStatus = async (
    bookId: string,
    status: BookStatus
): Promise<void> => {
    const bookRef = doc(db, 'memoryBooks', bookId);
    await updateDoc(bookRef, {
        status,
        updatedAt: serverTimestamp(),
    });
};

/**
 * Delete a Memory Book
 */
export const deleteMemoryBook = async (bookId: string): Promise<void> => {
    // Note: In production, you should also delete subcollections and storage files
    const bookRef = doc(db, 'memoryBooks', bookId);
    await deleteDoc(bookRef);
};

// ============================================
// SECTIONS CRUD (Subcollection)
// ============================================

/**
 * Create or update a section
 */
export const upsertSection = async (
    bookId: string,
    sectionId: SectionId,
    data: SectionInput
): Promise<void> => {
    const sectionRef = doc(db, 'memoryBooks', bookId, 'sections', sectionId);
    
    await setDoc(sectionRef, {
        text: data.text,
        skipped: data.skipped ?? false,
        updatedAt: serverTimestamp(),
    }, { merge: true });
    
    // Update parent book's updatedAt
    await updateDoc(doc(db, 'memoryBooks', bookId), {
        updatedAt: serverTimestamp(),
    });
};

/**
 * Get a section by ID
 */
export const getSection = async (
    bookId: string,
    sectionId: SectionId
): Promise<SectionDocument | null> => {
    const sectionRef = doc(db, 'memoryBooks', bookId, 'sections', sectionId);
    const sectionDoc = await getDoc(sectionRef);
    
    if (sectionDoc.exists()) {
        return { id: sectionDoc.id as SectionId, ...sectionDoc.data() } as SectionDocument;
    }
    
    return null;
};

/**
 * Get all sections for a book
 */
export const getAllSections = async (
    bookId: string
): Promise<SectionDocument[]> => {
    const sectionsRef = collection(db, 'memoryBooks', bookId, 'sections');
    const snapshot = await getDocs(sectionsRef);
    
    return snapshot.docs.map(doc => ({
        id: doc.id as SectionId,
        ...doc.data()
    } as SectionDocument));
};

/**
 * Mark a section as skipped
 */
export const skipSection = async (
    bookId: string,
    sectionId: SectionId
): Promise<void> => {
    await upsertSection(bookId, sectionId, { text: '', skipped: true });
};

// ============================================
// IMAGES CRUD (Subcollection)
// ============================================

/**
 * Add an image reference to a book
 */
export const addImage = async (
    bookId: string,
    data: ImageInput
): Promise<string> => {
    const imagesRef = collection(db, 'memoryBooks', bookId, 'images');
    
    const imageData = {
        category: data.category,
        storagePath: data.storagePath,
        downloadUrl: data.downloadUrl || null,
        caption: data.caption || null,
        order: data.order ?? 0,
        createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(imagesRef, imageData);
    return docRef.id;
};

/**
 * Get all images for a book (optionally filtered by category)
 */
export const getImages = async (
    bookId: string,
    category?: ImageInput['category']
): Promise<ImageDocument[]> => {
    const imagesRef = collection(db, 'memoryBooks', bookId, 'images');
    
    const constraints: QueryConstraint[] = [];
    
    if (category) {
        constraints.push(where('category', '==', category));
    }
    
    constraints.push(orderBy('order', 'asc'));
    
    const q = query(imagesRef, ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as ImageDocument));
};

/**
 * Update an image document
 */
export const updateImage = async (
    bookId: string,
    imageId: string,
    data: Partial<ImageInput>
): Promise<void> => {
    const imageRef = doc(db, 'memoryBooks', bookId, 'images', imageId);
    await updateDoc(imageRef, data);
};

/**
 * Delete an image document
 */
export const deleteImage = async (
    bookId: string,
    imageId: string
): Promise<void> => {
    const imageRef = doc(db, 'memoryBooks', bookId, 'images', imageId);
    await deleteDoc(imageRef);
};

// ============================================
// PAGES CRUD (Subcollection)
// ============================================

/**
 * Create a page
 */
export const createPage = async (
    bookId: string,
    data: PageInput
): Promise<string> => {
    const pagesRef = collection(db, 'memoryBooks', bookId, 'pages');
    
    const pageData = {
        pageNumber: data.pageNumber,
        chapter: data.chapter,
        title: data.title,
        body: data.body,
        image: data.image || null,
        createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(pagesRef, pageData);
    return docRef.id;
};

/**
 * Get all pages for a book (ordered by page number)
 */
export const getPages = async (bookId: string): Promise<PageDocument[]> => {
    const pagesRef = collection(db, 'memoryBooks', bookId, 'pages');
    const q = query(pagesRef, orderBy('pageNumber', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as PageDocument));
};

/**
 * Update a page
 */
export const updatePage = async (
    bookId: string,
    pageId: string,
    data: Partial<PageInput>
): Promise<void> => {
    const pageRef = doc(db, 'memoryBooks', bookId, 'pages', pageId);
    await updateDoc(pageRef, data);
};

/**
 * Delete a page
 */
export const deletePage = async (
    bookId: string,
    pageId: string
): Promise<void> => {
    const pageRef = doc(db, 'memoryBooks', bookId, 'pages', pageId);
    await deleteDoc(pageRef);
};

/**
 * Bulk create pages (for after generation)
 */
export const createPages = async (
    bookId: string,
    pages: PageInput[]
): Promise<string[]> => {
    const pageIds: string[] = [];
    
    for (const page of pages) {
        const pageId = await createPage(bookId, page);
        pageIds.push(pageId);
    }
    
    return pageIds;
};

// ============================================
// GENERATION JOBS CRUD (Subcollection)
// ============================================

/**
 * Create a generation job
 */
export const createGenerationJob = async (
    bookId: string,
    inputSnapshot: GenerationJobInputSnapshot
): Promise<string> => {
    const jobsRef = collection(db, 'memoryBooks', bookId, 'generationJobs');
    
    const jobData = {
        startedAt: serverTimestamp(),
        inputSnapshot,
        finishedAt: null,
        errorMessage: null,
    };
    
    const docRef = await addDoc(jobsRef, jobData);
    return docRef.id;
};

/**
 * Complete a generation job (success)
 */
export const completeGenerationJob = async (
    bookId: string,
    jobId: string
): Promise<void> => {
    const jobRef = doc(db, 'memoryBooks', bookId, 'generationJobs', jobId);
    await updateDoc(jobRef, {
        finishedAt: serverTimestamp(),
    });
};

/**
 * Fail a generation job (error)
 */
export const failGenerationJob = async (
    bookId: string,
    jobId: string,
    errorMessage: string
): Promise<void> => {
    const jobRef = doc(db, 'memoryBooks', bookId, 'generationJobs', jobId);
    await updateDoc(jobRef, {
        finishedAt: serverTimestamp(),
        errorMessage,
    });
};

/**
 * Get generation jobs for a book
 */
export const getGenerationJobs = async (
    bookId: string
): Promise<GenerationJobDocument[]> => {
    const jobsRef = collection(db, 'memoryBooks', bookId, 'generationJobs');
    const q = query(jobsRef, orderBy('startedAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as GenerationJobDocument));
};
