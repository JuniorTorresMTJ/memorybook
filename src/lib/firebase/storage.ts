import {
    ref,
    uploadBytes,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
    listAll,
    type UploadTaskSnapshot,
} from 'firebase/storage';
import { storage } from './config';
import { getStoragePaths, type SectionId, type ImageCategory } from './types';

// ============================================
// UPLOAD FUNCTIONS
// ============================================

/**
 * Upload a profile reference image
 */
export const uploadProfileReference = async (
    userId: string,
    bookId: string,
    file: File,
    onProgress?: (progress: number) => void
): Promise<{ storagePath: string; downloadUrl: string }> => {
    const paths = getStoragePaths(userId, bookId);
    const filename = `${Date.now()}_${file.name}`;
    const storagePath = paths.profileReferences(filename);
    
    return uploadFile(storagePath, file, onProgress);
};

/**
 * Upload a section reference image
 */
export const uploadSectionReference = async (
    userId: string,
    bookId: string,
    section: SectionId,
    file: File,
    onProgress?: (progress: number) => void
): Promise<{ storagePath: string; downloadUrl: string }> => {
    const paths = getStoragePaths(userId, bookId);
    const filename = `${Date.now()}_${file.name}`;
    const storagePath = paths.sectionReferences(section, filename);
    
    return uploadFile(storagePath, file, onProgress);
};

/**
 * Upload a generated page image
 */
export const uploadGeneratedPage = async (
    userId: string,
    bookId: string,
    pageNumber: number,
    file: File,
    onProgress?: (progress: number) => void
): Promise<{ storagePath: string; downloadUrl: string }> => {
    const paths = getStoragePaths(userId, bookId);
    const filename = `${Date.now()}_${file.name}`;
    const storagePath = paths.generatedPages(pageNumber, filename);
    
    return uploadFile(storagePath, file, onProgress);
};

/**
 * Generic file upload with progress tracking
 */
const uploadFile = async (
    storagePath: string,
    file: File,
    onProgress?: (progress: number) => void
): Promise<{ storagePath: string; downloadUrl: string }> => {
    const storageRef = ref(storage, storagePath);
    
    if (onProgress) {
        // Use resumable upload for progress tracking
        return new Promise((resolve, reject) => {
            const uploadTask = uploadBytesResumable(storageRef, file);
            
            uploadTask.on(
                'state_changed',
                (snapshot: UploadTaskSnapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    onProgress(progress);
                },
                (error) => {
                    reject(error);
                },
                async () => {
                    const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve({ storagePath, downloadUrl });
                }
            );
        });
    } else {
        // Simple upload without progress
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);
        return { storagePath, downloadUrl };
    }
};

// ============================================
// BATCH UPLOAD
// ============================================

export interface UploadResult {
    file: File;
    storagePath: string;
    downloadUrl: string;
    category: ImageCategory;
}

/**
 * Upload multiple profile reference images
 */
export const uploadProfileReferences = async (
    userId: string,
    bookId: string,
    files: File[],
    onProgress?: (fileIndex: number, progress: number) => void
): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await uploadProfileReference(
            userId,
            bookId,
            file,
            onProgress ? (progress) => onProgress(i, progress) : undefined
        );
        
        results.push({
            file,
            ...result,
            category: 'profile_reference',
        });
    }
    
    return results;
};

/**
 * Upload multiple section reference images
 */
export const uploadSectionReferences = async (
    userId: string,
    bookId: string,
    section: SectionId,
    files: File[],
    onProgress?: (fileIndex: number, progress: number) => void
): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await uploadSectionReference(
            userId,
            bookId,
            section,
            file,
            onProgress ? (progress) => onProgress(i, progress) : undefined
        );
        
        results.push({
            file,
            ...result,
            category: section as ImageCategory,
        });
    }
    
    return results;
};

// ============================================
// DELETE FUNCTIONS
// ============================================

/**
 * Delete a file from storage
 */
export const deleteFile = async (storagePath: string): Promise<void> => {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
};

/**
 * Delete all files in a folder
 */
export const deleteFolder = async (folderPath: string): Promise<void> => {
    const folderRef = ref(storage, folderPath);
    const list = await listAll(folderRef);
    
    // Delete all files
    const deletePromises = list.items.map(item => deleteObject(item));
    await Promise.all(deletePromises);
    
    // Recursively delete subfolders
    const subfolderPromises = list.prefixes.map(prefix => deleteFolder(prefix.fullPath));
    await Promise.all(subfolderPromises);
};

/**
 * Delete all files for a book
 */
export const deleteBookFiles = async (
    userId: string,
    bookId: string
): Promise<void> => {
    const bookFolderPath = `users/${userId}/books/${bookId}`;
    await deleteFolder(bookFolderPath);
};

// ============================================
// PERSIST BOOK IMAGES AS BASE64 DATA URLS
// ============================================

/**
 * Download an image from the backend API, compress it, and return as a base64 data URL.
 * Images are resized to max 800px and converted to JPEG at 70% quality to keep
 * the total Firestore document under 1MB.
 */
const fetchImageAsDataUrl = async (imageUrl: string): Promise<string> => {
    const response = await fetch(imageUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
    }
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 800;
            let width = img.width;
            let height = img.height;

            if (width > MAX_SIZE || height > MAX_SIZE) {
                const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            // JPEG at 70% quality for good compression
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            URL.revokeObjectURL(img.src);
            resolve(dataUrl);
        };
        img.onerror = () => {
            URL.revokeObjectURL(img.src);
            reject(new Error('Failed to load image'));
        };
        img.crossOrigin = 'anonymous';
        img.src = URL.createObjectURL(blob);
    });
};

/**
 * Download all images from a FinalBookPackage and return a map of
 * page key -> base64 data URL. The book package is NOT modified.
 */
export const downloadBookImages = async (
    bookPackage: Record<string, unknown>,
    getBackendAssetUrl: (filename: string) => string,
): Promise<Map<string, string>> => {
    const imageMap = new Map<string, string>();

    const processPage = async (page: Record<string, unknown>, key: string) => {
        const imagePath = page.image_path as string | undefined;
        if (!imagePath || imagePath.trim() === '') return;

        // If already a data URL or full http URL, skip downloading
        if (typeof imagePath === 'string' && (imagePath.startsWith('data:') || imagePath.startsWith('http'))) return;

        // Extract filename
        const pathParts = imagePath.replace(/\\/g, '/').split('/');
        const filename = pathParts.pop() || imagePath;

        try {
            const backendUrl = getBackendAssetUrl(filename);
            const dataUrl = await fetchImageAsDataUrl(backendUrl);
            imageMap.set(key, dataUrl);
        } catch (err) {
            console.warn(`Failed to download image ${filename}:`, err);
        }
    };

    const promises: Promise<void>[] = [];

    // Process cover
    if (bookPackage.cover && typeof bookPackage.cover === 'object') {
        promises.push(processPage(bookPackage.cover as Record<string, unknown>, 'cover'));
    }

    // Process back cover
    if (bookPackage.back_cover && typeof bookPackage.back_cover === 'object') {
        promises.push(processPage(bookPackage.back_cover as Record<string, unknown>, 'back_cover'));
    }

    // Process pages
    if (Array.isArray(bookPackage.pages)) {
        (bookPackage.pages as Record<string, unknown>[]).forEach((page, idx) => {
            promises.push(processPage(page, `page_${idx}`));
        });
    }

    await Promise.all(promises);
    return imageMap;
};

// ============================================
// URL FUNCTIONS
// ============================================

/**
 * Get download URL for a storage path
 */
export const getFileUrl = async (storagePath: string): Promise<string> => {
    const storageRef = ref(storage, storagePath);
    return getDownloadURL(storageRef);
};

/**
 * Get download URLs for multiple storage paths
 */
export const getFileUrls = async (storagePaths: string[]): Promise<Map<string, string>> => {
    const urlMap = new Map<string, string>();
    
    const promises = storagePaths.map(async (path) => {
        try {
            const url = await getFileUrl(path);
            urlMap.set(path, url);
        } catch (error) {
            console.error(`Failed to get URL for ${path}:`, error);
        }
    });
    
    await Promise.all(promises);
    return urlMap;
};
