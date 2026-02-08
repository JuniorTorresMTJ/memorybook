/**
 * API Client
 * 
 * Client for communicating with the MemoryBook backend API.
 */

import type {
  JobPayload,
  JobCreateResponse,
  JobStatusResponse,
  FinalBookPackage,
  JobAssetsResponse,
  LanguagesResponse,
  JobsListResponse,
} from './types';

// API Base URL - In production, use same-origin /api proxy (Firebase Hosting rewrite)
// to avoid CORS issues. In development, use the direct backend URL.
const API_BASE_URL = import.meta.env.DEV
  ? (import.meta.env.VITE_API_URL || 'http://localhost:8000')
  : '/api';

// Direct Cloud Run URL for large uploads (images).
// Firebase Hosting proxy has a ~10MB body size limit, so file uploads
// must bypass it and go directly to Cloud Run.
const DIRECT_API_URL = import.meta.env.VITE_API_URL || API_BASE_URL;

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  status: number;
  detail?: string;
  
  constructor(message: string, status: number, detail?: string) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.detail = detail;
  }
}

/**
 * Handle API response and throw on error
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = '';
    try {
      // Read body as text first (can only be read once), then try parsing as JSON
      const text = await response.text();
      try {
        const errorData = JSON.parse(text);
        detail = errorData.detail || JSON.stringify(errorData);
      } catch {
        detail = text || `HTTP ${response.status}`;
      }
    } catch {
      detail = `HTTP ${response.status} ${response.statusText}`;
    }
    throw new APIError(
      `API Error: ${response.status} ${response.statusText}`,
      response.status,
      detail
    );
  }
  return response.json();
}

/**
 * Compress an image file using canvas.
 * Resizes to max 1600px on longest side and converts to JPEG at 80% quality.
 * This keeps reference images under ~300KB each, well within upload limits.
 */
async function compressImage(file: File, maxSize = 1600, quality = 0.8): Promise<File> {
  // Skip non-image files
  if (!file.type.startsWith('image/')) return file;
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      
      // Only resize if larger than maxSize
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height / width) * maxSize);
          width = maxSize;
        } else {
          width = Math.round((width / height) * maxSize);
          height = maxSize;
        }
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(file); return; }
      
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          const compressed = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          console.log(`[compressImage] ${file.name}: ${(file.size/1024).toFixed(0)}KB → ${(compressed.size/1024).toFixed(0)}KB`);
          resolve(compressed);
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Create a new book generation job
 * 
 * @param payload - Job configuration
 * @param referenceImages - Reference image files (minimum 3)
 * @returns Job creation response with job_id
 */
export async function createJob(
  payload: JobPayload,
  referenceImages: File[]
): Promise<JobCreateResponse> {
  const formData = new FormData();
  
  // Add payload as JSON string
  formData.append('payload', JSON.stringify(payload));
  
  // Compress reference images before upload to stay within size limits
  // (Firebase Hosting proxy ~10MB, Cloud Run 32MB)
  if (referenceImages.length > 0) {
    const compressed = await Promise.all(referenceImages.map(f => compressImage(f)));
    compressed.forEach((file) => {
      formData.append('reference_images', file);
    });
  }
  
  // Use direct Cloud Run URL when uploading images to bypass
  // Firebase Hosting proxy's ~10MB body size limit.
  // For requests without images, use the same-origin proxy.
  const url = referenceImages.length > 0 ? DIRECT_API_URL : API_BASE_URL;
  
  const response = await fetch(`${url}/jobs`, {
    method: 'POST',
    body: formData,
  });
  
  return handleResponse<JobCreateResponse>(response);
}

/**
 * Get job status and progress
 * 
 * @param jobId - Job identifier
 * @returns Job status response
 */
export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
  return handleResponse<JobStatusResponse>(response);
}

/**
 * Get job result (final book package)
 * 
 * @param jobId - Job identifier
 * @returns Final book package
 */
export async function getJobResult(jobId: string): Promise<FinalBookPackage> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/result`);
  return handleResponse<FinalBookPackage>(response);
}

/**
 * Get job assets (references and outputs)
 * 
 * @param jobId - Job identifier
 * @returns Assets list
 */
export async function getJobAssets(jobId: string): Promise<JobAssetsResponse> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/assets`);
  return handleResponse<JobAssetsResponse>(response);
}

/**
 * Get asset URL
 * 
 * @param jobId - Job identifier
 * @param folder - 'references' or 'outputs'
 * @param filename - Asset filename
 * @returns Full URL to asset
 */
export function getAssetUrl(jobId: string, folder: 'references' | 'outputs', filename: string): string {
  return `${API_BASE_URL}/assets/${jobId}/${folder}/${filename}`;
}

/**
 * List recent jobs
 * 
 * @param limit - Maximum number of jobs to return
 * @returns Jobs list
 */
export async function listJobs(limit: number = 20): Promise<JobsListResponse> {
  const response = await fetch(`${API_BASE_URL}/jobs?limit=${limit}`);
  return handleResponse<JobsListResponse>(response);
}

/**
 * Delete a job
 * 
 * @param jobId - Job identifier
 */
export async function deleteJob(jobId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new APIError(
      `Failed to delete job`,
      response.status
    );
  }
}

/**
 * Get supported languages
 * 
 * @returns Languages list
 */
export async function getLanguages(): Promise<LanguagesResponse> {
  const response = await fetch(`${API_BASE_URL}/languages`);
  return handleResponse<LanguagesResponse>(response);
}

/**
 * Check API health
 * 
 * @returns Health status
 */
export async function checkHealth(): Promise<{ status: string; stub_mode: boolean }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return handleResponse<{ status: string; stub_mode: boolean }>(response);
}

/**
 * Detect user's language from browser
 * 
 * @returns Normalized language code
 */
export function detectUserLanguage(): string {
  const browserLang = navigator.language || (navigator as any).userLanguage || 'en-US';
  
  // Map common browser languages to our supported codes
  const langMap: Record<string, string> = {
    'pt': 'pt-BR',
    'pt-BR': 'pt-BR',
    'pt-PT': 'pt-BR',
    'en': 'en-US',
    'en-US': 'en-US',
    'en-GB': 'en-US',
    'es': 'es-ES',
    'es-ES': 'es-ES',
    'es-MX': 'es-ES',
    'fr': 'fr-FR',
    'fr-FR': 'fr-FR',
    'de': 'de-DE',
    'de-DE': 'de-DE',
    'it': 'it-IT',
    'it-IT': 'it-IT',
  };
  
  // Try exact match first
  if (langMap[browserLang]) {
    return langMap[browserLang];
  }
  
  // Try language prefix
  const prefix = browserLang.split('-')[0];
  if (langMap[prefix]) {
    return langMap[prefix];
  }
  
  // Default to English
  return 'en-US';
}

/**
 * Validate reference images
 * 
 * @param files - Files to validate
 * @returns Validation result
 */
/**
 * Enhance text using AI
 * 
 * Sends text to the backend /enhance-text endpoint for Gemini-powered enhancement.
 */
export async function enhanceText(
  text: string,
  fieldContext: string,
  language: string = 'pt-BR'
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/enhance-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      field_context: fieldContext,
      language,
    }),
  });
  
  const data = await handleResponse<{ enhanced_text: string }>(response);
  return data.enhanced_text;
}

export function validateReferenceImages(files: File[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  
  // Check minimum count
  if (files.length < 3) {
    errors.push('At least 3 reference images are required');
  }
  
  // Check each file
  files.forEach((file, index) => {
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`Image ${index + 1} exceeds maximum size of 10MB`);
    }
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.push(`Image ${index + 1} has unsupported type. Use JPG, PNG, or WebP.`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}
