"""
Generation Models

Models for image generation results.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class GenerationMetadata(BaseModel):
    """Metadata about an image generation."""
    
    generation_id: str = Field(
        ...,
        description="Unique identifier for this generation"
    )
    prompt_version: int = Field(
        default=1,
        description="Version of the prompt used"
    )
    model_used: str = Field(
        default="",
        description="Name of the model used for generation"
    )
    generation_time_ms: int = Field(
        default=0,
        ge=0,
        description="Time taken to generate in milliseconds"
    )
    seed_used: Optional[int] = Field(
        default=None,
        description="Random seed used for generation"
    )
    timestamp: datetime = Field(
        default_factory=datetime.now,
        description="When the generation occurred"
    )
    parameters: dict = Field(
        default_factory=dict,
        description="Generation parameters used"
    )
    retry_count: int = Field(
        default=0,
        ge=0,
        description="Number of retries before success"
    )


class GenerationResult(BaseModel):
    """Result of an image generation."""
    
    success: bool = Field(
        ...,
        description="Whether the generation was successful"
    )
    image_path: Optional[str] = Field(
        default=None,
        description="Path to the generated image"
    )
    image_url: Optional[str] = Field(
        default=None,
        description="URL of the generated image (if hosted)"
    )
    thumbnail_path: Optional[str] = Field(
        default=None,
        description="Path to a thumbnail version"
    )
    metadata: GenerationMetadata = Field(
        default_factory=lambda: GenerationMetadata(generation_id=""),
        description="Generation metadata"
    )
    error_message: Optional[str] = Field(
        default=None,
        description="Error message if generation failed"
    )
    warnings: list[str] = Field(
        default_factory=list,
        description="Any warnings during generation"
    )
    
    @property
    def has_image(self) -> bool:
        """Check if the result has a valid image."""
        return self.success and (self.image_path is not None or self.image_url is not None)
    
    def get_image_location(self) -> Optional[str]:
        """Get the image location (path or URL)."""
        return self.image_path or self.image_url
