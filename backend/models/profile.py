"""
Profile Models

Models for normalized user profile data.
"""

from pydantic import BaseModel, Field


class NormalizedLifePhase(BaseModel):
    """Cleaned and structured life phase data."""
    
    phase_name: str = Field(
        ...,
        description="Name of the life phase (young, adolescent, adult, elderly)"
    )
    age_range: str = Field(
        ...,
        description="Age range for this phase (e.g., '0-12 years')"
    )
    core_memories: list[str] = Field(
        default_factory=list,
        description="Cleaned and deduplicated core memories"
    )
    significant_events: list[str] = Field(
        default_factory=list,
        description="Key life events, cleaned and structured"
    )
    emotional_themes: list[str] = Field(
        default_factory=list,
        description="Dominant emotional themes identified"
    )
    narrative_elements: list[str] = Field(
        default_factory=list,
        description="Elements suitable for visual storytelling"
    )


class NormalizedProfile(BaseModel):
    """Complete normalized profile with all life phases."""
    
    subject_name: str = Field(
        default="",
        description="Name of the book's subject (if provided)"
    )
    life_phases: list[NormalizedLifePhase] = Field(
        default_factory=list,
        description="All normalized life phases"
    )
    overall_themes: list[str] = Field(
        default_factory=list,
        description="Themes that span across multiple life phases"
    )
    personality_traits: list[str] = Field(
        default_factory=list,
        description="Inferred personality traits from the memories"
    )
    visual_motifs: list[str] = Field(
        default_factory=list,
        description="Recurring visual elements suitable for illustrations"
    )
    
    def get_phase(self, phase_name: str) -> NormalizedLifePhase | None:
        """Get a specific life phase by name."""
        for phase in self.life_phases:
            if phase.phase_name == phase_name:
                return phase
        return None
    
    def get_all_memories(self) -> list[str]:
        """Get all memories across all phases."""
        memories = []
        for phase in self.life_phases:
            memories.extend(phase.core_memories)
        return memories
