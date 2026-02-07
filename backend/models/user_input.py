"""
User Input Models

Models for capturing user form data and book preferences.
"""

from typing import Literal
from pydantic import BaseModel, Field


class LifePhase(BaseModel):
    """Represents memories and events from a specific life phase."""
    
    memories: list[str] = Field(
        default_factory=list,
        description="List of memorable moments from this life phase"
    )
    key_events: list[str] = Field(
        default_factory=list,
        description="Important life events during this phase"
    )
    emotions: list[str] = Field(
        default_factory=list,
        description="Dominant emotions associated with this phase"
    )


class UserForm(BaseModel):
    """Complete user form with memories from all life phases."""
    
    young: LifePhase = Field(
        default_factory=LifePhase,
        description="Childhood memories (0-12 years)"
    )
    adolescent: LifePhase = Field(
        default_factory=LifePhase,
        description="Teenage memories (13-19 years)"
    )
    adult: LifePhase = Field(
        default_factory=LifePhase,
        description="Adult life memories (20-59 years)"
    )
    elderly: LifePhase = Field(
        default_factory=LifePhase,
        description="Later life memories (60+ years)"
    )


class BookPreferences(BaseModel):
    """User preferences for the memory book."""
    
    title: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Title of the memory book"
    )
    date: str = Field(
        ...,
        description="Date associated with the book (e.g., birthday, anniversary)"
    )
    page_count: Literal[10, 15, 20] = Field(
        default=10,
        description="Number of pages in the book"
    )
    style: Literal["coloring", "cartoon", "anime", "watercolor"] = Field(
        default="watercolor",
        description="Illustration style for the book"
    )


class ReferenceImages(BaseModel):
    """Reference images provided by the user."""
    
    paths: list[str] = Field(
        default_factory=list,
        description="Paths to reference images (optional)"
    )
    
    def has_images(self) -> bool:
        """Check if any images are provided."""
        return len(self.paths) > 0
