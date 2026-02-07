// Firebase configuration and instances
export { app, auth, db, storage } from './config';

// Authentication functions
export {
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signInAnonymousUser,
    ensureAuthenticated,
    signOut,
    resetPassword,
    getCurrentUser,
    onAuthChange,
    getUserDocument,
    updateUserProfile,
} from './auth';

// Firestore functions
export {
    // Memory Books
    createMemoryBook,
    getMemoryBook,
    getUserMemoryBooks,
    updateMemoryBook,
    updateMemoryBookStatus,
    deleteMemoryBook,
    // Sections
    upsertSection,
    getSection,
    getAllSections,
    skipSection,
    // Images
    addImage,
    getImages,
    updateImage,
    deleteImage,
    // Pages
    createPage,
    getPages,
    updatePage,
    deletePage,
    createPages,
    // Generation Jobs
    createGenerationJob,
    completeGenerationJob,
    failGenerationJob,
    getGenerationJobs,
    getPersistedImages,
} from './firestore';

// Storage functions
export {
    uploadProfileReference,
    uploadSectionReference,
    uploadGeneratedPage,
    uploadProfileReferences,
    uploadSectionReferences,
    deleteFile,
    deleteFolder,
    deleteBookFiles,
    deleteGeneratedImages,
    getFileUrl,
    getFileUrls,
    downloadBookImages,
    type UploadResult,
} from './storage';

// Types
export type {
    PageCount,
    ImageStyle,
    BookTone,
    ReadingLevel,
    BookStatus,
    ImageCategory,
    SectionId,
    UserDocument,
    UserDocumentInput,
    MemoryBookDocument,
    MemoryBookInput,
    MemoryBookUpdate,
    SectionDocument,
    SectionInput,
    ImageDocument,
    ImageInput,
    PageDocument,
    PageInput,
    PageImage,
    GenerationJobDocument,
    GenerationJobInputSnapshot,
} from './types';

export { getStoragePaths, getCollectionPaths } from './types';
