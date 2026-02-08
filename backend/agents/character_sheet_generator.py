"""
Character Sheet Generator Agent

Generates a reference character illustration (character sheet) that serves as
the visual anchor for maintaining character consistency across all book pages.

The character sheet is a clean, front-facing portrait of the subject in the
chosen illustration style. This image is then used as a reference image for
all subsequent page generations.
"""

from typing import Tuple, Optional
from .base import AgentBase

import sys
sys.path.append('..')

from models.visual import VisualFingerprint
from models.user_input import BookPreferences, ReferenceImages
from models.generation import GenerationResult
from prompts.master_prompts import CHARACTER_SHEET_PROMPT, build_prompt
from prompts.language_utils import resolve_language


class CharacterSheetGeneratorAgent(AgentBase[
    Tuple[VisualFingerprint, BookPreferences, ReferenceImages, str, str],
    Optional[str]
]):
    """
    Agent responsible for generating a character reference sheet.
    
    Creates a clean, front-facing portrait illustration of the character
    in the chosen style. This image becomes the visual anchor for all
    subsequent page generations, ensuring character consistency.
    """
    
    # Use the image generation model
    MODEL = "gemini-2.5-flash-image"

    async def run(
        self,
        input_data: Tuple[VisualFingerprint, BookPreferences, ReferenceImages, str, str]
    ) -> Optional[str]:
        """
        Generate a character reference sheet.
        
        Args:
            input_data: Tuple of (VisualFingerprint, BookPreferences, ReferenceImages, output_dir, user_language)
            
        Returns:
            Path to the generated character sheet image, or None if generation failed
        """
        fingerprint, preferences, reference_images, output_dir, user_language = input_data
        user_language = resolve_language(user_language)
        
        self._log_info(f"Generating character reference sheet (style: {preferences.style}, language: {user_language})")
        
        # Build the character sheet prompt
        prompt = self._build_character_sheet_prompt(fingerprint, preferences, user_language)
        
        # Determine reference images to pass
        ref_paths = reference_images.paths if reference_images.has_images() else None
        
        # Output path for the character sheet
        import os
        output_path = os.path.join(output_dir, "character_ref.jpg")
        
        # Generate the character sheet image
        max_attempts = 3
        for attempt in range(max_attempts):
            try:
                result: GenerationResult = await self.gemini.generate_image(
                    prompt=prompt,
                    output_path=output_path,
                    reference_images=ref_paths,
                )
                
                if result.success and result.image_path:
                    self._log_info(f"Character sheet generated successfully: {result.image_path}")
                    return result.image_path
                
                self._log_warning(
                    f"Character sheet generation attempt {attempt + 1} failed: "
                    f"{result.error_message or 'No image data returned'}"
                )
                
            except Exception as e:
                self._log_warning(f"Character sheet generation attempt {attempt + 1} error: {str(e)}")
            
            if attempt < max_attempts - 1:
                import asyncio
                await asyncio.sleep(1)
        
        self._log_error("Failed to generate character sheet after all attempts")
        return None
    
    def _build_character_sheet_prompt(
        self,
        fingerprint: VisualFingerprint,
        preferences: BookPreferences,
        user_language: str
    ) -> str:
        """Build the prompt for character sheet generation."""
        
        # Get character description
        char_desc = fingerprint.get_prompt_description()
        
        # Style-specific instructions
        style_instructions = {
            "coloring": "coloring book style, clean black outlines on white background, no shading, simple clear lines",
            "cartoon": "cartoon style, bright colors, bold outlines, expressive features, clean background",
            "anime": "anime style, soft shading, detailed features, expressive eyes, clean background",
            "watercolor": "watercolor painting style, soft edges, delicate brushstrokes, warm colors, clean background"
        }
        
        style = style_instructions.get(preferences.style, "illustrated style")
        
        # Build do_not_change instructions
        identity_rules = ""
        if fingerprint.do_not_change:
            identity_rules = "\nCRITICAL FEATURES THAT MUST BE PRESENT:\n" + "\n".join(
                f"- {feature}" for feature in fingerprint.do_not_change
            )
        
        prompt = f"""CHARACTER REFERENCE SHEET - {style}

Create a clean, front-facing portrait illustration of a character for a memory book.
This is a CHARACTER REFERENCE SHEET that will be used to maintain visual consistency 
across all pages of the book.

CHARACTER DESCRIPTION:
{char_desc}
{identity_rules}

REQUIREMENTS:
- Front-facing portrait, head and upper body visible
- Neutral, warm expression (gentle smile)
- Clean, simple background (solid or very subtle gradient)
- Character should be depicted as an adult (primary representation)
- The illustration must clearly show all identifying features
- {style}
- High quality, professional illustration
- The character should look approachable and warm

COMPOSITION:
- Centered portrait
- Character fills most of the frame
- Clear visibility of facial features, hair, and upper body
- Well-lit, no dramatic shadows

CRITICAL: The image must contain absolutely NO text, letters, words, numbers, signs, or typography of any kind. Pure visual illustration only."""

        return prompt
