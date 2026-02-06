"""
MemoryBook Backend API

FastAPI application for the memory book generation service.
"""

import os
import json
import uuid
import asyncio
from typing import Optional, List, Any
from datetime import datetime

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from pydantic import BaseModel, Field

from models.user_input import UserForm, BookPreferences, ReferenceImages, LifePhase
from models.output import FinalBookPackage
from pipeline.runner import PipelineRunner
from clients.gemini_client import GeminiClient
from utils.logging import setup_logger, get_logger
from utils.config import get_config, load_config_from_env
from prompts.language_utils import resolve_language
from store import (
    get_job_store, 
    JobStatus, 
    StepName, 
    PageStatus,
    save_uploaded_files,
    get_asset_path,
    get_outputs_dir,
    list_job_assets,
    get_mime_type
)


# Initialize FastAPI app
app = FastAPI(
    title="MemoryBook API",
    description="Multi-agent backend for generating personalized memory books",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://memory-book-app-1bfd7.web.app",
        "https://memory-book-app-1bfd7.firebaseapp.com",
        "*"  # Allow all for development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize configuration and logging
config = load_config_from_env()
logger = setup_logger("memorybook", log_file=config.log_file)

# Get job store
job_store = get_job_store()


# ============================================================================
# Request/Response Models
# ============================================================================

class LifePhaseRequest(BaseModel):
    """Life phase data from the frontend."""
    memories: List[str] = Field(default_factory=list)
    key_events: List[str] = Field(default_factory=list)
    emotions: List[str] = Field(default_factory=list)


class JobPayload(BaseModel):
    """Payload for job creation (sent as JSON string in form data)."""
    # User form data
    young: LifePhaseRequest = Field(default_factory=LifePhaseRequest)
    adolescent: LifePhaseRequest = Field(default_factory=LifePhaseRequest)
    adult: LifePhaseRequest = Field(default_factory=LifePhaseRequest)
    elderly: LifePhaseRequest = Field(default_factory=LifePhaseRequest)
    
    # Book preferences
    title: str = Field(..., min_length=1)
    date: str = Field(...)
    page_count: int = Field(default=10)
    style: str = Field(default="watercolor")
    
    # Language preference
    user_language: str = Field(default="en-US")


class JobCreateResponse(BaseModel):
    """Response from job creation."""
    job_id: str
    status: str
    message: str


class JobStatusResponse(BaseModel):
    """Job status response."""
    job_id: str
    status: str
    current_step: Optional[str] = None
    progress_percent: int = 0
    steps: List[dict] = Field(default_factory=list)
    pages: List[dict] = Field(default_factory=list)
    created_at: str
    updated_at: str
    error: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    timestamp: datetime
    config_valid: bool
    stub_mode: bool
    supported_languages: List[str]


# ============================================================================
# Background Processing
# ============================================================================

async def process_job_background(job_id: str, payload: JobPayload, reference_paths: List[str]):
    """
    Process a job in the background.
    
    Updates job store with progress as the pipeline runs.
    """
    user_language = resolve_language(payload.user_language)
    
    try:
        # Update job status to processing
        job_store.update_job_status(job_id, status=JobStatus.PROCESSING)
        
        # Initialize Gemini client
        gemini_client = GeminiClient(
            api_key=config.google_api_key,
            model=config.gemini_model
        )
        
        # Create pipeline runner
        runner = PipelineRunner(gemini_client, logger)
        
        # Convert payload to internal models
        user_form = UserForm(
            young=LifePhase(
                memories=payload.young.memories,
                key_events=payload.young.key_events,
                emotions=payload.young.emotions
            ),
            adolescent=LifePhase(
                memories=payload.adolescent.memories,
                key_events=payload.adolescent.key_events,
                emotions=payload.adolescent.emotions
            ),
            adult=LifePhase(
                memories=payload.adult.memories,
                key_events=payload.adult.key_events,
                emotions=payload.adult.emotions
            ),
            elderly=LifePhase(
                memories=payload.elderly.memories,
                key_events=payload.elderly.key_events,
                emotions=payload.elderly.emotions
            )
        )
        
        preferences = BookPreferences(
            title=payload.title,
            date=payload.date,
            page_count=payload.page_count,
            style=payload.style
        )
        
        reference_images = ReferenceImages(paths=reference_paths)
        
        # Run pipeline with progress tracking
        result = await run_pipeline_with_tracking(
            runner=runner,
            job_id=job_id,
            user_form=user_form,
            preferences=preferences,
            reference_images=reference_images,
            user_language=user_language
        )
        
        # Save result
        output_dir = get_outputs_dir(job_id)
        result_path = os.path.join(output_dir, "result.json")
        
        with open(result_path, 'w', encoding='utf-8') as f:
            json.dump(result.model_dump(), f, indent=2, default=str)
        
        job_store.set_result(job_id, result_path, result.model_dump())
        job_store.update_job_status(
            job_id, 
            status=JobStatus.COMPLETED, 
            progress_percent=100
        )
        
        logger.info(f"[{job_id}] Job completed successfully")
        
    except Exception as e:
        logger.error(f"[{job_id}] Job failed: {str(e)}")
        job_store.update_job_status(
            job_id,
            status=JobStatus.FAILED,
            error=str(e)
        )


async def run_pipeline_with_tracking(
    runner: PipelineRunner,
    job_id: str,
    user_form: UserForm,
    preferences: BookPreferences,
    reference_images: ReferenceImages,
    user_language: str
) -> FinalBookPackage:
    """
    Run pipeline with progress tracking to job store.
    """
    from datetime import datetime
    
    # Helper to update progress
    def update_progress(step: str, percent: int):
        job_store.start_step(job_id, step)
        job_store.update_job_status(job_id, current_step=step, progress_percent=percent)
    
    def complete_step(step: str):
        job_store.complete_step(job_id, step)
    
    output_dir = get_outputs_dir(job_id)
    
    try:
        # Phase 1: Normalization (10%)
        update_progress(StepName.NORMALIZATION.value, 5)
        normalized_profile = await runner.normalizer.execute(
            (user_form, preferences, user_language)
        )
        complete_step(StepName.NORMALIZATION.value)
        
        # Phase 2: Planning + Visual Analysis (30%)
        update_progress(StepName.PLANNING.value, 15)
        job_store.start_step(job_id, StepName.VISUAL_ANALYSIS.value)
        
        narrative_plan, visual_fingerprint = await asyncio.gather(
            runner.narrative_planner.execute((normalized_profile, preferences, user_language)),
            runner.visual_analyzer.execute((reference_images, preferences, user_language))
        )
        
        complete_step(StepName.PLANNING.value)
        complete_step(StepName.VISUAL_ANALYSIS.value)
        
        # Phase 3: Prompt Creation (45%)
        update_progress(StepName.PROMPT_CREATION.value, 35)
        
        cover_prompt, back_cover_prompt, page_prompts = await asyncio.gather(
            runner.cover_creator.execute((narrative_plan.cover, visual_fingerprint, preferences, user_language)),
            runner.back_cover_creator.execute((narrative_plan.back_cover, visual_fingerprint, preferences, user_language)),
            runner.prompt_writer.execute((narrative_plan, visual_fingerprint, preferences, user_language))
        )
        
        all_prompts = [cover_prompt] + page_prompts + [back_cover_prompt]
        complete_step(StepName.PROMPT_CREATION.value)
        
        # Phase 4: Prompt Review (55%)
        update_progress(StepName.PROMPT_REVIEW.value, 50)
        reviewed_prompts = await runner.prompt_reviewer.execute((all_prompts, user_language))
        complete_step(StepName.PROMPT_REVIEW.value)
        
        # Phase 5: Image Generation (75%)
        update_progress(StepName.IMAGE_GENERATION.value, 55)
        
        generation_results = []
        total_prompts = len(reviewed_prompts)
        
        for i, prompt in enumerate(reviewed_prompts):
            # Update page status
            page_num = prompt.page_number
            job_store.update_page_status(job_id, page_num, PageStatus.GENERATING)
            
            # Determine filename
            if prompt.prompt_type == "cover":
                filename = "cover.png"
            elif prompt.prompt_type == "back_cover":
                filename = "back_cover.png"
            else:
                filename = f"page_{prompt.page_number:02d}.png"
            
            output_path = os.path.join(output_dir, filename)
            
            # Generate image with retry
            max_attempts = 3
            result = None
            for attempt in range(max_attempts):
                result = await runner.image_client.generate_image(
                    prompt=prompt.get_full_prompt(),
                    reference_images=reference_images.paths if prompt.render_params.use_reference_images else None,
                    render_params=prompt.render_params.model_dump(),
                    output_path=output_path
                )
                
                if result.success:
                    break
                
                if attempt < max_attempts - 1:
                    logger.warning(f"[{job_id}] Image gen failed for {filename} (attempt {attempt+1}), retrying...")
                    await asyncio.sleep(1)
            
            generation_results.append(result)
            
            # Update page status
            job_store.update_page_status(
                job_id, page_num, 
                PageStatus.COMPLETED if result.success else PageStatus.FAILED,
                image_path=result.image_path
            )
            
            # Update overall progress
            progress = 55 + int((i + 1) / total_prompts * 20)
            job_store.update_job_status(job_id, progress_percent=progress)
        
        # Log any failed images
        failed_count = sum(1 for r in generation_results if not r.success)
        if failed_count > 0:
            logger.warning(f"[{job_id}] {failed_count}/{total_prompts} images failed generation")
        
        complete_step(StepName.IMAGE_GENERATION.value)
        
        # Phase 6: Illustration Review (85%)
        update_progress(StepName.ILLUSTRATION_REVIEW.value, 78)
        illustration_reviews = await runner.illustrator_reviewer.execute(
            (generation_results, preferences, user_language)
        )
        complete_step(StepName.ILLUSTRATION_REVIEW.value)
        
        # Phase 7: Design Review (90%)
        update_progress(StepName.DESIGN_REVIEW.value, 85)
        design_review = await runner.designer_reviewer.execute(
            (generation_results, illustration_reviews, preferences, user_language)
        )
        complete_step(StepName.DESIGN_REVIEW.value)
        
        # Phase 8: Validation (95%)
        update_progress(StepName.VALIDATION.value, 90)
        # Simplified validation for now
        complete_step(StepName.VALIDATION.value)
        
        # Phase 9: Finalization (100%)
        update_progress(StepName.FINALIZATION.value, 95)
        
        # Build final package
        final_package = runner._build_final_package(
            book_id=job_id,
            preferences=preferences,
            results=generation_results,
            prompts=reviewed_prompts,
            narrative_plan=narrative_plan,
            fingerprint=visual_fingerprint,
            design_review=design_review,
            output_dir=output_dir,
            total_time_ms=0,
            total_retries=0
        )
        
        complete_step(StepName.FINALIZATION.value)
        
        return final_package
        
    finally:
        # Cleanup
        await runner.image_client.close()


# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    config_errors = config.validate()
    
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        timestamp=datetime.now(),
        config_valid=len(config_errors) == 0,
        stub_mode=config.is_stub_mode,
        supported_languages=["pt-BR", "en-US", "es-ES", "fr-FR", "de-DE", "it-IT"]
    )


@app.post("/jobs", response_model=JobCreateResponse)
async def create_job(
    background_tasks: BackgroundTasks,
    payload: str = Form(..., description="JSON payload"),
    reference_images: List[UploadFile] = File(default=[], description="Reference images (optional)")
):
    """
    Create a new book generation job.
    
    Accepts multipart/form-data with:
    - payload: JSON string with job configuration
    - reference_images: Optional image files for personalization
    """
    job_id = str(uuid.uuid4())
    
    try:
        # Parse payload
        payload_data = JobPayload.model_validate_json(payload)
        user_language = resolve_language(payload_data.user_language)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid payload: {str(e)}")
    
    # Reference images are optional - if provided, validate them
    reference_paths = []
    
    if reference_images:
        # Validate file types and sizes
        MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
        ALLOWED_TYPES = {'image/jpeg', 'image/png', 'image/webp'}
        
        files_to_save = []
        for img in reference_images:
            content = await img.read()
            
            # Check size
            if len(content) > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"File {img.filename} exceeds maximum size of 10MB"
                )
            
            # Check type
            if img.content_type not in ALLOWED_TYPES:
                raise HTTPException(
                    status_code=400,
                    detail=f"File {img.filename} has unsupported type. Use JPG, PNG, or WebP."
                )
            
            files_to_save.append((content, img.filename))
        
        # Save uploaded files
        try:
            reference_paths = await save_uploaded_files(job_id, files_to_save)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save files: {str(e)}")
    
    # Create job record
    job_store.create_job(
        job_id=job_id,
        user_language=user_language,
        input_payload=payload_data.model_dump(),
        reference_image_paths=reference_paths,
        page_count=payload_data.page_count
    )
    
    logger.info(f"[{job_id}] Job created: {payload_data.title} (language: {user_language})")
    
    # Start background processing
    background_tasks.add_task(process_job_background, job_id, payload_data, reference_paths)
    
    return JobCreateResponse(
        job_id=job_id,
        status="queued",
        message="Job created and queued for processing"
    )


@app.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    """Get job status and progress."""
    job = job_store.get_job(job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return JobStatusResponse(**job.to_status_response())


@app.get("/jobs/{job_id}/result")
async def get_job_result(job_id: str):
    """Get job result (final book package) with embedded image data."""
    job = job_store.get_job(job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != JobStatus.COMPLETED:
        raise HTTPException(
            status_code=400,
            detail=f"Job not completed. Current status: {job.status}"
        )
    
    if not job.result_json:
        raise HTTPException(status_code=404, detail="Result not found")
    
    # Convert datetime objects to ISO strings for JSON serialization
    import json
    import base64
    from datetime import datetime
    
    def json_serial(obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        raise TypeError(f"Type {type(obj)} not serializable")
    
    # Embed images as base64 data URLs in the result
    result = json.loads(json.dumps(job.result_json, default=json_serial))
    
    def embed_image(page_data):
        """Read image file and embed as base64 data URL."""
        if not page_data or not isinstance(page_data, dict):
            return
        image_path = page_data.get("image_path", "")
        if not image_path or image_path.startswith("data:"):
            return
        # Try to find the actual file
        try:
            # Extract filename
            filename = os.path.basename(image_path.replace("\\", "/"))
            asset_path = get_asset_path(job_id, "outputs", filename)
            if asset_path and os.path.exists(asset_path):
                with open(asset_path, "rb") as f:
                    img_bytes = f.read()
                mime = get_mime_type(filename)
                data_url = f"data:{mime};base64,{base64.b64encode(img_bytes).decode()}"
                page_data["image_data"] = data_url
        except Exception as e:
            logger.warning(f"Failed to embed image {image_path}: {e}")
    
    # Embed images for all pages
    embed_image(result.get("cover"))
    embed_image(result.get("back_cover"))
    for page in result.get("pages", []):
        embed_image(page)
    
    return JSONResponse(content=result)


@app.get("/jobs/{job_id}/assets")
async def list_job_assets_endpoint(job_id: str):
    """List all assets for a job."""
    job = job_store.get_job(job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    assets = list_job_assets(job_id)
    
    return {
        "job_id": job_id,
        "references": [
            {"filename": f, "url": f"/assets/{job_id}/references/{f}"}
            for f in assets["references"]
        ],
        "outputs": [
            {"filename": f, "url": f"/assets/{job_id}/outputs/{f}"}
            for f in assets["outputs"]
        ]
    }


@app.get("/assets/{job_id}/{folder}/{filename}")
async def serve_asset(job_id: str, folder: str, filename: str):
    """Serve an asset file (image or JSON)."""
    # Validate folder
    if folder not in ["references", "outputs"]:
        raise HTTPException(status_code=400, detail="Invalid folder")
    
    # Check job exists
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Get asset path
    from store.file_storage import get_references_dir, get_outputs_dir
    
    if folder == "references":
        base_dir = get_references_dir(job_id)
    else:
        base_dir = get_outputs_dir(job_id)
    
    filepath = os.path.join(base_dir, filename)
    
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Serve file
    mime_type = get_mime_type(filename)
    return FileResponse(filepath, media_type=mime_type)


@app.get("/jobs")
async def list_jobs(limit: int = 20):
    """List recent jobs."""
    jobs = job_store.list_jobs(limit=limit)
    
    return {
        "jobs": [
            {
                "job_id": job.job_id,
                "status": job.status,
                "progress_percent": job.progress_percent,
                "created_at": job.created_at.isoformat(),
                "title": job.input_payload.get("title") if job.input_payload else None
            }
            for job in jobs
        ],
        "total": len(jobs)
    }


@app.delete("/jobs/{job_id}")
async def delete_job(job_id: str):
    """Delete a job and its assets."""
    from store.file_storage import cleanup_job_storage
    
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Cleanup storage
    cleanup_job_storage(job_id)
    
    # Delete job record
    job_store.delete_job(job_id)
    
    return {"message": "Job deleted successfully"}


@app.get("/languages")
async def get_supported_languages():
    """Get list of supported languages."""
    return {
        "languages": [
            {"code": "pt-BR", "name": "Português (Brasil)"},
            {"code": "en-US", "name": "English (United States)"},
            {"code": "es-ES", "name": "Español (España)"},
            {"code": "fr-FR", "name": "Français (France)"},
            {"code": "de-DE", "name": "Deutsch (Deutschland)"},
            {"code": "it-IT", "name": "Italiano (Italia)"},
        ],
        "default": "en-US"
    }


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "MemoryBook API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "create_job": "POST /jobs",
            "job_status": "GET /jobs/{job_id}",
            "job_result": "GET /jobs/{job_id}/result",
            "job_assets": "GET /jobs/{job_id}/assets",
            "serve_asset": "GET /assets/{job_id}/{folder}/{filename}",
            "list_jobs": "GET /jobs",
            "delete_job": "DELETE /jobs/{job_id}",
            "languages": "GET /languages"
        }
    }


# ============================================================================
# Startup/Shutdown Events
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize resources on startup."""
    logger.info("MemoryBook API starting up...")
    
    # Ensure storage directory exists
    from store.file_storage import ensure_storage_dir
    ensure_storage_dir()
    
    # Validate configuration
    errors = config.validate()
    if errors:
        logger.warning(f"Configuration warnings: {errors}")
        logger.warning("Running in stub mode - no real API calls will be made")
    
    logger.info("MemoryBook API ready")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup resources on shutdown."""
    logger.info("MemoryBook API shutting down...")
    logger.info("MemoryBook API shutdown complete")
