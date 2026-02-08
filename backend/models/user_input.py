"""
User Input Models

Models for capturing user form data and book preferences.
"""

from typing import Literal, Optional
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


class PhysicalCharacteristics(BaseModel):
    """Physical characteristics of the book subject, provided via form input."""
    
    name: str = Field(
        default="",
        description="Name of the person"
    )
    gender: Optional[Literal["male", "female"]] = Field(
        default=None,
        description="Gender of the person"
    )
    skin_color: Optional[str] = Field(
        default=None,
        description="Skin color/tone (e.g., light, fair, medium, olive, tan, brown, dark)"
    )
    hair_color: Optional[str] = Field(
        default=None,
        description="Hair color (e.g., blonde, brown, black, red, gray, white)"
    )
    hair_style: Optional[str] = Field(
        default=None,
        description="Hair style (e.g., short, medium, long, curly, wavy, bald)"
    )
    has_glasses: bool = Field(
        default=False,
        description="Whether the person wears glasses"
    )
    has_facial_hair: bool = Field(
        default=False,
        description="Whether the person has facial hair"
    )
    
    def to_description(self) -> str:
        """Convert physical characteristics to a natural language description."""
        parts = []
        
        if self.gender:
            parts.append("male" if self.gender == "male" else "female")
        
        if self.skin_color:
            parts.append(f"{self.skin_color} skin tone")
        
        if self.hair_color and self.hair_style:
            parts.append(f"{self.hair_color} {self.hair_style} hair")
        elif self.hair_color:
            parts.append(f"{self.hair_color} hair")
        elif self.hair_style:
            parts.append(f"{self.hair_style} hair")
        
        if self.has_glasses:
            parts.append("wearing glasses")
        
        if self.has_facial_hair:
            parts.append("with facial hair")
        
        if self.name:
            return f"{self.name}: {', '.join(parts)}" if parts else self.name
        
        return ", ".join(parts) if parts else "person"


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
    """Reference images and physical characteristics provided by the user."""
    
    paths: list[str] = Field(
        default_factory=list,
        description="Paths to reference images (optional)"
    )
    physical_characteristics: Optional[PhysicalCharacteristics] = Field(
        default=None,
        description="Physical characteristics from form input (optional)"
    )
    reference_input_mode: Literal["photos", "characteristics"] = Field(
        default="photos",
        description="Whether the user provided photos or typed characteristics"
    )
    
    def has_images(self) -> bool:
        """Check if any reference images are provided."""
        return len(self.paths) > 0
    
    def has_characteristics(self) -> bool:
        """Check if physical characteristics are provided."""
        return (
            self.physical_characteristics is not None 
            and bool(self.physical_characteristics.name)
        )
    
    def has_any_reference(self) -> bool:
        """Check if any form of reference (images or characteristics) is available."""
        return self.has_images() or self.has_characteristics()
