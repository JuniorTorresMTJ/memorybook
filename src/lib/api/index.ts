/**
 * API Module
 * 
 * Re-exports all API types and functions.
 */

// Types
export type {
  LifePhase,
  UserForm,
  BookPreferences,
  JobPayload,
  JobCreateResponse,
  JobStatusType,
  StepStatusType,
  PageStatusType,
  StepInfo,
  PageInfo,
  JobStatusResponse,
  BookPage,
  QualityMetrics,
  IllustrationReviewItem,
  DesignReview,
  FinalBookPackage,
  AssetInfo,
  JobAssetsResponse,
  LanguageOption,
  LanguagesResponse,
  JobListItem,
  JobsListResponse,
} from './types';

// Client functions
export {
  APIError,
  createJob,
  getJobStatus,
  getJobResult,
  getJobAssets,
  getAssetUrl,
  listJobs,
  deleteJob,
  getLanguages,
  checkHealth,
  detectUserLanguage,
  validateReferenceImages,
  enhanceText,
} from './client';

// Hooks
export {
  useJobPolling,
  useJobCreation,
} from './hooks';

// Transformers
export {
  transformWizardDataToPayload,
  extractFilesFromImages,
  getReferencePhotos,
  getTotalPhotosCount,
  validateWizardData,
} from './transformers';
