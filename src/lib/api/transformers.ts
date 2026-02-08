/**
 * Data Transformers
 * 
 * Functions to transform wizard data to API payload format.
 */

import type { JobPayload, LifePhase, PhysicalCharacteristicsPayload } from './types';
import type { 
  MemoryBookData, 
  UploadedImage,
  PhysicalCharacteristicsData
} from '../../components/wizard/types';

/**
 * Transform a free-text memory string into an API life phase format
 */
function transformMemoryText(text: string): LifePhase {
  const memories: string[] = [];
  const keyEvents: string[] = [];
  const emotions: string[] = [];

  if (text.trim()) {
    memories.push(text.trim());
  }

  return {
    memories,
    key_events: keyEvents,
    emotions
  };
}

/**
 * Transform physical characteristics from wizard format to API format
 */
function transformPhysicalCharacteristics(
  chars: PhysicalCharacteristicsData
): PhysicalCharacteristicsPayload {
  return {
    name: chars.name,
    gender: chars.gender,
    skin_color: chars.skinColor,
    hair_color: chars.hairColor,
    hair_style: chars.hairStyle,
    has_glasses: chars.hasGlasses,
    has_facial_hair: chars.hasFacialHair,
  };
}

/**
 * Transform wizard data to API job payload
 * 
 * Uses the simplified memories fields (one free-text per life phase).
 * Includes physical characteristics and reference input mode for
 * character consistency across all book pages.
 * 
 * @param data - Memory book data from wizard
 * @param userLanguage - User's preferred language
 * @returns JobPayload ready for API
 */
export function transformWizardDataToPayload(
  data: MemoryBookData,
  userLanguage: string = 'en-US'
): JobPayload {
  const payload: JobPayload = {
    // Book preferences
    title: data.bookSetup.title || 'My Memory Book',
    date: data.bookSetup.date || new Date().toISOString().split('T')[0],
    page_count: data.bookSetup.pageCount,
    style: data.bookSetup.illustrationStyle,
    user_language: userLanguage,
    
    // Reference input mode
    reference_input_mode: data.bookSetup.referenceInputMode,
    
    // Life phases from simplified memories
    young: transformMemoryText(data.memories?.childhood || ''),
    adolescent: transformMemoryText(data.memories?.teenage || ''),
    adult: transformMemoryText(data.memories?.adultLife || ''),
    elderly: transformMemoryText(data.memories?.laterLife || ''),
  };

  // Include physical characteristics when available
  if (data.bookSetup.physicalCharacteristics?.name) {
    payload.physical_characteristics = transformPhysicalCharacteristics(
      data.bookSetup.physicalCharacteristics
    );
  }

  return payload;
}

/**
 * Extract File objects from uploaded images
 * 
 * @param images - Array of UploadedImage objects
 * @returns Array of File objects
 */
export function extractFilesFromImages(images: UploadedImage[]): File[] {
  return images.map(img => img.file);
}

/**
 * Get all reference photos as File array
 * 
 * @param data - Memory book data from wizard
 * @returns Array of File objects for reference photos
 */
export function getReferencePhotos(data: MemoryBookData): File[] {
  return extractFilesFromImages(data.bookSetup.referencePhotos);
}

/**
 * Calculate total photos count across all phases
 */
export function getTotalPhotosCount(data: MemoryBookData): number {
  return data.bookSetup.referencePhotos.length;
}

/**
 * Check if wizard data has minimum required content
 */
export function validateWizardData(data: MemoryBookData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.bookSetup.title?.trim()) {
    errors.push('Book title is required');
  }

  // Photos are only required if the user chose the photos mode
  if (data.bookSetup.referenceInputMode === 'photos' && data.bookSetup.referencePhotos.length < 3) {
    errors.push('At least 3 reference photos are required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
