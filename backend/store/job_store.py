"""
Job Store

In-memory storage for job tracking and status management.
Thread-safe implementation with Lock.
"""

import threading
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum
from dataclasses import dataclass, field as dataclass_field
from pydantic import BaseModel, Field


class JobStatus(str, Enum):
    """Overall job status."""
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class StepName(str, Enum):
    """Pipeline step names."""
    UPLOAD = "upload"
    NORMALIZATION = "normalization"
    PLANNING = "planning"
    VISUAL_ANALYSIS = "visual_analysis"
    CHARACTER_SHEET = "character_sheet"
    PROMPT_CREATION = "prompt_creation"
    PROMPT_REVIEW = "prompt_review"
    IMAGE_GENERATION = "image_generation"
    ILLUSTRATION_REVIEW = "illustration_review"
    DESIGN_REVIEW = "design_review"
    VALIDATION = "validation"
    FINALIZATION = "finalization"


class StepStatus(str, Enum):
    """Status for individual steps."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


class PageStatus(str, Enum):
    """Status for individual pages."""
    PENDING = "pending"
    GENERATING = "generating"
    VALIDATING = "validating"
    FIXING = "fixing"
    COMPLETED = "completed"
    FAILED = "failed"


class StepInfo(BaseModel):
    """Information about a pipeline step."""
    name: str
    status: StepStatus = StepStatus.PENDING
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error: Optional[str] = None
    
    class Config:
        use_enum_values = True


class PageInfo(BaseModel):
    """Information about a page generation."""
    page_number: int
    page_type: str  # cover, page, back_cover
    status: PageStatus = PageStatus.PENDING
    retry_count: int = 0
    image_path: Optional[str] = None
    error: Optional[str] = None
    
    class Config:
        use_enum_values = True


class JobRecord(BaseModel):
    """Complete job record."""
    job_id: str
    status: JobStatus = JobStatus.QUEUED
    user_language: str = "en-US"
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    # Progress
    current_step: Optional[str] = None
    progress_percent: int = 0
    
    # Detailed status
    steps: Dict[str, StepInfo] = Field(default_factory=dict)
    pages: List[PageInfo] = Field(default_factory=list)
    
    # Input/Output
    input_payload: Optional[Dict[str, Any]] = None
    reference_image_paths: List[str] = Field(default_factory=list)
    result_path: Optional[str] = None
    result_json: Optional[Dict[str, Any]] = None
    
    # Error handling
    error: Optional[str] = None
    
    class Config:
        use_enum_values = True
    
    def to_status_response(self) -> Dict[str, Any]:
        """Convert to API status response."""
        return {
            "job_id": self.job_id,
            "status": self.status,
            "current_step": self.current_step,
            "progress_percent": self.progress_percent,
            "steps": [
                {
                    "name": step_name,
                    "status": step_info.status,
                    "started_at": step_info.started_at.isoformat() if step_info.started_at else None,
                    "completed_at": step_info.completed_at.isoformat() if step_info.completed_at else None,
                    "error": step_info.error
                }
                for step_name, step_info in self.steps.items()
            ],
            "pages": [
                {
                    "page_number": page.page_number,
                    "page_type": page.page_type,
                    "status": page.status,
                    "retry_count": page.retry_count
                }
                for page in self.pages
            ],
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "error": self.error
        }


class JobStore:
    """
    Thread-safe in-memory job store.
    
    Stores job records and provides methods for updating status.
    """
    
    def __init__(self):
        """Initialize the job store."""
        self._jobs: Dict[str, JobRecord] = {}
        self._lock = threading.Lock()
    
    def create_job(
        self,
        job_id: str,
        user_language: str = "en-US",
        input_payload: Optional[Dict[str, Any]] = None,
        reference_image_paths: Optional[List[str]] = None,
        page_count: int = 10
    ) -> JobRecord:
        """
        Create a new job record.
        
        Args:
            job_id: Unique job identifier
            user_language: User's language preference
            input_payload: Original request payload
            reference_image_paths: Paths to uploaded reference images
            page_count: Number of pages in the book
            
        Returns:
            Created JobRecord
        """
        with self._lock:
            # Initialize steps
            steps = {}
            for step_name in StepName:
                steps[step_name.value] = StepInfo(name=step_name.value)
            
            # Initialize pages (cover + pages + back_cover)
            pages = [PageInfo(page_number=0, page_type="cover")]
            for i in range(1, page_count + 1):
                pages.append(PageInfo(page_number=i, page_type="page"))
            pages.append(PageInfo(page_number=-1, page_type="back_cover"))
            
            record = JobRecord(
                job_id=job_id,
                user_language=user_language,
                input_payload=input_payload,
                reference_image_paths=reference_image_paths or [],
                steps=steps,
                pages=pages
            )
            
            self._jobs[job_id] = record
            return record
    
    def get_job(self, job_id: str) -> Optional[JobRecord]:
        """Get a job record by ID."""
        with self._lock:
            return self._jobs.get(job_id)
    
    def update_job_status(
        self,
        job_id: str,
        status: Optional[JobStatus] = None,
        current_step: Optional[str] = None,
        progress_percent: Optional[int] = None,
        error: Optional[str] = None
    ) -> Optional[JobRecord]:
        """Update overall job status."""
        with self._lock:
            job = self._jobs.get(job_id)
            if not job:
                return None
            
            if status is not None:
                job.status = status
                if status == JobStatus.PROCESSING and not job.started_at:
                    job.started_at = datetime.now()
                elif status in [JobStatus.COMPLETED, JobStatus.FAILED]:
                    job.completed_at = datetime.now()
            
            if current_step is not None:
                job.current_step = current_step
            
            if progress_percent is not None:
                job.progress_percent = min(100, max(0, progress_percent))
            
            if error is not None:
                job.error = error
            
            job.updated_at = datetime.now()
            return job
    
    def start_step(self, job_id: str, step_name: str) -> Optional[JobRecord]:
        """Mark a step as started."""
        with self._lock:
            job = self._jobs.get(job_id)
            if not job or step_name not in job.steps:
                return None
            
            job.steps[step_name].status = StepStatus.IN_PROGRESS
            job.steps[step_name].started_at = datetime.now()
            job.current_step = step_name
            job.updated_at = datetime.now()
            return job
    
    def complete_step(self, job_id: str, step_name: str, error: Optional[str] = None) -> Optional[JobRecord]:
        """Mark a step as completed or failed."""
        with self._lock:
            job = self._jobs.get(job_id)
            if not job or step_name not in job.steps:
                return None
            
            if error:
                job.steps[step_name].status = StepStatus.FAILED
                job.steps[step_name].error = error
            else:
                job.steps[step_name].status = StepStatus.COMPLETED
            
            job.steps[step_name].completed_at = datetime.now()
            job.updated_at = datetime.now()
            return job
    
    def update_page_status(
        self,
        job_id: str,
        page_number: int,
        status: PageStatus,
        image_path: Optional[str] = None,
        error: Optional[str] = None,
        increment_retry: bool = False
    ) -> Optional[JobRecord]:
        """Update status for a specific page."""
        with self._lock:
            job = self._jobs.get(job_id)
            if not job:
                return None
            
            for page in job.pages:
                if page.page_number == page_number:
                    page.status = status
                    if image_path:
                        page.image_path = image_path
                    if error:
                        page.error = error
                    if increment_retry:
                        page.retry_count += 1
                    break
            
            job.updated_at = datetime.now()
            return job
    
    def set_result(self, job_id: str, result_path: str, result_json: Dict[str, Any]) -> Optional[JobRecord]:
        """Set the job result."""
        with self._lock:
            job = self._jobs.get(job_id)
            if not job:
                return None
            
            job.result_path = result_path
            job.result_json = result_json
            job.updated_at = datetime.now()
            return job
    
    def list_jobs(self, limit: int = 100) -> List[JobRecord]:
        """List recent jobs."""
        with self._lock:
            jobs = list(self._jobs.values())
            jobs.sort(key=lambda j: j.created_at, reverse=True)
            return jobs[:limit]
    
    def delete_job(self, job_id: str) -> bool:
        """Delete a job record."""
        with self._lock:
            if job_id in self._jobs:
                del self._jobs[job_id]
                return True
            return False


# Global job store instance
_job_store: Optional[JobStore] = None


def get_job_store() -> JobStore:
    """Get the global job store instance."""
    global _job_store
    if _job_store is None:
        _job_store = JobStore()
    return _job_store
