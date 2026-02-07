"""
Narrative Planner Agent

Creates the narrative plan for the memory book.
"""

from typing import Tuple
from .base import AgentBase

import sys
sys.path.append('..')

from models.profile import NormalizedProfile
from models.user_input import BookPreferences
from models.planning import NarrativePlan, PagePlanItem, CoverConcept, BackCoverConcept
from prompts.master_prompts import NARRATIVE_PLANNER_PROMPT, build_prompt
from prompts.language_utils import resolve_language


class NarrativePlannerAgent(AgentBase[Tuple[NormalizedProfile, BookPreferences, str], NarrativePlan]):
    """
    Agent responsible for creating the narrative plan.
    
    Takes a normalized profile and creates a complete plan for
    the book including cover, pages, and back cover.
    """
    
    # Use creative model for narrative planning
    MODEL = "gemini-2.0-pro-exp"

    async def run(self, input_data: Tuple[NormalizedProfile, BookPreferences, str]) -> NarrativePlan:
        """
        Create a narrative plan for the book.
        
        Args:
            input_data: Tuple of (NormalizedProfile, BookPreferences, user_language)
            
        Returns:
            Complete NarrativePlan for the book
        """
        # Handle both old and new format
        if len(input_data) == 2:
            profile, preferences = input_data
            user_language = "en-US"
        else:
            profile, preferences, user_language = input_data
        
        user_language = resolve_language(user_language)
        
        self._log_info(f"Creating narrative plan for {preferences.page_count} pages (language: {user_language})")
        
        # Build prompt with language
        system_prompt = build_prompt(NARRATIVE_PLANNER_PROMPT, user_language)
        user_prompt = self._build_user_prompt(profile, preferences, user_language)
        
        try:
            result = await self.gemini.generate_json(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                schema=NarrativePlan
            )
            
            plan = NarrativePlan(**result)
            self._log_info(f"Created plan with {len(plan.pages)} pages")
            
            return plan
            
        except Exception as e:
            self._log_error(f"Narrative planning failed: {str(e)}")
            return self._create_fallback_plan(profile, preferences)
    
    def _build_user_prompt(self, profile: NormalizedProfile, preferences: BookPreferences, user_language: str) -> str:
        """Build the user prompt for narrative planning."""
        parts = [
            f"User Language: {user_language}",
            f"Create a narrative plan for a {preferences.page_count}-page memory book.",
            f"Title: {preferences.title}",
            f"Style: {preferences.style}",
            "",
            "=== PROFILE DATA ===",
            f"Subject: {profile.subject_name or 'Unknown'}",
            f"Overall Themes: {', '.join(profile.overall_themes) or 'None identified'}",
            f"Personality Traits: {', '.join(profile.personality_traits) or 'None identified'}",
            f"Visual Motifs: {', '.join(profile.visual_motifs) or 'None identified'}",
            ""
        ]
        
        for phase in profile.life_phases:
            parts.extend([
                f"=== {phase.phase_name.upper()} ({phase.age_range}) ===",
                f"Core Memories: {', '.join(phase.core_memories) or 'None'}",
                f"Significant Events: {', '.join(phase.significant_events) or 'None'}",
                f"Emotional Themes: {', '.join(phase.emotional_themes) or 'None'}",
                f"Narrative Elements: {', '.join(phase.narrative_elements) or 'None'}",
                ""
            ])
        
        parts.extend([
            "=== TASK ===",
            f"IMPORTANT: All descriptive text (scene_summary, emotional_goal, etc.) MUST be in {user_language}.",
            "",
            "Please create:",
            "1. A cover concept that captures the person's essence",
            "2. Page plans for each internal page",
            "3. A symbolic back cover concept",
            "",
            f"Distribute the {preferences.page_count} pages across life phases appropriately."
        ])
        
        return "\n".join(parts)
    
    def _create_fallback_plan(self, profile: NormalizedProfile, preferences: BookPreferences) -> NarrativePlan:
        """Create a basic plan as fallback."""
        pages_per_phase = preferences.page_count // 4
        extra_pages = preferences.page_count % 4
        
        pages = []
        page_num = 1
        
        for i, phase in enumerate(profile.life_phases):
            num_pages = pages_per_phase + (1 if i < extra_pages else 0)
            
            for j in range(num_pages):
                memory = phase.core_memories[j] if j < len(phase.core_memories) else f"Memory from {phase.phase_name}"
                
                pages.append(PagePlanItem(
                    page_number=page_num,
                    life_phase=phase.phase_name,
                    memory_reference=memory,
                    scene_description=f"Illustration of: {memory}",
                    emotional_tone=phase.emotional_themes[0] if phase.emotional_themes else "nostalgic",
                    key_elements=[],
                    setting="",
                    characters_present=[profile.subject_name or "subject"],
                    suggested_composition="centered"
                ))
                page_num += 1
        
        return NarrativePlan(
            book_title=preferences.title,
            total_pages=preferences.page_count,
            cover=CoverConcept(
                main_subject_pose="portrait, looking at viewer",
                background_elements=profile.visual_motifs[:3] if profile.visual_motifs else [],
                color_scheme=["warm", "inviting"],
                mood="welcoming",
                title_placement="top-center",
                title_space_reserved=True,
                symbolic_elements=[]
            ),
            back_cover=BackCoverConcept(
                design_type="symbolic",
                main_elements=profile.visual_motifs[:2] if profile.visual_motifs else [],
                color_scheme=["warm", "complementary"],
                symbolic_meaning="Life's journey"
            ),
            pages=pages,
            narrative_arc="A journey through life's memorable moments",
            visual_themes=profile.visual_motifs or [],
            color_progression="warm to warm"
        )
