"""
Validation Graph

Validation loop implementation (fallback if LangGraph not available).
"""

from typing import List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

import sys
sys.path.append('..')

from models.generation import GenerationResult
from models.prompts import PromptItem
from models.visual import VisualFingerprint
from models.review import ImageQCResult


class ValidationState(Enum):
    """States in the validation graph."""
    VALIDATE = "validate"
    FIX = "fix"
    REGENERATE = "regenerate"
    COMPLETE = "complete"
    FAILED = "failed"


@dataclass
class ValidationContext:
    """Context for validation loop."""
    result: GenerationResult
    prompt: PromptItem
    fingerprint: VisualFingerprint
    qc_result: Optional[ImageQCResult] = None
    fixed_prompt: Optional[PromptItem] = None
    retry_count: int = 0
    max_retries: int = 2
    state: ValidationState = ValidationState.VALIDATE


class ValidationGraph:
    """
    Simple validation graph implementation.
    
    Provides a state machine for image validation and fixing
    without requiring LangGraph.
    """
    
    def __init__(self, validator, fixer, image_client):
        """
        Initialize the validation graph.
        
        Args:
            validator: ImageValidatorAgent instance
            fixer: IterativeFixAgent instance
            image_client: Image generation client
        """
        self.validator = validator
        self.fixer = fixer
        self.image_client = image_client
    
    async def run(
        self,
        result: GenerationResult,
        prompt: PromptItem,
        fingerprint: VisualFingerprint,
        reference_images: List[str],
        output_path: str,
        max_retries: int = 2
    ) -> Tuple[GenerationResult, int]:
        """
        Run the validation graph for a single image.
        
        Args:
            result: Initial generation result
            prompt: Original prompt
            fingerprint: Visual fingerprint
            reference_images: Reference image paths
            output_path: Output path for regenerated images
            max_retries: Maximum retry attempts
            
        Returns:
            Tuple of (final result, retry count)
        """
        context = ValidationContext(
            result=result,
            prompt=prompt,
            fingerprint=fingerprint,
            max_retries=max_retries
        )
        
        while context.state not in [ValidationState.COMPLETE, ValidationState.FAILED]:
            context = await self._step(context, reference_images, output_path)
        
        return context.result, context.retry_count
    
    async def _step(
        self,
        context: ValidationContext,
        reference_images: List[str],
        output_path: str
    ) -> ValidationContext:
        """Execute one step of the validation graph."""
        
        if context.state == ValidationState.VALIDATE:
            return await self._validate(context)
        
        elif context.state == ValidationState.FIX:
            return await self._fix(context)
        
        elif context.state == ValidationState.REGENERATE:
            return await self._regenerate(context, reference_images, output_path)
        
        return context
    
    async def _validate(self, context: ValidationContext) -> ValidationContext:
        """Validate the current image."""
        page_num = context.prompt.page_number
        
        qc_result = await self.validator.execute(
            (context.result, context.fingerprint, page_num)
        )
        context.qc_result = qc_result
        
        if qc_result.passed:
            context.state = ValidationState.COMPLETE
        elif context.retry_count >= context.max_retries:
            context.state = ValidationState.FAILED
        else:
            context.state = ValidationState.FIX
        
        return context
    
    async def _fix(self, context: ValidationContext) -> ValidationContext:
        """Create a fixed prompt."""
        fixed_prompt = await self.fixer.execute(
            (context.prompt, context.qc_result, context.fingerprint)
        )
        context.fixed_prompt = fixed_prompt
        context.state = ValidationState.REGENERATE
        
        return context
    
    async def _regenerate(
        self,
        context: ValidationContext,
        reference_images: List[str],
        output_path: str
    ) -> ValidationContext:
        """Regenerate the image with the fixed prompt."""
        prompt = context.fixed_prompt or context.prompt
        
        new_result = await self.image_client.generate_image(
            prompt=prompt.get_full_prompt(),
            reference_images=reference_images,
            render_params=prompt.render_params.model_dump(),
            output_path=output_path
        )
        
        context.result = new_result
        context.prompt = prompt
        context.retry_count += 1
        context.state = ValidationState.VALIDATE
        
        return context


class BatchValidationGraph:
    """
    Batch validation for multiple images.
    
    Runs validation in parallel where possible.
    """
    
    def __init__(self, validator, fixer, image_client):
        """
        Initialize the batch validation graph.
        
        Args:
            validator: ImageValidatorAgent instance
            fixer: IterativeFixAgent instance
            image_client: Image generation client
        """
        self.single_graph = ValidationGraph(validator, fixer, image_client)
    
    async def run_batch(
        self,
        results: List[GenerationResult],
        prompts: List[PromptItem],
        fingerprint: VisualFingerprint,
        reference_images: List[str],
        output_dir: str,
        max_retries: int = 2
    ) -> Tuple[List[GenerationResult], int]:
        """
        Run validation for a batch of images.
        
        Args:
            results: List of generation results
            prompts: List of prompts
            fingerprint: Visual fingerprint
            reference_images: Reference image paths
            output_dir: Output directory
            max_retries: Maximum retries per image
            
        Returns:
            Tuple of (final results, total retries)
        """
        import asyncio
        
        total_retries = 0
        final_results = []
        
        # Process each image
        tasks = []
        for i, (result, prompt) in enumerate(zip(results, prompts)):
            # Determine output path
            if prompt.prompt_type == "cover":
                output_path = f"{output_dir}/cover.png"
            elif prompt.prompt_type == "back_cover":
                output_path = f"{output_dir}/back_cover.png"
            else:
                output_path = f"{output_dir}/page_{prompt.page_number:02d}.png"
            
            task = self.single_graph.run(
                result=result,
                prompt=prompt,
                fingerprint=fingerprint,
                reference_images=reference_images,
                output_path=output_path,
                max_retries=max_retries
            )
            tasks.append(task)
        
        # Run all validations
        results_with_retries = await asyncio.gather(*tasks)
        
        for final_result, retries in results_with_retries:
            final_results.append(final_result)
            total_retries += retries
        
        return final_results, total_retries
