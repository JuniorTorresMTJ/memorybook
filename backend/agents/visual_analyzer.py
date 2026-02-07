"""
Visual Analyzer Agent

Analyzes reference images to create a visual fingerprint.
"""

from typing import Tuple
from .base import AgentBase

import sys
sys.path.append('..')

from models.user_input import ReferenceImages, BookPreferences
from models.visual import VisualFingerprint, FacialFeatures, BodyCharacteristics, StyleAttributes
from prompts.master_prompts import VISUAL_ANALYZER_PROMPT, build_prompt
from prompts.language_utils import resolve_language


class VisualAnalyzerAgent(AgentBase[Tuple[ReferenceImages, BookPreferences, str], VisualFingerprint]):
    """
    Agent responsible for analyzing reference images.
    
    Extracts visual characteristics from reference photos to create
    a fingerprint for consistent character representation.
    """
    
    # Use fast model for visual analysis
    MODEL = "gemini-2.0-flash"

    async def run(self, input_data: Tuple[ReferenceImages, BookPreferences, str]) -> VisualFingerprint:
        """
        Analyze reference images and create a visual fingerprint.
        
        Args:
            input_data: Tuple of (ReferenceImages, BookPreferences, user_language)
            
        Returns:
            VisualFingerprint with extracted characteristics
        """
        # Handle both old and new format
        if len(input_data) == 2:
            reference_images, preferences = input_data
            user_language = "en-US"
        else:
            reference_images, preferences, user_language = input_data
        
        user_language = resolve_language(user_language)
        
        # If no reference images, return fallback fingerprint based on style
        if not reference_images.has_images():
            self._log_info("No reference images provided - using style-based fingerprint")
            return self._create_fallback_fingerprint(preferences)
        
        self._log_info(f"Analyzing {len(reference_images.paths)} reference images (language: {user_language})")
        
        # Build prompt with language
        system_prompt = build_prompt(VISUAL_ANALYZER_PROMPT, user_language)
        user_prompt = self._build_user_prompt(reference_images, preferences, user_language)
        
        try:
            result = await self.gemini.analyze_images(
                prompt=f"{system_prompt}\n\n{user_prompt}",
                images=reference_images.paths,
                schema=VisualFingerprint
            )
            
            fingerprint = VisualFingerprint(**result)
            self._log_info("Visual fingerprint created successfully")
            
            return fingerprint
            
        except Exception as e:
            self._log_error(f"Visual analysis failed: {str(e)}")
            return self._create_fallback_fingerprint(preferences)
    
    def _build_user_prompt(self, reference_images: ReferenceImages, preferences: BookPreferences, user_language: str) -> str:
        """Build the prompt for visual analysis."""
        style_guidance = {
            "coloring": "Simple, clean lines suitable for coloring. Focus on distinctive outlines.",
            "cartoon": "Bold, exaggerated features with bright colors. Emphasize recognizable traits.",
            "anime": "Soft features with expressive eyes. Stylized but recognizable.",
            "watercolor": "Soft, dreamy representation. Focus on overall impression and key features."
        }
        
        return f"""User Language: {user_language}
Analyze these reference images to create a visual fingerprint.

Target illustration style: {preferences.style}
Style guidance: {style_guidance.get(preferences.style, '')}

IMPORTANT: All descriptive text MUST be in {user_language}.

Please extract:
1. Facial features (face shape, eyes, hair, skin tone, distinctive features)
2. Body characteristics (body type, posture, typical clothing)
3. Style-specific attributes (colors, line weights, detail level)
4. Notes for maintaining consistency across illustrations
5. Features that must NOT change (do_not_change list)
6. Guidance for representing the person at different ages

Analyze all {len(reference_images.paths)} images and identify consistent features."""
    
    def _create_fallback_fingerprint(self, preferences: BookPreferences) -> VisualFingerprint:
        """Create a generic fingerprint as fallback."""
        style_attributes = {
            "coloring": StyleAttributes(
                color_palette=["black", "white"],
                line_weight="medium",
                shading_style="none",
                detail_level="medium"
            ),
            "cartoon": StyleAttributes(
                color_palette=["bright", "saturated"],
                line_weight="bold",
                shading_style="cel-shading",
                detail_level="medium"
            ),
            "anime": StyleAttributes(
                color_palette=["soft", "pastel"],
                line_weight="thin",
                shading_style="soft-gradient",
                detail_level="high"
            ),
            "watercolor": StyleAttributes(
                color_palette=["muted", "warm"],
                line_weight="none",
                shading_style="watercolor-wash",
                detail_level="low"
            )
        }
        
        return VisualFingerprint(
            subject_id="unknown",
            facial_features=FacialFeatures(),
            body_characteristics=BodyCharacteristics(),
            style_attributes=style_attributes.get(preferences.style, StyleAttributes()),
            reference_image_analysis=[],
            consistency_notes=["Unable to analyze reference images - using generic representation"],
            age_variations={}
        )
