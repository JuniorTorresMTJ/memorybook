"""
Prompt Reviewer Agent

Reviews and improves image generation prompts.
"""

from typing import List, Tuple
from .base import AgentBase

import sys
sys.path.append('..')

from models.prompts import PromptItem
from prompts.master_prompts import PROMPT_REVIEWER_PROMPT, build_prompt
from prompts.language_utils import resolve_language


class PromptReviewerAgent(AgentBase[Tuple[List[PromptItem], str], List[PromptItem]]):
    """
    Agent responsible for reviewing and improving prompts.
    
    Takes all prompts and reviews them for quality, consistency,
    and effectiveness before image generation.
    """
    
    # Use fast model for prompt review
    MODEL = "gemini-2.0-flash"

    async def run(self, input_data: Tuple[List[PromptItem], str]) -> List[PromptItem]:
        """
        Review and improve all prompts.
        
        Args:
            input_data: Tuple of (List[PromptItem], user_language)
            
        Returns:
            List of improved PromptItems
        """
        # Handle both old and new format
        if isinstance(input_data, list):
            prompts = input_data
            user_language = "en-US"
        else:
            prompts, user_language = input_data
        
        user_language = resolve_language(user_language)
        
        self._log_info(f"Reviewing {len(prompts)} prompts (language: {user_language})")
        
        improved_prompts = []
        
        # First pass: collect all prompts for consistency check
        all_prompts_text = self._format_prompts_for_review(prompts)
        
        # Review each prompt
        for prompt in prompts:
            improved = await self._review_single_prompt(prompt, all_prompts_text, user_language)
            improved_prompts.append(improved)
        
        self._log_info(f"Reviewed and improved {len(improved_prompts)} prompts")
        return improved_prompts
    
    def _format_prompts_for_review(self, prompts: List[PromptItem]) -> str:
        """Format all prompts for consistency review."""
        parts = []
        for p in prompts:
            parts.append(f"Page {p.page_number} ({p.prompt_type}): {p.main_prompt[:200]}...")
        return "\n".join(parts)
    
    async def _review_single_prompt(self, prompt: PromptItem, all_prompts: str, user_language: str) -> PromptItem:
        """Review and improve a single prompt."""
        # Build system prompt with language
        system_prompt = build_prompt(PROMPT_REVIEWER_PROMPT, user_language)
        
        user_prompt = f"""User Language: {user_language}
Review and improve this prompt:

Current Prompt:
- Type: {prompt.prompt_type}
- Page: {prompt.page_number}
- Main Prompt: {prompt.main_prompt}
- Character: {prompt.character_description}
- Scene: {prompt.scene_description}
- Style: {prompt.style_prompt}
- Negative: {', '.join(prompt.negative_constraints)}

Context (other prompts in the book):
{all_prompts}

IMPORTANT:
- All feedback and revision_notes MUST be in {user_language}
- Preserve the original scene intention
- Strengthen character consistency
- Do NOT completely rewrite the prompt

Please improve this prompt while maintaining consistency with the others.
Return the improved prompt in the same format."""
        
        try:
            result = await self.gemini.revise_text(
                prompt=f"{system_prompt}\n\n{user_prompt}",
                schema=PromptItem
            )
            
            improved = PromptItem(**result)
            improved.page_number = prompt.page_number
            improved.prompt_type = prompt.prompt_type
            improved.version = prompt.version + 1
            improved.revision_notes = [f"Reviewed and improved by PromptReviewerAgent ({user_language})"]
            
            return improved
            
        except Exception as e:
            self._log_warning(f"Failed to review prompt for page {prompt.page_number}: {str(e)}")
            # Return original with note
            prompt.revision_notes.append(f"Review failed: {str(e)}")
            return prompt
