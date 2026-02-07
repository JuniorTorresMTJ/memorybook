"""
Designer Reviewer Agent

Reviews the overall design cohesion of the book.
"""

from typing import List, Tuple
from .base import AgentBase

import sys
sys.path.append('..')

from models.generation import GenerationResult
from models.review import IllustrationReviewItem, DesignReview
from models.user_input import BookPreferences
from prompts.master_prompts import DESIGNER_REVIEWER_PROMPT, build_prompt
from prompts.language_utils import resolve_language


class DesignerReviewerAgent(AgentBase[Tuple[List[GenerationResult], List[IllustrationReviewItem], BookPreferences, str], DesignReview]):
    """
    Agent responsible for reviewing overall book design.
    
    Evaluates the cohesion and consistency of all illustrations
    as a complete book.
    """
    
    # Use fast model for design review
    MODEL = "gemini-2.0-flash"

    async def run(self, input_data: Tuple[List[GenerationResult], List[IllustrationReviewItem], BookPreferences, str]) -> DesignReview:
        """
        Review the overall book design.
        
        Args:
            input_data: Tuple of (List[GenerationResult], List[IllustrationReviewItem], BookPreferences, user_language)
            
        Returns:
            DesignReview with overall assessment
        """
        # Handle both old and new format
        if len(input_data) == 3:
            generation_results, illustration_reviews, preferences = input_data
            user_language = "en-US"
        else:
            generation_results, illustration_reviews, preferences, user_language = input_data
        
        user_language = resolve_language(user_language)
        
        self._log_info(f"Reviewing overall book design (language: {user_language})")
        
        # Build system prompt with language
        system_prompt = build_prompt(DESIGNER_REVIEWER_PROMPT, user_language)
        user_prompt = self._build_review_prompt(generation_results, illustration_reviews, preferences, user_language)
        
        try:
            result = await self.gemini.generate_json(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                schema=DesignReview
            )
            
            review = DesignReview(**result)
            review.page_reviews = illustration_reviews
            
            # Determine which pages need attention
            review.pages_needing_attention = [
                r.page_number for r in illustration_reviews
                if r.recommended_action != "approve"
            ]
            
            # Determine if approved
            review.approved = (
                review.get_average_score() >= 7.0
                and len(review.pages_needing_attention) == 0
            )
            
            self._log_info(f"Design review complete. Approved: {review.approved}")
            return review
            
        except Exception as e:
            self._log_error(f"Design review failed: {str(e)}")
            return self._create_fallback_review(illustration_reviews, user_language)
    
    def _build_review_prompt(self, results: List[GenerationResult], reviews: List[IllustrationReviewItem], 
                            preferences: BookPreferences, user_language: str) -> str:
        """Build the review prompt."""
        parts = [
            f"User Language: {user_language}",
            f"Review this {preferences.style} style memory book with {len(results)} pages.",
            "",
            "=== INDIVIDUAL PAGE REVIEWS ===",
            ""
        ]
        
        for review in reviews:
            parts.extend([
                f"Page {review.page_number}:",
                f"  Assessment: {review.artistic_assessment}",
                f"  Color Harmony: {review.color_harmony}",
                f"  Style Adherence: {review.style_adherence}",
                f"  Recommended Action: {review.recommended_action}",
                ""
            ])
        
        parts.extend([
            "=== TASK ===",
            f"IMPORTANT: All feedback (global_assessment, global_issues, global_suggestions) MUST be in {user_language}.",
            "",
            "Please evaluate the overall design cohesion of this book.",
            "Consider how all pages work together as a unified whole.",
            "Identify any global issues and provide suggestions.",
            "Score each aspect from 0-10."
        ])
        
        return "\n".join(parts)
    
    def _create_fallback_review(self, illustration_reviews: List[IllustrationReviewItem], user_language: str) -> DesignReview:
        """Create a fallback review."""
        messages = {
            "pt-BR": {
                "issue": "Revisão automática - verificação manual recomendada",
                "suggestion": "Revise todas as páginas manualmente para garantia de qualidade"
            },
            "en-US": {
                "issue": "Automated review - manual verification recommended",
                "suggestion": "Review all pages manually for quality assurance"
            },
            "es-ES": {
                "issue": "Revisión automática - verificación manual recomendada",
                "suggestion": "Revise todas las páginas manualmente para garantía de calidad"
            }
        }
        
        msg = messages.get(user_language, messages["en-US"])
        
        pages_needing_attention = [
            r.page_number for r in illustration_reviews
            if r.recommended_action != "approve"
        ]
        
        return DesignReview(
            overall_cohesion=7.0,
            style_consistency_score=7.0,
            color_palette_harmony=7.0,
            narrative_flow=7.0,
            character_consistency=7.0,
            page_reviews=illustration_reviews,
            global_issues=[msg["issue"]],
            global_suggestions=[msg["suggestion"]],
            pages_needing_attention=pages_needing_attention,
            approved=len(pages_needing_attention) == 0
        )
