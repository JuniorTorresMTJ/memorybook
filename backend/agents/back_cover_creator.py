"""
Back Cover Creator Agent

Creates the prompt for the book back cover.
"""

from typing import Tuple
from .base import AgentBase

import sys
sys.path.append('..')

from models.planning import BackCoverConcept
from models.visual import VisualFingerprint
from models.user_input import BookPreferences
from models.prompts import PromptItem, RenderParams
from prompts.master_prompts import BACK_COVER_CREATOR_PROMPT, build_prompt
from prompts.language_utils import resolve_language


class BackCoverCreatorAgent(AgentBase[Tuple[BackCoverConcept, VisualFingerprint, BookPreferences, str], PromptItem]):
    """
    Agent responsible for creating the back cover prompt.
    
    Creates a symbolic or decorative back cover that complements
    the front cover and ties the story together.
    """
    
    # Use creative model for back cover concepts
    MODEL = "gemini-2.0-pro-exp"

    async def run(self, input_data: Tuple[BackCoverConcept, VisualFingerprint, BookPreferences, str]) -> PromptItem:
        """
        Create the back cover prompt.
        
        Args:
            input_data: Tuple of (BackCoverConcept, VisualFingerprint, BookPreferences, user_language)
            
        Returns:
            PromptItem for back cover generation
        """
        # Handle both old and new format
        if len(input_data) == 3:
            back_cover_concept, fingerprint, preferences = input_data
            user_language = "en-US"
        else:
            back_cover_concept, fingerprint, preferences, user_language = input_data
        
        user_language = resolve_language(user_language)
        
        self._log_info(f"Creating back cover prompt (language: {user_language})")
        
        # Build prompt with language
        system_prompt = build_prompt(BACK_COVER_CREATOR_PROMPT, user_language)
        user_prompt = self._build_user_prompt(back_cover_concept, fingerprint, preferences, user_language)
        
        try:
            result = await self.gemini.generate_json(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                schema=PromptItem
            )
            
            prompt_item = PromptItem(**result)
            prompt_item.page_number = -1
            prompt_item.prompt_type = "back_cover"
            
            self._log_info("Back cover prompt created successfully")
            return prompt_item
            
        except Exception as e:
            self._log_error(f"Back cover prompt creation failed: {str(e)}")
            return self._create_fallback_prompt(back_cover_concept, fingerprint, preferences, user_language)
    
    def _build_user_prompt(self, back_cover_concept: BackCoverConcept, fingerprint: VisualFingerprint,
                          preferences: BookPreferences, user_language: str) -> str:
        """Build the user prompt for back cover creation."""
        return f"""User Language: {user_language}
Create an image generation prompt for a book back cover.

Illustration Style: {preferences.style}

Back Cover Concept:
- Design Type: {back_cover_concept.design_type}
- Main Elements: {', '.join(back_cover_concept.main_elements) or 'Symbolic elements'}
- Color Scheme: {', '.join(back_cover_concept.color_scheme) or 'Complementary to front'}
- Symbolic Meaning: {back_cover_concept.symbolic_meaning or 'Life journey completion'}
- Include Text Area: {back_cover_concept.text_area}

Style Attributes:
- Color Palette: {', '.join(fingerprint.style_attributes.color_palette) or 'Default'}
- Line Weight: {fingerprint.style_attributes.line_weight}
- Detail Level: {fingerprint.style_attributes.detail_level}

IMPORTANT:
- All descriptive text MUST be in {user_language}
- Create a {back_cover_concept.design_type} design
- Use {preferences.style} illustration style
- Should complement the front cover
- Convey a sense of completion and warmth
- Avoid prominent faces or figures

Generate a detailed prompt with negative constraints."""
    
    def _create_fallback_prompt(self, back_cover_concept: BackCoverConcept, fingerprint: VisualFingerprint, 
                               preferences: BookPreferences, user_language: str) -> PromptItem:
        """Create a fallback back cover prompt."""
        style_keywords = {
            "coloring": "coloring book style, black and white line art, decorative pattern",
            "cartoon": "cartoon style, bright colors, decorative elements, cheerful",
            "anime": "anime style, soft colors, decorative, beautiful pattern",
            "watercolor": "watercolor painting, soft washes, decorative, artistic"
        }
        
        style_kw = style_keywords.get(preferences.style, "illustrated")
        
        design_prompts = {
            "symbolic": f"symbolic illustration with {', '.join(back_cover_concept.main_elements) if back_cover_concept.main_elements else 'meaningful symbols'}",
            "pattern": f"decorative pattern with {', '.join(back_cover_concept.main_elements) if back_cover_concept.main_elements else 'elegant motifs'}",
            "scene": f"peaceful scene with {', '.join(back_cover_concept.main_elements) if back_cover_concept.main_elements else 'serene elements'}",
            "minimal": "minimalist design, elegant simplicity"
        }
        
        design_desc = design_prompts.get(back_cover_concept.design_type, design_prompts["symbolic"])
        
        main_prompt = f"""Book back cover, {style_kw}, 
{design_desc}, 
{', '.join(back_cover_concept.color_scheme) if back_cover_concept.color_scheme else 'warm harmonious colors'}, 
representing {back_cover_concept.symbolic_meaning or 'life journey and memories'}, 
high quality, professional illustration, cohesive design"""
        
        return PromptItem(
            page_number=-1,
            prompt_type="back_cover",
            main_prompt=main_prompt.replace('\n', ' '),
            character_description="",
            scene_description=f"Back cover with {back_cover_concept.design_type} design",
            style_prompt=style_kw,
            negative_constraints=[
                "text", "words", "letters", "numbers", "typography", "captions", "labels", "signs", "written content",
                "portrait", "face", "person",
                "cluttered", "busy", "chaotic"
            ],
            render_params=RenderParams(
                width=1024,
                height=1024,
                style_preset=preferences.style
            )
        )
