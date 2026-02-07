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

/**
 * Delete generated images for backend job IDs from public Storage.
 */
export const deleteGeneratedImages = async (backendJobIds: string[]): Promise<void> => {
    for (const jobId of backendJobIds) {
        try {
            await deleteFolder(`public/generated/${jobId}`);
        } catch (e) {
            console.warn(`[deleteGeneratedImages] Failed to delete public/generated/${jobId}:`, e);
        }
    }
};

// ============================================
// PERSIST BOOK IMAGES AS BASE64 DATA URLS
// ============================================

/**
 * Convert a Blob to a base64 data URL using FileReader.
 * Works for any blob type - no Image element or Canvas needed.
 */
const blobToDataUrl = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('FileReader failed'));
        reader.readAsDataURL(blob);
    });

/**
 * Compress a blob client-side using Image + Canvas (fallback for large images).
 * IMPORTANT: Do NOT set crossOrigin on Image when using blob URLs.
 */
const compressWithCanvas = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            try {
                const MAX = 800;
                let w = img.naturalWidth, h = img.naturalHeight;
                if (w > MAX || h > MAX) {
                    const r = Math.min(MAX / w, MAX / h);
                    w = Math.round(w * r);
                    h = Math.round(h * r);
                }
                const c = document.createElement('canvas');
                c.width = w;
                c.height = h;
                const ctx = c.getContext('2d');
                if (!ctx) { URL.revokeObjectURL(url); reject(new Error('No canvas ctx')); return; }
                ctx.drawImage(img, 0, 0, w, h);
                URL.revokeObjectURL(url);
                resolve(c.toDataURL('image/jpeg', 0.65));
            } catch (err) {
                URL.revokeObjectURL(url);
                reject(err);
            }
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
        img.src = url; // NO crossOrigin for blob URLs
    });

/**
 * Download an image from the backend API and return as a base64 data URL.
 * Images are already compressed at generation time (JPEG ~80-150KB).
 * Uses FileReader as primary method, with Canvas fallback if data URL > 1MB.
 */
const fetchImageAsDataUrl = async (imageUrl: string): Promise<string> => {
    const response = await fetch(imageUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
    }
    const blob = await response.blob();
    console.log(`[fetchImage] Fetched ${imageUrl.split('/').pop()}: ${(blob.size / 1024).toFixed(0)}KB, type=${blob.type}`);

    // Primary: FileReader directly (works for any blob, guaranteed)
    const dataUrl = await blobToDataUrl(blob);
    if (dataUrl.length < 1_000_000) {
        console.log(`[fetchImage] OK via FileReader: ${(dataUrl.length / 1024).toFixed(0)}KB`);
        return dataUrl;
    }

    // Fallback: Image+Canvas compression if data URL exceeds Firestore limit
    console.log(`[fetchImage] Data URL too large (${(dataUrl.length / 1024).toFixed(0)}KB), compressing with Canvas...`);
    return compressWithCanvas(blob);
};

/**
 * Download all images from a FinalBookPackage and return a map of
 * page key -> base64 data URL. The book package is NOT modified.
 * Downloads are done SEQUENTIALLY to ensure same Cloud Run instance
 * serves all requests (avoids routing to different instances).
 */
export const downloadBookImages = async (
    bookPackage: Record<string, unknown>,
    getBackendAssetUrl: (filename: string) => string,
): Promise<Map<string, string>> => {
    const imageMap = new Map<string, string>();

    // Collect all pages to download
    const pagesToDownload: Array<{ page: Record<string, unknown>; key: string }> = [];

    if (bookPackage.cover && typeof bookPackage.cover === 'object') {
        pagesToDownload.push({ page: bookPackage.cover as Record<string, unknown>, key: 'cover' });
    }
    if (bookPackage.back_cover && typeof bookPackage.back_cover === 'object') {
        pagesToDownload.push({ page: bookPackage.back_cover as Record<string, unknown>, key: 'back_cover' });
    }
    if (Array.isArray(bookPackage.pages)) {
        (bookPackage.pages as Record<string, unknown>[]).forEach((page, idx) => {
            pagesToDownload.push({ page, key: `page_${idx}` });
        });
    }

    // Download SEQUENTIALLY to keep requests on the same Cloud Run instance
    for (const { page, key } of pagesToDownload) {
        const imagePath = page.image_path as string | undefined;
        if (!imagePath || imagePath.trim() === '') {
            console.log(`[downloadBookImages] Skipping ${key}: no image_path`);
            continue;
        }

        // If already a data URL or full http URL, skip downloading
        if (typeof imagePath === 'string' && (imagePath.startsWith('data:') || imagePath.startsWith('http'))) {
            console.log(`[downloadBookImages] Skipping ${key}: already a URL/data`);
            continue;
        }

        // Extract filename
        const pathParts = imagePath.replace(/\\/g, '/').split('/');
        const filename = pathParts.pop() || imagePath;

        try {
            const backendUrl = getBackendAssetUrl(filename);
            console.log(`[downloadBookImages] Downloading ${key}: ${backendUrl}`);
            const dataUrl = await fetchImageAsDataUrl(backendUrl);
            imageMap.set(key, dataUrl);
            console.log(`[downloadBookImages] Success ${key}: ${dataUrl.substring(0, 50)}...`);
        } catch (err) {
            console.error(`[downloadBookImages] FAILED ${key} (${filename}):`, err);
        }
    }

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
