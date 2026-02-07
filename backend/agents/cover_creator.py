"""
Cover Creator Agent

Creates the prompt for the book cover.
"""

from typing import Tuple
from .base import AgentBase

import sys
sys.path.append('..')

from models.planning import CoverConcept
from models.visual import VisualFingerprint
from models.user_input import BookPreferences
from models.prompts import PromptItem, RenderParams
from prompts.master_prompts import COVER_CREATOR_PROMPT, build_prompt
from prompts.language_utils import resolve_language


class CoverCreatorAgent(AgentBase[Tuple[CoverConcept, VisualFingerprint, BookPreferences, str], PromptItem]):
    """
    Agent responsible for creating the cover prompt.
    
    Takes the cover concept and visual fingerprint to create
    a detailed prompt for cover image generation.
    """
    
    # Use creative model for cover concepts
    MODEL = "gemini-2.0-pro-exp"

    async def run(self, input_data: Tuple[CoverConcept, VisualFingerprint, BookPreferences, str]) -> PromptItem:
        """
        Create the cover prompt.
        
        Args:
            input_data: Tuple of (CoverConcept, VisualFingerprint, BookPreferences, user_language)
            
        Returns:
            PromptItem for cover generation
        """
        # Handle both old and new format
        if len(input_data) == 3:
            cover_concept, fingerprint, preferences = input_data
            user_language = "en-US"
        else:
            cover_concept, fingerprint, preferences, user_language = input_data
        
        user_language = resolve_language(user_language)
        
        self._log_info(f"Creating cover prompt (language: {user_language})")
        
        # Build prompt with language
        system_prompt = build_prompt(COVER_CREATOR_PROMPT, user_language)
        user_prompt = self._build_user_prompt(cover_concept, fingerprint, preferences, user_language)
        
        try:
            result = await self.gemini.generate_json(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                schema=PromptItem
            )
            
            prompt_item = PromptItem(**result)
            prompt_item.page_number = 0
            prompt_item.prompt_type = "cover"
            
            self._log_info("Cover prompt created successfully")
            return prompt_item
            
        except Exception as e:
            self._log_error(f"Cover prompt creation failed: {str(e)}")
            return self._create_fallback_prompt(cover_concept, fingerprint, preferences, user_language)
    
    def _build_user_prompt(self, cover_concept: CoverConcept, fingerprint: VisualFingerprint, 
                          preferences: BookPreferences, user_language: str) -> str:
        """Build the user prompt for cover creation."""
        character_desc = fingerprint.get_prompt_description()
        
        return f"""User Language: {user_language}
Create an image generation prompt for a book cover.

Book Title: {preferences.title}
Illustration Style: {preferences.style}

Cover Concept:
- Subject Pose: {cover_concept.main_subject_pose}
- Background Elements: {', '.join(cover_concept.background_elements) or 'Simple background'}
- Color Scheme: {', '.join(cover_concept.color_scheme) or 'Warm colors'}
- Mood: {cover_concept.mood}
- Title Placement: {cover_concept.title_placement}
- Symbolic Elements: {', '.join(cover_concept.symbolic_elements) or 'None'}

Character Description:
{character_desc}

Style Attributes:
- Color Palette: {', '.join(fingerprint.style_attributes.color_palette) or 'Default'}
- Line Weight: {fingerprint.style_attributes.line_weight}
- Detail Level: {fingerprint.style_attributes.detail_level}

IMPORTANT: 
- All descriptive text (scene_description, concept_rationale) MUST be in {user_language}
- Leave clear space at the {cover_concept.title_placement} for the title
- Make the subject the clear focal point
- Use {preferences.style} illustration style consistently
- Create a warm, inviting atmosphere

Generate a detailed prompt with negative constraints."""
    
    def _create_fallback_prompt(self, cover_concept: CoverConcept, fingerprint: VisualFingerprint, 
                               preferences: BookPreferences, user_language: str) -> PromptItem:
        """Create a fallback cover prompt."""
        style_keywords = {
            "coloring": "coloring book style, black and white line art, clean outlines, no shading",
            "cartoon": "cartoon style, bright colors, bold outlines, cheerful, vibrant",
            "anime": "anime style, soft shading, expressive eyes, detailed, beautiful",
            "watercolor": "watercolor painting, soft edges, dreamy, delicate brushstrokes, artistic"
        }
        
        character_desc = fingerprint.get_prompt_description()
        style_kw = style_keywords.get(preferences.style, "illustrated")
        
        main_prompt = f"""Book cover illustration, {style_kw}, 
portrait of {character_desc}, {cover_concept.main_subject_pose}, 
{cover_concept.mood} mood, {', '.join(cover_concept.background_elements) if cover_concept.background_elements else 'simple elegant background'}, 
space for title at {cover_concept.title_placement}, 
high quality, professional illustration"""
        
        return PromptItem(
            page_number=0,
            prompt_type="cover",
            main_prompt=main_prompt.replace('\n', ' '),
            character_description=character_desc,
            scene_description=f"Book cover with {cover_concept.mood} mood",
            style_prompt=style_kw,
            negative_constraints=[
                "text", "words", "letters", "title", "numbers", "typography", "captions", "labels", "signs", "written content",
                "cropped", "cut off", "partial",
                "multiple people", "crowd"
            ],
            render_params=RenderParams(
                width=1024,
                height=1024,
                style_preset=preferences.style
            )
        )
