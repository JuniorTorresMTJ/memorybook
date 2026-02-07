"""
Image Validator Agent

Validates generated images against the visual fingerprint.
"""

from typing import Tuple
from .base import AgentBase

import sys
sys.path.append('..')

from models.generation import GenerationResult
from models.visual import VisualFingerprint
from models.review import ImageQCResult, QualityMetrics
from prompts.master_prompts import IMAGE_VALIDATOR_PROMPT, build_prompt
from prompts.language_utils import resolve_language


class ImageValidatorAgent(AgentBase[Tuple[GenerationResult, VisualFingerprint, int, str], ImageQCResult]):
    """
    Agent responsible for validating images against the fingerprint.
    
    Ensures generated images maintain consistency with the
    visual fingerprint extracted from reference photos.
    """
    
    # Use fast model for image validation
    MODEL = "gemini-2.0-flash"

    async def run(self, input_data: Tuple[GenerationResult, VisualFingerprint, int, str]) -> ImageQCResult:
        """
        Validate a generated image.
        
        Args:
            input_data: Tuple of (GenerationResult, VisualFingerprint, page_number, user_language)
            
        Returns:
            ImageQCResult with validation results
        """
        # Handle both old and new format
        if len(input_data) == 3:
            generation_result, fingerprint, page_number = input_data
            user_language = "en-US"
        else:
            generation_result, fingerprint, page_number, user_language = input_data
        
        user_language = resolve_language(user_language)
        
        self._log_info(f"Validating image for page {page_number} (language: {user_language})")
        
        if not generation_result.has_image:
            return self._create_failed_result(page_number, "No image generated", user_language)
        
        image_path = generation_result.get_image_location()
        
        # Build system prompt with language
        system_prompt = build_prompt(IMAGE_VALIDATOR_PROMPT, user_language)
        user_prompt = self._build_validation_prompt(fingerprint, page_number, user_language)
        
        try:
            result = await self.gemini.analyze_images(
                prompt=f"{system_prompt}\n\n{user_prompt}",
                images=[image_path] if image_path else [],
                schema=ImageQCResult
            )
            
            qc_result = ImageQCResult(**result)
            qc_result.page_number = page_number
            qc_result.image_path = image_path or ""
            
            self._log_info(f"Page {page_number} validation: {'PASSED' if qc_result.passed else 'FAILED'}")
            return qc_result
            
        except Exception as e:
            self._log_error(f"Validation failed for page {page_number}: {str(e)}")
            return self._create_failed_result(page_number, str(e), user_language, image_path)
    
    def _build_validation_prompt(self, fingerprint: VisualFingerprint, page_number: int, user_language: str) -> str:
        """Build the validation prompt."""
        character_desc = fingerprint.get_prompt_description()
        
        parts = [
            f"User Language: {user_language}",
            f"Validate this illustration for page {page_number}.",
            "",
            "=== EXPECTED CHARACTER FEATURES ===",
            f"Description: {character_desc}",
            "",
            "Facial Features:",
            f"  Face Shape: {fingerprint.facial_features.face_shape or 'Not specified'}",
            f"  Eye Color: {fingerprint.facial_features.eye_color or 'Not specified'}",
            f"  Hair: {fingerprint.facial_features.hair_color} {fingerprint.facial_features.hair_style}",
            f"  Skin Tone: {fingerprint.facial_features.skin_tone or 'Not specified'}",
            f"  Distinctive Features: {', '.join(fingerprint.facial_features.distinctive_features) or 'None'}",
            "",
            "Consistency Notes:",
        ]
        
        for note in fingerprint.consistency_notes:
            parts.append(f"  - {note}")
        
        parts.extend([
            "",
            "=== VALIDATION TASK ===",
            f"IMPORTANT: All feedback (issues_found, suggestions, fix_instruction) MUST be in {user_language}.",
            "",
            "1. Compare the image against the expected features",
            "2. Score each quality metric (0-10)",
            "3. List any issues found",
            "4. Determine if the image passes QC (score >= 7)",
            "5. Generate fix_instruction if needed (specific and actionable)"
        ])
        
        return "\n".join(parts)
    
    def _create_failed_result(self, page_number: int, error: str, user_language: str, image_path: str = "") -> ImageQCResult:
        """Create a failed QC result."""
        messages = {
            "pt-BR": {
                "issue": f"Erro de validação: {error}",
                "suggestion": "Regenerar a imagem"
            },
            "en-US": {
                "issue": f"Validation error: {error}",
                "suggestion": "Regenerate the image"
            },
            "es-ES": {
                "issue": f"Error de validación: {error}",
                "suggestion": "Regenerar la imagen"
            }
        }
        
        msg = messages.get(user_language, messages["en-US"])
        
        return ImageQCResult(
            page_number=page_number,
            image_path=image_path,
            passed=False,
            metrics=QualityMetrics(
                overall_score=0.0,
                technical_quality=0.0,
                artistic_quality=0.0,
                style_consistency=0.0,
                character_accuracy=0.0,
                narrative_fit=0.0
            ),
            issues_found=[msg["issue"]],
            suggestions=[msg["suggestion"]],
            requires_regeneration=True,
            fingerprint_match_score=0.0
        )
