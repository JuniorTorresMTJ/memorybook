"""
Visual Models

Models for visual analysis and fingerprinting.
"""

from typing import Optional
from pydantic import BaseModel, Field


class FacialFeatures(BaseModel):
    """Extracted facial features from reference images."""
    
    face_shape: str = Field(
        default="",
        description="Shape of the face (oval, round, square, heart, etc.)"
    )
    eye_color: str = Field(
        default="",
        description="Color of the eyes"
    )
    eye_shape: str = Field(
        default="",
        description="Shape of the eyes (almond, round, hooded, etc.)"
    )
    hair_color: str = Field(
        default="",
        description="Color of the hair"
    )
    hair_style: str = Field(
        default="",
        description="Style of the hair (short, long, curly, straight, etc.)"
    )
    skin_tone: str = Field(
        default="",
        description="Skin tone description"
    )
    distinctive_features: list[str] = Field(
        default_factory=list,
        description="Unique identifying features (glasses, freckles, dimples, etc.)"
    )
    estimated_age_range: str = Field(
        default="",
        description="Estimated age range from the images"
    )


class BodyCharacteristics(BaseModel):
    """Body characteristics extracted from reference images."""
    
    body_type: str = Field(
        default="",
        description="General body type description"
    )
    height_estimate: str = Field(
        default="",
        description="Estimated height category (short, average, tall)"
    )
    posture: str = Field(
        default="",
        description="Typical posture observed"
    )
    clothing_style: list[str] = Field(
        default_factory=list,
        description="Common clothing styles observed"
    )


class StyleAttributes(BaseModel):
    """Style-specific attributes for consistent illustration."""
    
    color_palette: list[str] = Field(
        default_factory=list,
        description="Recommended color palette for illustrations"
    )
    line_weight: str = Field(
        default="medium",
        description="Recommended line weight for the style"
    )
    shading_style: str = Field(
        default="",
        description="Recommended shading approach"
    )
    detail_level: str = Field(
        default="medium",
        description="Level of detail (low, medium, high)"
    )


class VisualFingerprint(BaseModel):
    """Complete visual fingerprint for consistent character representation."""
    
    subject_id: str = Field(
        default="",
        description="Unique identifier for the subject"
    )
    facial_features: FacialFeatures = Field(
        default_factory=FacialFeatures,
        description="Extracted facial features"
    )
    body_characteristics: BodyCharacteristics = Field(
        default_factory=BodyCharacteristics,
        description="Body characteristics"
    )
    style_attributes: StyleAttributes = Field(
        default_factory=StyleAttributes,
        description="Style-specific rendering attributes"
    )
    reference_image_analysis: list[dict] = Field(
        default_factory=list,
        description="Analysis results for each reference image"
    )
    consistency_notes: list[str] = Field(
        default_factory=list,
        description="Notes for maintaining visual consistency"
    )
    age_variations: dict[str, str] = Field(
        default_factory=dict,
        description="How to represent the subject at different ages"
    )
    
    def get_prompt_description(self) -> str:
        """Generate a text description for use in image generation prompts."""
        parts = []
        
        if self.facial_features.face_shape:
            parts.append(f"{self.facial_features.face_shape} face")
        if self.facial_features.eye_color:
            parts.append(f"{self.facial_features.eye_color} eyes")
        if self.facial_features.hair_color and self.facial_features.hair_style:
            parts.append(f"{self.facial_features.hair_color} {self.facial_features.hair_style} hair")
        if self.facial_features.skin_tone:
            parts.append(f"{self.facial_features.skin_tone} skin")
        
        for feature in self.facial_features.distinctive_features:
            parts.append(feature)
        
        return ", ".join(parts) if parts else "person"
