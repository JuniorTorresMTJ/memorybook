"""
Pipeline Runner

Main pipeline orchestration for book generation.
"""

import asyncio
import os
import uuid
from typing import Optional
from logging import Logger
from datetime import datetime

import sys
sys.path.append('..')

from models.user_input import UserForm, BookPreferences, ReferenceImages
from models.profile import NormalizedProfile
from models.visual import VisualFingerprint
from models.planning import NarrativePlan
from models.prompts import PromptItem
from models.generation import GenerationResult
from models.review import IllustrationReviewItem, DesignReview
from models.output import FinalBookPackage, BookPage

from agents.normalizer import NormalizerAgent
from agents.narrative_planner import NarrativePlannerAgent
from agents.visual_analyzer import VisualAnalyzerAgent
from agents.character_sheet_generator import CharacterSheetGeneratorAgent
from agents.cover_creator import CoverCreatorAgent
from agents.back_cover_creator import BackCoverCreatorAgent
from agents.prompt_writer import PromptWriterAgent
from agents.prompt_reviewer import PromptReviewerAgent
from agents.illustrator_reviewer import IllustratorReviewerAgent
from agents.designer_reviewer import DesignerReviewerAgent
from agents.image_validator import ImageValidatorAgent
from agents.iterative_fix import IterativeFixAgent

from clients.gemini_client import GeminiClient

from utils.logging import PipelineLogger
from utils.config import get_config
from utils.file_utils import ensure_directory

from prompts.language_utils import resolve_language


class GeminiImageClient:
    """
    Wrapper for Gemini image generation.
    
    Provides the same interface as NanoBananaProClient but uses
    Gemini's native image generation capabilities.
    """
    
    def __init__(self, gemini_client: GeminiClient):
        """Initialize with a Gemini client."""
        self.gemini = gemini_client
    
    async def generate_image(
        self,
        prompt: str,
        reference_images: Optional[list[str]] = None,
        render_params: Optional[dict] = None,
        output_path: Optional[str] = None
    ):
        """Generate an image using Gemini."""
        return await self.gemini.generate_image(
            prompt=prompt,
            output_path=output_path,
            reference_images=reference_images,
            render_params=render_params
        )
    
    async def close(self):
        """Close the client."""
        await self.gemini.close()


class PipelineRunner:
    """
    Main pipeline runner for book generation.
    
    Orchestrates all agents and manages the generation flow.
    """
    
    def __init__(self, gemini_client: GeminiClient, logger: Logger):
        """
        Initialize the pipeline runner.
        
        Args:
            gemini_client: Gemini client for AI operations
            logger: Logger instance
        """
        self.gemini = gemini_client
        self.logger = logger
        self.config = get_config()
        
        # Initialize image generation client using Gemini
        self.image_client = GeminiImageClient(gemini_client)
        
        # Initialize agents
        self._init_agents()
    
    def _init_agents(self):
        """Initialize all agents."""
        self.normalizer = NormalizerAgent(self.gemini, self.logger)
        self.narrative_planner = NarrativePlannerAgent(self.gemini, self.logger)
        self.visual_analyzer = VisualAnalyzerAgent(self.gemini, self.logger)
        self.character_sheet_generator = CharacterSheetGeneratorAgent(self.gemini, self.logger)
        self.cover_creator = CoverCreatorAgent(self.gemini, self.logger)
        self.back_cover_creator = BackCoverCreatorAgent(self.gemini, self.logger)
        self.prompt_writer = PromptWriterAgent(self.gemini, self.logger)
        self.prompt_reviewer = PromptReviewerAgent(self.gemini, self.logger)
        self.illustrator_reviewer = IllustratorReviewerAgent(self.gemini, self.logger)
        self.designer_reviewer = DesignerReviewerAgent(self.gemini, self.logger)
        self.image_validator = ImageValidatorAgent(self.gemini, self.logger)
        self.iterative_fix = IterativeFixAgent(self.gemini, self.logger)
    
    async def run(
        self,
        user_form: UserForm,
        preferences: BookPreferences,
        reference_images: ReferenceImages,
        user_language: str = "en-US",
        max_retries: int = 2
    ) -> FinalBookPackage:
        """
        Run the complete pipeline.
        
        Args:
            user_form: User's form data
            preferences: Book preferences
            reference_images: Reference images
            user_language: User's language (e.g., "pt-BR", "en-US")
            max_retries: Maximum retries for failed images
            
        Returns:
            FinalBookPackage with the complete book
        """
        job_id = str(uuid.uuid4())
        pipeline_logger = PipelineLogger(job_id, self.logger)
        start_time = datetime.now()
        
        # Normalize language
        user_language = resolve_language(user_language)
        
        # Create output directory
        output_dir = ensure_directory(f"{self.config.output_directory}/{job_id}")
        
        pipeline_logger.log_progress(f"Starting pipeline (language: {user_language})")
        
        try:
            # Phase 1: Normalize user input
            pipeline_logger.start_step("Normalization")
            normalized_profile = await self.normalizer.execute((user_form, preferences, user_language))
            pipeline_logger.end_step("Normalization")
            
            # Phase 2: Parallel planning and visual analysis
            pipeline_logger.start_step("Planning & Visual Analysis")
            narrative_plan, visual_fingerprint = await asyncio.gather(
                self.narrative_planner.execute((normalized_profile, preferences, user_language)),
                self.visual_analyzer.execute((reference_images, preferences, user_language))
            )
            pipeline_logger.end_step("Planning & Visual Analysis")
            
            # Phase 2.5: Generate character reference sheet
            # This creates a visual anchor for maintaining character consistency
            pipeline_logger.start_step("Character Sheet Generation")
            character_sheet_path = await self.character_sheet_generator.execute(
                (visual_fingerprint, preferences, reference_images, output_dir, user_language)
            )
            
            # Build the consolidated reference images list:
            # original user photos + character sheet
            all_reference_images = list(reference_images.paths)
            if character_sheet_path:
                all_reference_images.append(character_sheet_path)
                visual_fingerprint.character_sheet_path = character_sheet_path
                pipeline_logger.log_progress(f"Character sheet generated: {character_sheet_path}")
            else:
                pipeline_logger.log_progress("Character sheet generation skipped or failed - continuing without it")
            pipeline_logger.end_step("Character Sheet Generation")
            
            # Phase 3: Create prompts (parallel)
            pipeline_logger.start_step("Prompt Creation")
            cover_prompt, back_cover_prompt, page_prompts = await asyncio.gather(
                self.cover_creator.execute((narrative_plan.cover, visual_fingerprint, preferences, user_language)),
                self.back_cover_creator.execute((narrative_plan.back_cover, visual_fingerprint, preferences, user_language)),
                self.prompt_writer.execute((narrative_plan, visual_fingerprint, preferences, user_language))
            )
            pipeline_logger.end_step("Prompt Creation")
            
            # Combine all prompts
            all_prompts = [cover_prompt] + page_prompts + [back_cover_prompt]
            
            # Phase 4: Review prompts
            pipeline_logger.start_step("Prompt Review")
            reviewed_prompts = await self.prompt_reviewer.execute((all_prompts, user_language))
            pipeline_logger.end_step("Prompt Review")
            
            # Phase 5: Generate images (always pass all reference images)
            pipeline_logger.start_step("Image Generation")
            generation_results = await self._generate_all_images(
                reviewed_prompts,
                all_reference_images,
                output_dir
            )
            pipeline_logger.end_step("Image Generation")
            
            # Phase 6: Review illustrations
            pipeline_logger.start_step("Illustration Review")
            illustration_reviews = await self.illustrator_reviewer.execute(
                (generation_results, preferences, user_language)
            )
            pipeline_logger.end_step("Illustration Review")
            
            # Phase 7: Design review
            pipeline_logger.start_step("Design Review")
            design_review = await self.designer_reviewer.execute(
                (generation_results, illustration_reviews, preferences, user_language)
            )
            pipeline_logger.end_step("Design Review")
            
            # Phase 8: Validation and fixing loop
            pipeline_logger.start_step("Validation & Fixing")
            final_results, total_retries = await self._validation_loop(
                generation_results,
                reviewed_prompts,
                visual_fingerprint,
                all_reference_images,
                output_dir,
                user_language,
                max_retries
            )
            pipeline_logger.end_step("Validation & Fixing")
            
            # Build final package
            pipeline_logger.start_step("Package Assembly")
            final_package = self._build_final_package(
                job_id,
                preferences,
                final_results,
                reviewed_prompts,
                narrative_plan,
                visual_fingerprint,
                design_review,
                output_dir,
                int((datetime.now() - start_time).total_seconds() * 1000),
                total_retries
            )
            pipeline_logger.end_step("Package Assembly")
            
            pipeline_logger.log_progress(f"Pipeline completed in {pipeline_logger.get_total_time():.2f}s")
            
            return final_package
            
        except Exception as e:
            pipeline_logger.log_error(f"Pipeline failed: {str(e)}")
            raise
        finally:
            # Cleanup
            await self.image_client.close()
    
    async def _generate_all_images(
        self,
        prompts: list[PromptItem],
        reference_images: list[str],
        output_dir: str
    ) -> list[GenerationResult]:
        """Generate all images from prompts with retry on failure.
        
        Always passes reference images (user photos + character sheet) to ensure
        character consistency across all pages.
        """
        
        async def generate_single(prompt: PromptItem) -> GenerationResult:
            """Generate a single image with up to 3 retries."""
            if prompt.prompt_type == "cover":
                filename = "cover.jpg"
            elif prompt.prompt_type == "back_cover":
                filename = "back_cover.jpg"
            else:
                filename = f"page_{prompt.page_number:02d}.jpg"
            
            output_path = f"{output_dir}/{filename}"
            
            # Always pass reference images for character consistency
            # Only skip for back cover which typically doesn't feature the character
            refs = reference_images if (reference_images and prompt.prompt_type != "back_cover") else None
            
            max_attempts = 3
            for attempt in range(max_attempts):
                result = await self.image_client.generate_image(
                    prompt=prompt.get_full_prompt(),
                    reference_images=refs,
                    render_params=prompt.render_params.model_dump(),
                    output_path=output_path
                )
                
                if result.success:
                    return result
                
                if attempt < max_attempts - 1:
                    self.logger.warning(
                        f"Image generation failed for {filename} (attempt {attempt + 1}), retrying..."
                    )
                    await asyncio.sleep(1)  # Brief delay before retry
            
            # Return last failed result
            return result
        
        # Generate images with limited concurrency (2 at a time to avoid API limits)
        semaphore = asyncio.Semaphore(2)
        
        async def generate_with_limit(prompt: PromptItem) -> GenerationResult:
            async with semaphore:
                return await generate_single(prompt)
        
        results = await asyncio.gather(
            *[generate_with_limit(prompt) for prompt in prompts]
        )
        
        return list(results)
    
    async def _validation_loop(
        self,
        results: list[GenerationResult],
        prompts: list[PromptItem],
        fingerprint: VisualFingerprint,
        reference_images: list[str],
        output_dir: str,
        user_language: str,
        max_retries: int
    ) -> tuple[list[GenerationResult], int]:
        """Run validation and fixing loop."""
        total_retries = 0
        final_results = list(results)
        
        for retry in range(max_retries):
            # Validate all images
            validation_results = []
            for i, result in enumerate(final_results):
                page_num = prompts[i].page_number
                qc_result = await self.image_validator.execute((result, fingerprint, page_num, user_language))
                validation_results.append(qc_result)
            
            # Find images that need regeneration
            failed_indices = [
                i for i, qc in enumerate(validation_results)
                if qc.requires_regeneration
            ]
            
            if not failed_indices:
                break
            
            # Fix and regenerate failed images
            for idx in failed_indices:
                # Create repair prompt
                fixed_prompt = await self.iterative_fix.execute(
                    (prompts[idx], validation_results[idx], fingerprint, user_language)
                )
                
                # Regenerate image
                if fixed_prompt.prompt_type == "cover":
                    filename = "cover.jpg"
                elif fixed_prompt.prompt_type == "back_cover":
                    filename = "back_cover.jpg"
                else:
                    filename = f"page_{fixed_prompt.page_number:02d}.jpg"
                
                output_path = f"{output_dir}/{filename}"
                
                new_result = await self.image_client.generate_image(
                    prompt=fixed_prompt.get_full_prompt(),
                    reference_images=reference_images,
                    render_params=fixed_prompt.render_params.model_dump(),
                    output_path=output_path
                )
                
                final_results[idx] = new_result
                total_retries += 1
        
        return final_results, total_retries
    
    @staticmethod
    def _to_relative_path(image_path: str) -> str:
        """Convert an absolute image path to just the filename."""
        if not image_path:
            return ""
        # Handle both Windows (\\) and Unix (/) paths
        return image_path.replace("\\", "/").split("/")[-1]
    
    def _build_final_package(
        self,
        book_id: str,
        preferences: BookPreferences,
        results: list[GenerationResult],
        prompts: list[PromptItem],
        narrative_plan: NarrativePlan,
        fingerprint: VisualFingerprint,
        design_review: DesignReview,
        output_dir: str,
        total_time_ms: int,
        total_retries: int
    ) -> FinalBookPackage:
        """Build the final book package."""
        # Find cover, back cover, and pages
        cover_result = None
        back_cover_result = None
        page_results = []
        
        for i, prompt in enumerate(prompts):
            if prompt.prompt_type == "cover":
                cover_result = (results[i], prompt)
            elif prompt.prompt_type == "back_cover":
                back_cover_result = (results[i], prompt)
            else:
                page_results.append((results[i], prompt))
        
        # Sort pages by page number
        page_results.sort(key=lambda x: x[1].page_number)
        
        # Create BookPage objects (using relative filenames, not absolute paths)
        # Also embed base64 image data so images survive Cloud Run restarts
        cover_image_path = self._to_relative_path(cover_result[0].image_path or "")
        cover_public_url = None
        if cover_result and cover_result[0].image_path:
            from store.file_storage import upload_output_image
            cover_public_url = upload_output_image(book_id, cover_image_path, cover_result[0].image_path)

        cover_page = BookPage(
            page_number=0,
            page_type="cover",
            image_path=cover_public_url or cover_image_path,
            generation_attempts=cover_result[0].metadata.retry_count + 1
        ) if cover_result else None
        
        back_cover_image_path = self._to_relative_path(back_cover_result[0].image_path or "")
        back_cover_public_url = None
        if back_cover_result and back_cover_result[0].image_path:
            from store.file_storage import upload_output_image
            back_cover_public_url = upload_output_image(book_id, back_cover_image_path, back_cover_result[0].image_path)

        back_cover_page = BookPage(
            page_number=-1,
            page_type="back_cover",
            image_path=back_cover_public_url or back_cover_image_path,
            generation_attempts=back_cover_result[0].metadata.retry_count + 1
        ) if back_cover_result else None
        
        content_pages = []
        for result, prompt in page_results:
            # Find corresponding page plan
            page_plan = next(
                (p for p in narrative_plan.pages if p.page_number == prompt.page_number),
                None
            )
            
            page_image_path = self._to_relative_path(result.image_path or "")
            page_public_url = None
            if result.image_path:
                from store.file_storage import upload_output_image
                page_public_url = upload_output_image(book_id, page_image_path, result.image_path)

            content_pages.append(BookPage(
                page_number=prompt.page_number,
                page_type="content",
                image_path=page_public_url or page_image_path,
                narrative_text=page_plan.narrative_text if page_plan else None,
                life_phase=page_plan.life_phase if page_plan else None,
                memory_reference=page_plan.memory_reference if page_plan else None,
                generation_attempts=result.metadata.retry_count + 1
            ))
        
        return FinalBookPackage(
            book_id=book_id,
            title=preferences.title,
            style=preferences.style,
            cover=cover_page,
            back_cover=back_cover_page,
            pages=content_pages,
            total_pages=preferences.page_count + 2,  # Including covers
            narrative_plan=narrative_plan,
            visual_fingerprint=fingerprint,
            design_review=design_review,
            total_generation_time_ms=total_time_ms,
            total_retries=total_retries,
            output_directory=output_dir
        )
