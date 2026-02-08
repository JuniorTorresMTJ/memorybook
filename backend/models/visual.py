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
    do_not_change: list[str] = Field(
        default_factory=list,
        description="Critical features that must remain identical across all illustrations"
    )
    character_sheet_path: Optional[str] = Field(
        default=None,
        description="Path to the generated character reference sheet image"
    )
    
    def get_prompt_description(self) -> str:
        """Generate a detailed text description for use in image generation prompts."""
        parts = []
        
        # Subject name
        if self.subject_id and self.subject_id != "unknown":
            parts.append(f"character named {self.subject_id}")
        
        # Facial features
        if self.facial_features.face_shape:
            parts.append(f"{self.facial_features.face_shape} face shape")
        if self.facial_features.eye_color and self.facial_features.eye_shape:
            parts.append(f"{self.facial_features.eye_color} {self.facial_features.eye_shape} eyes")
        elif self.facial_features.eye_color:
            parts.append(f"{self.facial_features.eye_color} eyes")
        if self.facial_features.hair_color and self.facial_features.hair_style:
            parts.append(f"{self.facial_features.hair_color} {self.facial_features.hair_style} hair")
        elif self.facial_features.hair_color:
            parts.append(f"{self.facial_features.hair_color} hair")
        if self.facial_features.skin_tone:
            parts.append(f"{self.facial_features.skin_tone} skin tone")
        
        # Distinctive features
        for feature in self.facial_features.distinctive_features:
            parts.append(feature)
        
        # Body characteristics
        if self.body_characteristics.body_type:
            parts.append(f"{self.body_characteristics.body_type} build")
        
        return ", ".join(parts) if parts else "person"
    
    def get_age_adjusted_description(self, life_phase: str) -> str:
        """
        Get a complete character description adjusted for a specific life phase.
        
        Args:
            life_phase: One of 'young', 'adolescent', 'adult', 'elderly'
            
        Returns:
            Full character description appropriate for the life phase
        """
        # Use age variation if available
        age_desc = self.age_variations.get(life_phase, "")
        base_desc = self.get_prompt_description()
        
        if age_desc:
            # Combine age-specific description with base features
            return f"{age_desc}. Core identity features: {base_desc}"
        
        # Fallback: add generic age context to base description
        age_context = {
            "young": "as a child (approximately 6-10 years old), with youthful round face and bright eyes",
            "adolescent": "as a teenager (approximately 14-17 years old), with developing features",
            "adult": "as an adult (approximately 30-45 years old), with mature features",
            "elderly": "in later years (approximately 70-80 years old), with gentle wrinkles and wise expression",
        }
        
        context = age_context.get(life_phase, "")
        if context:
            return f"{base_desc}, depicted {context}"
        
        return base_desc
    
    def get_character_identity_block(self) -> str:
        """
        Generate a strong CHARACTER IDENTITY block for inclusion in image generation prompts.
        This ensures the AI model prioritizes character consistency.
        
        Returns:
            A formatted string block with character identity instructions
        """
        parts = []
        
        parts.append("=== CHARACTER IDENTITY (MUST MATCH EXACTLY) ===")
        parts.append(f"Character: {self.get_prompt_description()}")
        
        if self.do_not_change:
            parts.append(f"UNCHANGEABLE FEATURES: {'; '.join(self.do_not_change)}")
        
        if self.consistency_notes:
            parts.append(f"CONSISTENCY RULES: {'; '.join(self.consistency_notes[:3])}")
        
        parts.append("The character MUST be recognizable as the SAME person across all illustrations.")
        parts.append("=== END CHARACTER IDENTITY ===")
        
        return "\n".join(parts)
