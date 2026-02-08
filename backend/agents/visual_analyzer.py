"""
Visual Analyzer Agent

Analyzes reference images and/or physical characteristics to create a visual fingerprint.
Supports three modes:
1. Photos only: analyze reference images with Gemini Vision
2. Characteristics only: build fingerprint from form-provided physical traits
3. Both: analyze photos and enrich with provided characteristics
"""

from typing import Tuple
from .base import AgentBase

import sys
sys.path.append('..')

from models.user_input import ReferenceImages, BookPreferences, PhysicalCharacteristics
from models.visual import VisualFingerprint, FacialFeatures, BodyCharacteristics, StyleAttributes
from prompts.master_prompts import VISUAL_ANALYZER_PROMPT, build_prompt
from prompts.language_utils import resolve_language


class VisualAnalyzerAgent(AgentBase[Tuple[ReferenceImages, BookPreferences, str], VisualFingerprint]):
    """
    Agent responsible for analyzing reference images and/or physical characteristics.
    
    Extracts visual characteristics from reference photos and/or form data to create
    a fingerprint for consistent character representation across all book pages.
    """
    
    # Use fast model for visual analysis
    MODEL = "gemini-2.0-flash"

    async def run(self, input_data: Tuple[ReferenceImages, BookPreferences, str]) -> VisualFingerprint:
        """
        Analyze reference images and/or physical characteristics to create a visual fingerprint.
        
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
        
        has_images = reference_images.has_images()
        has_chars = reference_images.has_characteristics()
        
        # Case 1: Has reference images (with or without characteristics)
        if has_images:
            self._log_info(
                f"Analyzing {len(reference_images.paths)} reference images "
                f"(language: {user_language}, has_characteristics: {has_chars})"
            )
            fingerprint = await self._analyze_from_images(reference_images, preferences, user_language)
            
            # Enrich with physical characteristics if also provided
            if has_chars:
                fingerprint = self._enrich_with_characteristics(
                    fingerprint, reference_images.physical_characteristics
                )
            
            return fingerprint
        
        # Case 2: Only physical characteristics (no images)
        if has_chars:
            self._log_info(
                f"No images - building fingerprint from physical characteristics "
                f"(language: {user_language})"
            )
            return self._create_fingerprint_from_characteristics(
                reference_images.physical_characteristics, preferences, user_language
            )
        
        # Case 3: No reference at all - generic fallback
        self._log_info("No reference images or characteristics provided - using style-based fingerprint")
        return self._create_fallback_fingerprint(preferences)
    
    async def _analyze_from_images(
        self, reference_images: ReferenceImages, preferences: BookPreferences, user_language: str
    ) -> VisualFingerprint:
        """Analyze reference images with Gemini Vision to create fingerprint."""
        system_prompt = build_prompt(VISUAL_ANALYZER_PROMPT, user_language)
        user_prompt = self._build_user_prompt(reference_images, preferences, user_language)
        
        try:
            result = await self.gemini.analyze_images(
                prompt=f"{system_prompt}\n\n{user_prompt}",
                images=reference_images.paths,
                schema=VisualFingerprint
            )
            
            fingerprint = VisualFingerprint(**result)
            self._log_info("Visual fingerprint created successfully from images")
            return fingerprint
            
        except Exception as e:
            self._log_error(f"Visual analysis failed: {str(e)}")
            # If we have characteristics, use those instead of generic fallback
            if reference_images.has_characteristics():
                return self._create_fingerprint_from_characteristics(
                    reference_images.physical_characteristics, preferences, user_language
                )
            return self._create_fallback_fingerprint(preferences)
    
    def _enrich_with_characteristics(
        self, fingerprint: VisualFingerprint, chars: PhysicalCharacteristics
    ) -> VisualFingerprint:
        """Enrich an image-based fingerprint with form-provided characteristics."""
        # Fill in any missing facial features from form data
        if chars.skin_color and not fingerprint.facial_features.skin_tone:
            fingerprint.facial_features.skin_tone = chars.skin_color
        if chars.hair_color and not fingerprint.facial_features.hair_color:
            fingerprint.facial_features.hair_color = chars.hair_color
        if chars.hair_style and not fingerprint.facial_features.hair_style:
            fingerprint.facial_features.hair_style = chars.hair_style
        
        # Add distinctive features from form
        if chars.has_glasses and "glasses" not in " ".join(fingerprint.facial_features.distinctive_features).lower():
            fingerprint.facial_features.distinctive_features.append("wears glasses")
        if chars.has_facial_hair and "facial hair" not in " ".join(fingerprint.facial_features.distinctive_features).lower():
            fingerprint.facial_features.distinctive_features.append("has facial hair")
        
        # Set subject name
        if chars.name:
            fingerprint.subject_id = chars.name
        
        # Add to do_not_change list
        if chars.has_glasses:
            fingerprint.do_not_change.append("glasses - must always be present")
        
        self._log_info("Fingerprint enriched with physical characteristics from form")
        return fingerprint
    
    def _create_fingerprint_from_characteristics(
        self, chars: PhysicalCharacteristics, preferences: BookPreferences, user_language: str
    ) -> VisualFingerprint:
        """Create a detailed fingerprint from form-provided physical characteristics."""
        distinctive = []
        if chars.has_glasses:
            distinctive.append("wears glasses")
        if chars.has_facial_hair:
            distinctive.append("has facial hair")
        
        facial_features = FacialFeatures(
            face_shape="",
            eye_color="",
            eye_shape="",
            hair_color=chars.hair_color or "",
            hair_style=chars.hair_style or "",
            skin_tone=chars.skin_color or "",
            distinctive_features=distinctive,
            estimated_age_range=""
        )
        
        body_characteristics = BodyCharacteristics(
            body_type="average",
            height_estimate="average",
            posture="natural, relaxed",
            clothing_style=[]
        )
        
        style_attrs = self._get_style_attributes(preferences.style)
        
        # Build age variations based on gender and features
        gender_term = "boy" if chars.gender == "male" else "girl" if chars.gender == "female" else "child"
        adult_term = "man" if chars.gender == "male" else "woman" if chars.gender == "female" else "person"
        
        base_desc = chars.to_description()
        
        age_variations = {
            "young": f"A young {gender_term} (child, ~6-10 years old), {base_desc}, youthful round face, bright eyes",
            "adolescent": f"A teenage {gender_term} (~14-17 years old), {base_desc}, slightly more mature features",
            "adult": f"An adult {adult_term} (~30-45 years old), {base_desc}, mature confident features",
            "elderly": f"An elderly {adult_term} (~70-80 years old), {base_desc}, gentle wrinkles, wise expression",
        }
        
        do_not_change = []
        if chars.hair_color:
            do_not_change.append(f"hair color: {chars.hair_color}")
        if chars.skin_color:
            do_not_change.append(f"skin tone: {chars.skin_color}")
        if chars.has_glasses:
            do_not_change.append("glasses: must always be present")
        if chars.has_facial_hair:
            do_not_change.append("facial hair: must be present in adult and elderly phases")
        
        consistency_notes = [
            f"Character based on provided physical characteristics: {base_desc}",
            "Maintain the same core features across all age representations",
            "Adapt age naturally but keep identifying features consistent",
        ]
        
        self._log_info(f"Created fingerprint from characteristics: {base_desc}")
        
        return VisualFingerprint(
            subject_id=chars.name or "subject",
            facial_features=facial_features,
            body_characteristics=body_characteristics,
            style_attributes=style_attrs,
            reference_image_analysis=[],
            consistency_notes=consistency_notes,
            age_variations=age_variations,
            do_not_change=do_not_change
        )
    
    def _build_user_prompt(self, reference_images: ReferenceImages, preferences: BookPreferences, user_language: str) -> str:
        """Build the prompt for visual analysis."""
        style_guidance = {
            "coloring": "Simple, clean lines suitable for coloring. Focus on distinctive outlines.",
            "cartoon": "Bold, exaggerated features with bright colors. Emphasize recognizable traits.",
            "anime": "Soft features with expressive eyes. Stylized but recognizable.",
            "watercolor": "Soft, dreamy representation. Focus on overall impression and key features."
        }
        
        # Add physical characteristics context if available
        chars_context = ""
        if reference_images.has_characteristics():
            chars = reference_images.physical_characteristics
            chars_context = f"""

ADDITIONAL CONTEXT - Physical characteristics provided by the user:
{chars.to_description()}
Use this information to complement and validate what you see in the images.
If there is a conflict between the images and the provided characteristics, prefer the images
but note the discrepancy in consistency_notes."""
        
        return f"""User Language: {user_language}
Analyze these reference images to create a visual fingerprint.

Target illustration style: {preferences.style}
Style guidance: {style_guidance.get(preferences.style, '')}
{chars_context}

IMPORTANT: All descriptive text MUST be in {user_language}.

Please extract:
1. Facial features (face shape, eyes, hair, skin tone, distinctive features)
2. Body characteristics (body type, posture, typical clothing)
3. Style-specific attributes (colors, line weights, detail level)
4. Notes for maintaining consistency across illustrations
5. Features that must NOT change (do_not_change list) - these are CRITICAL for character identity
6. Guidance for representing the person at different ages (young, adolescent, adult, elderly)

Analyze all {len(reference_images.paths)} images and identify consistent features.
Pay special attention to:
- Unique identifying features (glasses, scars, dimples, facial hair, etc.)
- Hair characteristics that should be preserved across ages
- Skin tone consistency
- Body proportions and build"""
    
    def _get_style_attributes(self, style: str) -> StyleAttributes:
        """Get style-specific attributes."""
        style_map = {
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
        return style_map.get(style, StyleAttributes())
    
    def _create_fallback_fingerprint(self, preferences: BookPreferences) -> VisualFingerprint:
        """Create a generic fingerprint as fallback when no reference is available."""
        return VisualFingerprint(
            subject_id="unknown",
            facial_features=FacialFeatures(),
            body_characteristics=BodyCharacteristics(),
            style_attributes=self._get_style_attributes(preferences.style),
            reference_image_analysis=[],
            consistency_notes=["No reference images or characteristics provided - using generic representation"],
            age_variations={},
            do_not_change=[]
        )
