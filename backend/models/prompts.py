"""
Prompts Models

Models for image generation prompts.
"""

from typing import Optional, Literal
from pydantic import BaseModel, Field


class RenderParams(BaseModel):
    """Parameters for image rendering."""
    
    width: int = Field(
        default=1024,
        ge=512,
        le=2048,
        description="Image width in pixels"
    )
    height: int = Field(
        default=1024,
        ge=512,
        le=2048,
        description="Image height in pixels"
    )
    style_preset: str = Field(
        default="",
        description="Style preset for the renderer"
    )
    guidance_scale: float = Field(
        default=7.5,
        ge=1.0,
        le=20.0,
        description="Guidance scale for generation"
    )
    num_inference_steps: int = Field(
        default=50,
        ge=20,
        le=100,
        description="Number of inference steps"
    )
    seed: Optional[int] = Field(
        default=None,
        description="Random seed for reproducibility"
    )
    use_reference_images: bool = Field(
        default=True,
        description="Whether to use reference images for consistency"
    )
    reference_weight: float = Field(
        default=0.8,
        ge=0.0,
        le=1.0,
        description="Weight of reference images in generation"
    )


class PromptItem(BaseModel):
    """Complete prompt for a single image generation."""
    
    page_number: int = Field(
        ...,
        description="Page number this prompt is for (0 for cover, -1 for back cover)"
    )
    prompt_type: Literal["cover", "back_cover", "page"] = Field(
        ...,
        description="Type of prompt"
    )
    main_prompt: str = Field(
        ...,
        min_length=10,
        description="Main generation prompt"
    )
    character_description: str = Field(
        default="",
        description="Description of the main character for consistency"
    )
    scene_description: str = Field(
        default="",
        description="Description of the scene"
    )
    style_prompt: str = Field(
        default="",
        description="Style-specific prompt additions"
    )
    negative_constraints: list[str] = Field(
        default_factory=list,
        description="Things to avoid in the generation"
    )
    render_params: RenderParams = Field(
        default_factory=RenderParams,
        description="Rendering parameters"
    )
    reference_image_paths: list[str] = Field(
        default_factory=list,
        description="Paths to reference images to use"
    )
    revision_notes: list[str] = Field(
        default_factory=list,
        description="Notes from prompt review"
    )
    version: int = Field(
        default=1,
        ge=1,
        description="Version number of this prompt"
    )
    
    def get_full_prompt(self) -> str:
        """Combine all prompt components into a single string."""
        parts = [self.main_prompt]
        
        if self.character_description:
            parts.append(f"Character: {self.character_description}")
        
        if self.scene_description:
            parts.append(f"Scene: {self.scene_description}")
        
        if self.style_prompt:
            parts.append(self.style_prompt)
        
        # CRITICAL: Always append no-text instruction to prevent misspelled words in images
        parts.append("IMPORTANT: Do NOT include any text, letters, words, numbers, captions, titles, labels, signs, or typography anywhere in the image. The image must be purely visual with zero written content")
        
        return ". ".join(parts)
    
    def get_negative_prompt(self) -> str:
        """Get the negative prompt string."""
        default_negatives = [
            "blurry",
            "low quality",
            "distorted",
            "deformed",
            "ugly",
            "duplicate",
            "watermark",
            "text",
            "signature",
            "letters",
            "words",
            "numbers",
            "typography",
            "captions",
            "labels",
            "signs",
            "written content",
        ]
        all_negatives = default_negatives + self.negative_constraints
        return ", ".join(all_negatives)
