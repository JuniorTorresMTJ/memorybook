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

// API Base URL - can be configured via environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
      const errorData = await response.json();
      detail = errorData.detail || JSON.stringify(errorData);
    } catch {
      detail = await response.text();
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
  
  // Add reference images
  referenceImages.forEach((file) => {
    formData.append('reference_images', file);
  });
  
  const response = await fetch(`${API_BASE_URL}/jobs`, {
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
