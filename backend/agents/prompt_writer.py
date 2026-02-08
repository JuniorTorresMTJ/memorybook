"""
Prompt Writer Agent

Creates prompts for all internal pages of the book.
"""

from typing import Tuple, List
from .base import AgentBase

import sys
sys.path.append('..')

from models.planning import NarrativePlan, PagePlanItem
from models.visual import VisualFingerprint
from models.user_input import BookPreferences
from models.prompts import PromptItem, RenderParams
from prompts.master_prompts import PROMPT_WRITER_PROMPT, build_prompt
from prompts.language_utils import resolve_language


class PromptWriterAgent(AgentBase[Tuple[NarrativePlan, VisualFingerprint, BookPreferences, str], List[PromptItem]]):
    """
    Agent responsible for creating prompts for internal pages.
    
    Takes the narrative plan and creates detailed prompts for
    each page that will illustrate the memories.
    """
    
    # Use creative model for prompt writing
    MODEL = "gemini-2.0-pro-exp"

    async def run(self, input_data: Tuple[NarrativePlan, VisualFingerprint, BookPreferences, str]) -> List[PromptItem]:
        """
        Create prompts for all internal pages.
        
        Args:
            input_data: Tuple of (NarrativePlan, VisualFingerprint, BookPreferences, user_language)
            
        Returns:
            List of PromptItems for all pages
        """
        # Handle both old and new format
        if len(input_data) == 3:
            narrative_plan, fingerprint, preferences = input_data
            user_language = "en-US"
        else:
            narrative_plan, fingerprint, preferences, user_language = input_data
        
        user_language = resolve_language(user_language)
        
        self._log_info(f"Creating prompts for {len(narrative_plan.pages)} pages (language: {user_language})")
        
        prompts = []
        for page_plan in narrative_plan.pages:
            prompt = await self._create_page_prompt(page_plan, fingerprint, preferences, user_language)
            prompts.append(prompt)
        
        self._log_info(f"Created {len(prompts)} page prompts")
        return prompts
    
    async def _create_page_prompt(self, page_plan: PagePlanItem, fingerprint: VisualFingerprint, 
                                  preferences: BookPreferences, user_language: str) -> PromptItem:
        """Create a prompt for a single page."""
        # Build prompt with language
        system_prompt = build_prompt(PROMPT_WRITER_PROMPT, user_language)
        user_prompt = self._build_page_prompt(page_plan, fingerprint, preferences, user_language)
        
        try:
            result = await self.gemini.generate_json(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                schema=PromptItem
            )
            
            prompt_item = PromptItem(**result)
            prompt_item.page_number = page_plan.page_number
            prompt_item.prompt_type = "page"
            
            return prompt_item
            
        except Exception as e:
            self._log_warning(f"Failed to create prompt for page {page_plan.page_number}: {str(e)}")
            return self._create_fallback_prompt(page_plan, fingerprint, preferences, user_language)
    
    def _build_page_prompt(self, page_plan: PagePlanItem, fingerprint: VisualFingerprint, 
                          preferences: BookPreferences, user_language: str) -> str:
        """Build the user prompt for a single page."""
        character_desc = fingerprint.get_prompt_description()
        
        # Get age-appropriate description using the enhanced method
        age_desc = fingerprint.get_age_adjusted_description(page_plan.life_phase)
        
        # Build character identity block
        identity_block = fingerprint.get_character_identity_block()
        
        # Build do_not_change instructions
        do_not_change_section = ""
        if fingerprint.do_not_change:
            do_not_change_section = "\nFEATURES THAT MUST NOT CHANGE:\n" + "\n".join(
                f"- {feature}" for feature in fingerprint.do_not_change
            )
        
        return f"""User Language: {user_language}
Create an image generation prompt for page {page_plan.page_number}.

Illustration Style: {preferences.style}

{identity_block}

Page Plan:
- Life Phase: {page_plan.life_phase}
- Memory: {page_plan.memory_reference}
- Scene Description: {page_plan.scene_description}
- Emotional Tone: {page_plan.emotional_tone}
- Setting: {page_plan.setting or 'Appropriate to the memory'}
- Key Elements: {', '.join(page_plan.key_elements) or 'As appropriate'}
- Characters: {', '.join(page_plan.characters_present) or 'Main subject'}
- Suggested Composition: {page_plan.suggested_composition or 'Balanced'}

Character Description (for {page_plan.life_phase} phase):
{age_desc}
{do_not_change_section}

Style Attributes:
- Color Palette: {', '.join(fingerprint.style_attributes.color_palette) or 'Default'}
- Line Weight: {fingerprint.style_attributes.line_weight}
- Detail Level: {fingerprint.style_attributes.detail_level}

IMPORTANT:
- All descriptive text MUST be in {user_language}
- The character MUST be the SAME person across ALL pages - maintain exact visual identity
- Include the character_identity_block field in the output to enforce consistency
- Capture the essence of: {page_plan.memory_reference}
- Convey {page_plan.emotional_tone} emotional tone
- Use {preferences.style} illustration style
- Show the character at the appropriate age for {page_plan.life_phase}
- Reference images of the character will be provided during generation

Generate a detailed prompt with negative constraints."""
    
    def _create_fallback_prompt(self, page_plan: PagePlanItem, fingerprint: VisualFingerprint, 
                               preferences: BookPreferences, user_language: str) -> PromptItem:
        """Create a fallback prompt for a page with strong character identity."""
        style_keywords = {
            "coloring": "coloring book style, black and white line art, clean outlines",
            "cartoon": "cartoon style, bright colors, bold outlines, expressive",
            "anime": "anime style, soft shading, detailed, beautiful",
            "watercolor": "watercolor painting, soft edges, dreamy, artistic"
        }
        
        # Use the enhanced age-adjusted description
        age_desc = fingerprint.get_age_adjusted_description(page_plan.life_phase)
        character_desc = fingerprint.get_prompt_description()
        identity_block = fingerprint.get_character_identity_block()
        style_kw = style_keywords.get(preferences.style, "illustrated")
        
        main_prompt = f"""Illustration for memory book, {style_kw}, 
{age_desc}, 
{page_plan.scene_description}, 
{page_plan.emotional_tone} mood, 
{page_plan.setting if page_plan.setting else 'appropriate setting'}, 
{', '.join(page_plan.key_elements) if page_plan.key_elements else 'meaningful details'}, 
high quality, heartwarming illustration, same character as reference images"""
        
        return PromptItem(
            page_number=page_plan.page_number,
            prompt_type="page",
            main_prompt=main_prompt.replace('\n', ' '),
            character_description=age_desc,
            character_identity_block=identity_block,
            scene_description=page_plan.scene_description,
            style_prompt=style_kw,
            negative_constraints=[
                "blurry", "distorted", "ugly",
                "wrong age", "inconsistent features",
                "different character", "wrong person",
                "cluttered", "confusing composition",
                "text", "words", "letters", "numbers", "typography", "captions", "labels", "signs", "written content"
            ],
            render_params=RenderParams(
                width=1024,
                height=1024,
                style_preset=preferences.style
            )
        )
