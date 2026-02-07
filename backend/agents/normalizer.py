"""
Normalizer Agent

Cleans and structures user form data into a normalized profile.
"""

from typing import Tuple
from .base import AgentBase

import sys
sys.path.append('..')

from models.user_input import UserForm, BookPreferences
from models.profile import NormalizedProfile, NormalizedLifePhase
from prompts.master_prompts import NORMALIZER_PROMPT, build_prompt
from prompts.language_utils import resolve_language


class NormalizerAgent(AgentBase[Tuple[UserForm, BookPreferences, str], NormalizedProfile]):
    """
    Agent responsible for normalizing user input.
    
    Takes raw user form data and transforms it into a clean,
    structured profile suitable for narrative planning.
    """
    
    # Use fast model for normalization tasks
    MODEL = "gemini-2.0-flash"

    async def run(self, input_data: Tuple[UserForm, BookPreferences, str]) -> NormalizedProfile:
        """
        Normalize user form data into a structured profile.
        
        Args:
            input_data: Tuple of (UserForm, BookPreferences, user_language)
            
        Returns:
            NormalizedProfile with cleaned and structured data
        """
        # Handle both old and new format
        if len(input_data) == 2:
            user_form, preferences = input_data
            user_language = "en-US"
        else:
            user_form, preferences, user_language = input_data
        
        user_language = resolve_language(user_language)
        
        self._log_info(f"Starting normalization (language: {user_language})")
        
        # Build prompt with language
        system_prompt = build_prompt(NORMALIZER_PROMPT, user_language)
        
        # Prepare the user prompt with form data
        user_prompt = self._build_user_prompt(user_form, preferences, user_language)
        
        # Call Gemini to normalize the data
        try:
            result = await self.gemini.generate_json(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                schema=NormalizedProfile
            )
            
            normalized_profile = NormalizedProfile(**result)
            self._log_info(f"Normalized {len(normalized_profile.life_phases)} life phases")
            
            return normalized_profile
            
        except Exception as e:
            self._log_error(f"Normalization failed: {str(e)}")
            # Return a basic normalized profile as fallback
            return self._create_fallback_profile(user_form, preferences)
    
    def _build_user_prompt(self, user_form: UserForm, preferences: BookPreferences, user_language: str) -> str:
        """Build the user prompt for Gemini."""
        prompt_parts = [
            f"User Language: {user_language}",
            f"Book Title: {preferences.title}",
            f"Book Date: {preferences.date}",
            f"Style: {preferences.style}",
            f"Page Count: {preferences.page_count}",
            "",
            "=== LIFE PHASES DATA ===",
            "",
            "CHILDHOOD (0-12 years):",
            f"  Memories: {', '.join(user_form.young.memories) or 'None provided'}",
            f"  Key Events: {', '.join(user_form.young.key_events) or 'None provided'}",
            f"  Emotions: {', '.join(user_form.young.emotions) or 'None provided'}",
            "",
            "TEENAGE YEARS (13-19 years):",
            f"  Memories: {', '.join(user_form.adolescent.memories) or 'None provided'}",
            f"  Key Events: {', '.join(user_form.adolescent.key_events) or 'None provided'}",
            f"  Emotions: {', '.join(user_form.adolescent.emotions) or 'None provided'}",
            "",
            "ADULT LIFE (20-59 years):",
            f"  Memories: {', '.join(user_form.adult.memories) or 'None provided'}",
            f"  Key Events: {', '.join(user_form.adult.key_events) or 'None provided'}",
            f"  Emotions: {', '.join(user_form.adult.emotions) or 'None provided'}",
            "",
            "LATER LIFE (60+ years):",
            f"  Memories: {', '.join(user_form.elderly.memories) or 'None provided'}",
            f"  Key Events: {', '.join(user_form.elderly.key_events) or 'None provided'}",
            f"  Emotions: {', '.join(user_form.elderly.emotions) or 'None provided'}",
            "",
            f"IMPORTANT: All output text must be in {user_language}.",
            "Please normalize this data into a structured profile."
        ]
        
        return "\n".join(prompt_parts)
    
    def _create_fallback_profile(self, user_form: UserForm, preferences: BookPreferences) -> NormalizedProfile:
        """Create a basic profile as fallback if Gemini fails."""
        phases = []
        
        phase_mapping = [
            ("young", "0-12 years", user_form.young),
            ("adolescent", "13-19 years", user_form.adolescent),
            ("adult", "20-59 years", user_form.adult),
            ("elderly", "60+ years", user_form.elderly),
        ]
        
        for phase_name, age_range, phase_data in phase_mapping:
            if phase_data.memories or phase_data.key_events:
                phases.append(NormalizedLifePhase(
                    phase_name=phase_name,
                    age_range=age_range,
                    core_memories=phase_data.memories,
                    significant_events=phase_data.key_events,
                    emotional_themes=phase_data.emotions,
                    narrative_elements=phase_data.memories[:3]
                ))
        
        return NormalizedProfile(
            subject_name=preferences.title.replace("'s Memory Book", "").strip(),
            life_phases=phases,
            overall_themes=[],
            personality_traits=[],
            visual_motifs=[]
        )
