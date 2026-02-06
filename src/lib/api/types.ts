/**
 * API Types
 * 
 * TypeScript types aligned with backend Pydantic models.
 */

// ============================================================================
// User Input Types
// ============================================================================

export interface LifePhase {
  memories: string[];
  key_events: string[];
  emotions: string[];
}

export interface UserForm {
  young: LifePhase;
  adolescent: LifePhase;
  adult: LifePhase;
  elderly: LifePhase;
}

export interface BookPreferences {
  title: string;
  date: string;
  page_count: 10 | 15 | 20;
  style: 'coloring' | 'cartoon' | 'anime' | 'watercolor';
}

// ============================================================================
// Job Types
// ============================================================================

export interface JobPayload extends UserForm, BookPreferences {
  user_language: string;
}

export interface JobCreateResponse {
  job_id: string;
  status: string;
  message: string;
}

export type JobStatusType = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export type StepStatusType = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

export type PageStatusType = 'pending' | 'generating' | 'validating' | 'fixing' | 'completed' | 'failed';

export interface StepInfo {
  name: string;
  status: StepStatusType;
  started_at: string | null;
  completed_at: string | null;
  error: string | null;
}

export interface PageInfo {
  page_number: number;
  page_type: 'cover' | 'page' | 'back_cover';
  status: PageStatusType;
  retry_count: number;
}

export interface JobStatusResponse {
  job_id: string;
  status: JobStatusType;
  current_step: string | null;
  progress_percent: number;
  steps: StepInfo[];
  pages: PageInfo[];
  created_at: string;
  updated_at: string;
  error: string | null;
}

// ============================================================================
// Result Types
// ============================================================================

export interface BookPage {
  page_number: number;
  page_type: string;
  image_path: string;
  thumbnail_path?: string;
  narrative_text?: string;
  life_phase?: string;
  memory_reference?: string;
  generation_attempts: number;
}

export interface QualityMetrics {
  overall_score: number;
  technical_quality: number;
  artistic_quality: number;
  style_consistency: number;
  character_accuracy: number;
  narrative_fit: number;
}

export interface IllustrationReviewItem {
  page_number: number;
  artistic_assessment: string;
  composition_notes: string;
  color_harmony: string;
  emotional_impact: string;
  style_adherence: string;
  strengths: string[];
  areas_for_improvement: string[];
  recommended_action: string;
}

export interface DesignReview {
  overall_cohesion: number;
  style_consistency_score: number;
  color_palette_harmony: number;
  narrative_flow: number;
  character_consistency: number;
  page_reviews: IllustrationReviewItem[];
  global_issues: string[];
  global_suggestions: string[];
  pages_needing_attention: number[];
  approved: boolean;
}

export interface FinalBookPackage {
  book_id: string;
  title: string;
  style: string;
  created_at: string;
  cover: BookPage;
  back_cover: BookPage;
  pages: BookPage[];
  total_pages: number;
  design_review?: DesignReview;
  total_generation_time_ms: number;
  total_retries: number;
  output_directory: string;
}

// ============================================================================
// Asset Types
// ============================================================================

export interface AssetInfo {
  filename: string;
  url: string;
}

export interface JobAssetsResponse {
  job_id: string;
  references: AssetInfo[];
  outputs: AssetInfo[];
}

// ============================================================================
// Language Types
// ============================================================================

export interface LanguageOption {
  code: string;
  name: string;
}

export interface LanguagesResponse {
  languages: LanguageOption[];
  default: string;
}

// ============================================================================
// Jobs List
// ============================================================================

export interface JobListItem {
  job_id: string;
  status: JobStatusType;
  progress_percent: number;
  created_at: string;
  title: string | null;
}

export interface JobsListResponse {
  jobs: JobListItem[];
  total: number;
}
