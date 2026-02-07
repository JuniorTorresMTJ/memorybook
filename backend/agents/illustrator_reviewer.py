"""
Illustrator Reviewer Agent

Reviews generated images for artistic quality.
"""

from typing import List, Tuple
from .base import AgentBase

import sys
sys.path.append('..')

from models.generation import GenerationResult
from models.user_input import BookPreferences
from models.review import IllustrationReviewItem
from prompts.master_prompts import ILLUSTRATOR_REVIEWER_PROMPT, build_prompt
from prompts.language_utils import resolve_language


class IllustratorReviewerAgent(AgentBase[Tuple[List[GenerationResult], BookPreferences, str], List[IllustrationReviewItem]]):
    """
    Agent responsible for reviewing illustration quality.
    
    Evaluates each generated image for artistic merit,
    composition, and emotional impact.
    """
    
    # Use fast model for illustration review
    MODEL = "gemini-2.0-flash"

    async def run(self, input_data: Tuple[List[GenerationResult], BookPreferences, str]) -> List[IllustrationReviewItem]:
        """
        Review all generated illustrations.
        
        Args:
            input_data: Tuple of (List[GenerationResult], BookPreferences, user_language)
            
        Returns:
            List of IllustrationReviewItems
        """
        # Handle both old and new format
        if len(input_data) == 2:
            generation_results, preferences = input_data
            user_language = "en-US"
        else:
            generation_results, preferences, user_language = input_data
        
        user_language = resolve_language(user_language)
        
        self._log_info(f"Reviewing {len(generation_results)} illustrations (language: {user_language})")
        
        reviews = []
        for i, result in enumerate(generation_results):
            if result.has_image:
                review = await self._review_illustration(result, i, preferences, user_language)
                reviews.append(review)
            else:
                # Create a failed review for missing images
                reviews.append(self._create_failed_review(i, user_language))
        
        self._log_info(f"Completed {len(reviews)} illustration reviews")
        return reviews
    
    async def _review_illustration(self, result: GenerationResult, page_num: int, 
                                   preferences: BookPreferences, user_language: str) -> IllustrationReviewItem:
        """Review a single illustration."""
        image_path = result.get_image_location()
        
        # Build system prompt with language
        system_prompt = build_prompt(ILLUSTRATOR_REVIEWER_PROMPT, user_language)
        
        user_prompt = f"""User Language: {user_language}
Review this illustration for a {preferences.style} style memory book.

Image: {image_path}
Page Number: {page_num}
Expected Style: {preferences.style}

IMPORTANT: All feedback (artistic_assessment, composition_notes, strengths, areas_for_improvement) MUST be in {user_language}.

Please evaluate:
1. Overall artistic quality
2. Composition
3. Color harmony
4. Emotional impact
5. Style adherence
6. Strengths and weaknesses

Provide your assessment and recommendation."""
        
        try:
            # Use image analysis to review
            result_data = await self.gemini.analyze_images(
                prompt=f"{system_prompt}\n\n{user_prompt}",
                images=[image_path] if image_path else [],
                schema=IllustrationReviewItem
            )
            
            review = IllustrationReviewItem(**result_data)
            review.page_number = page_num
            
            return review
            
        except Exception as e:
            self._log_warning(f"Failed to review illustration for page {page_num}: {str(e)}")
            return self._create_default_review(page_num, user_language)
    
    def _create_default_review(self, page_num: int, user_language: str) -> IllustrationReviewItem:
        """Create a default review when analysis fails."""
        # Messages based on language
        messages = {
            "pt-BR": {
                "assessment": "Não foi possível analisar - aprovação padrão",
                "notes": "Revisão ignorada",
                "strength": "Gerada com sucesso",
                "improvement": "Revisão manual recomendada"
            },
            "en-US": {
                "assessment": "Unable to analyze - defaulting to approval",
                "notes": "Review skipped",
                "strength": "Generated successfully",
                "improvement": "Manual review recommended"
            },
            "es-ES": {
                "assessment": "No se pudo analizar - aprobación por defecto",
                "notes": "Revisión omitida",
                "strength": "Generada con éxito",
                "improvement": "Se recomienda revisión manual"
            }
        }
        
        msg = messages.get(user_language, messages["en-US"])
        
        return IllustrationReviewItem(
            page_number=page_num,
            artistic_assessment=msg["assessment"],
            composition_notes=msg["notes"],
            color_harmony="good",
            emotional_impact="moderate",
            style_adherence="good",
            strengths=[msg["strength"]],
            areas_for_improvement=[msg["improvement"]],
            recommended_action="approve"
        )
    
    def _create_failed_review(self, page_num: int, user_language: str) -> IllustrationReviewItem:
        """Create a review for failed generation."""
        messages = {
            "pt-BR": {
                "assessment": "Geração falhou - regeneração necessária",
                "notes": "Sem imagem para revisar",
                "improvement": "Falha na geração de imagem"
            },
            "en-US": {
                "assessment": "Generation failed - regeneration required",
                "notes": "No image to review",
                "improvement": "Image generation failed"
            },
            "es-ES": {
                "assessment": "Generación fallida - regeneración requerida",
                "notes": "Sin imagen para revisar",
                "improvement": "Falló la generación de imagen"
            }
        }
        
        msg = messages.get(user_language, messages["en-US"])
        
        return IllustrationReviewItem(
            page_number=page_num,
            artistic_assessment=msg["assessment"],
            composition_notes=msg["notes"],
            color_harmony="poor",
            emotional_impact="weak",
            style_adherence="inconsistent",
            strengths=[],
            areas_for_improvement=[msg["improvement"]],
            recommended_action="regenerate"
        )
