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

from models.user_input import UserForm, BookPreferences, ReferenceImages, LifePhase, PhysicalCharacteristics
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
# Using allow_credentials=False with allow_origins=["*"] to allow all origins.
# The frontend fetch calls don't use credentials, so this is safe.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.middleware("http")
async def strip_api_prefix(request, call_next):
    """Strip /api prefix so routes work both directly and via Firebase Hosting proxy."""
    original_path = request.scope["path"]
    if original_path.startswith("/api"):
        request.scope["path"] = original_path[4:] or "/"
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        import traceback
        print(f"[MIDDLEWARE ERROR] path={original_path} error={e}")
        traceback.print_exc()
        raise

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


class PhysicalCharacteristicsRequest(BaseModel):
    """Physical characteristics from the frontend form."""
    name: str = ""
    gender: Optional[str] = None
    skin_color: Optional[str] = None
    hair_color: Optional[str] = None
    hair_style: Optional[str] = None
    has_glasses: bool = False
    has_facial_hair: bool = False


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
    
    # Reference input mode and physical characteristics
    reference_input_mode: Optional[str] = Field(default="photos")
    physical_characteristics: Optional[PhysicalCharacteristicsRequest] = Field(default=None)


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
        
        # Build physical characteristics from payload if provided
        phys_chars = None
        if payload.physical_characteristics and payload.physical_characteristics.name:
            phys_chars = PhysicalCharacteristics(
                name=payload.physical_characteristics.name,
                gender=payload.physical_characteristics.gender,
                skin_color=payload.physical_characteristics.skin_color,
                hair_color=payload.physical_characteristics.hair_color,
                hair_style=payload.physical_characteristics.hair_style,
                has_glasses=payload.physical_characteristics.has_glasses,
                has_facial_hair=payload.physical_characteristics.has_facial_hair,
            )
        
        reference_images = ReferenceImages(
            paths=reference_paths,
            physical_characteristics=phys_chars,
            reference_input_mode=payload.reference_input_mode or "photos"
        )
        
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
        
        # Phase 2.5: Character Sheet Generation (32%)
        update_progress(StepName.CHARACTER_SHEET.value, 28)
        character_sheet_path = await runner.character_sheet_generator.execute(
            (visual_fingerprint, preferences, reference_images, output_dir, user_language)
        )
        complete_step(StepName.CHARACTER_SHEET.value)
        
        # Build consolidated reference images: user photos + character sheet
        all_reference_images = list(reference_images.paths)
        if character_sheet_path:
            all_reference_images.append(character_sheet_path)
            visual_fingerprint.character_sheet_path = character_sheet_path
            logger.info(f"[{job_id}] Character sheet generated: {character_sheet_path}")
        else:
            logger.info(f"[{job_id}] Character sheet generation skipped or failed - continuing without it")
        
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
                filename = "cover.jpg"
            elif prompt.prompt_type == "back_cover":
                filename = "back_cover.jpg"
            else:
                filename = f"page_{prompt.page_number:02d}.jpg"
            
            output_path = os.path.join(output_dir, filename)
            
            # Generate image with retry
            # Always pass reference images (user photos + character sheet) for consistency
            # Only skip for back cover which typically doesn't feature the character
            refs = all_reference_images if (all_reference_images and prompt.prompt_type != "back_cover") else None
            
            max_attempts = 3
            result = None
            for attempt in range(max_attempts):
                result = await runner.image_client.generate_image(
                    prompt=prompt.get_full_prompt(),
                    reference_images=refs,
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
    """Get job result (final book package). 
    Images are returned as public URLs in image_path when available.
    The /assets/ endpoint remains as fallback."""
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
    from datetime import datetime
    
    def json_serial(obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        raise TypeError(f"Type {type(obj)} not serializable")
    
    result = json.loads(json.dumps(job.result_json, default=json_serial))
    
    # Add asset_url hints so frontend knows where to fetch images
    def add_asset_url(page_data):
        """Add asset URL hint for each page's image."""
        if not page_data or not isinstance(page_data, dict):
            return
        image_path = page_data.get("image_path", "")
        if not image_path or image_path.startswith("data:") or image_path.startswith("http"):
            return
        filename = os.path.basename(image_path.replace("\\", "/"))
        page_data["asset_url"] = f"/assets/{job_id}/outputs/{filename}"
    
    add_asset_url(result.get("cover"))
    add_asset_url(result.get("back_cover"))
    for page in result.get("pages", []):
        add_asset_url(page)
    
    logger.info(f"[{job_id}] Returning result (public URLs when available)")
    
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
    """Serve an asset file directly. Images are already compressed at generation time."""
    if folder not in ["references", "outputs"]:
        raise HTTPException(status_code=400, detail="Invalid folder")
    
    from store.file_storage import get_references_dir, get_outputs_dir
    base_dir = get_references_dir(job_id) if folder == "references" else get_outputs_dir(job_id)
    filepath = os.path.join(base_dir, filename)
    
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Asset not found")
    
    return FileResponse(filepath, media_type=get_mime_type(filename))


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


class EnhanceTextRequest(BaseModel):
    """Request body for text enhancement."""
    text: str = Field(..., min_length=1, max_length=5000, description="Text to enhance")
    field_context: str = Field(default="memory", description="Context hint: childhood, teenage, adultLife, laterLife, or generic memory field name")
    language: str = Field(default="pt-BR", description="Target language code")


class EnhanceTextResponse(BaseModel):
    """Response from text enhancement."""
    enhanced_text: str
    original_text: str


@app.post("/enhance-text", response_model=EnhanceTextResponse, tags=["utilities"])
async def enhance_text(request: EnhanceTextRequest):
    """
    Enhance user-written memory text using Gemini.
    Makes the text more detailed, personal and vivid while preserving the original meaning.
    """
    logger.info(f"[enhance-text] Enhancing text ({len(request.text)} chars, context={request.field_context}, lang={request.language})")

    lang = resolve_language(request.language)
    lang_instruction = {
        "pt": "Responda em português brasileiro.",
        "en": "Respond in English.",
        "es": "Responda en español.",
        "de": "Antworte auf Deutsch.",
        "fr": "Réponds en français.",
    }.get(lang, "Respond in the same language as the input text.")

    system_prompt = f"""You are a warm, empathetic writing assistant for a Memory Book application.
Your job is to take a user's rough notes about someone's life memories and expand them into a richer, more vivid, personal narrative — while keeping the SAME facts, names, places, and events.

Rules:
- Keep ALL original facts, names, dates, and details. Do NOT invent new facts.
- Expand the text to be 2-3x longer with sensory details, emotions, and atmosphere.
- Write in first person if the original is in first person, or third person if original is third person.
- Use a warm, loving, nostalgic tone.
- Do NOT add any prefixes, headers, or explanations. Return ONLY the enhanced text.
- {lang_instruction}"""

    user_prompt = f"Context: this text describes the '{request.field_context}' phase/aspect of someone's life.\n\nOriginal text:\n{request.text}"

    try:
        gemini_client = GeminiClient(
            api_key=config.google_api_key,
            model=config.gemini_model
        )
        enhanced = await gemini_client.generate_text(system_prompt, user_prompt)

        if not enhanced or len(enhanced.strip()) < 10:
            raise HTTPException(status_code=500, detail="AI returned an empty or too-short response")

        logger.info(f"[enhance-text] Enhanced from {len(request.text)} to {len(enhanced)} chars")
        return EnhanceTextResponse(enhanced_text=enhanced.strip(), original_text=request.text)

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"[enhance-text] Failed: {e}")
        raise HTTPException(status_code=500, detail=f"Text enhancement failed: {str(e)}")


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
            "enhance_text": "POST /enhance-text",
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
