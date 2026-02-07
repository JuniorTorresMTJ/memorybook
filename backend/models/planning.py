"""
Planning Models

Models for narrative planning and page concepts.
"""

from typing import Optional, Literal
from pydantic import BaseModel, Field


class PagePlanItem(BaseModel):
    """Plan for a single page in the book."""
    
    page_number: int = Field(
        ...,
        ge=1,
        description="Page number in the book"
    )
    life_phase: str = Field(
        ...,
        description="Life phase this page represents"
    )
    memory_reference: str = Field(
        ...,
        description="The specific memory being illustrated"
    )
    scene_description: str = Field(
        ...,
        description="Description of the scene to be illustrated"
    )
    emotional_tone: str = Field(
        ...,
        description="Emotional tone of the illustration"
    )
    key_elements: list[str] = Field(
        default_factory=list,
        description="Key visual elements to include"
    )
    setting: str = Field(
        default="",
        description="Setting/location for the scene"
    )
    characters_present: list[str] = Field(
        default_factory=list,
        description="Characters to include in the scene"
    )
    suggested_composition: str = Field(
        default="",
        description="Suggested composition or layout"
    )
    narrative_text: Optional[str] = Field(
        default=None,
        description="Optional text to accompany the illustration"
    )


class CoverConcept(BaseModel):
    """Concept for the book cover."""
    
    main_subject_pose: str = Field(
        ...,
        description="How the main subject should be posed"
    )
    background_elements: list[str] = Field(
        default_factory=list,
        description="Background elements to include"
    )
    color_scheme: list[str] = Field(
        default_factory=list,
        description="Primary colors for the cover"
    )
    mood: str = Field(
        ...,
        description="Overall mood of the cover"
    )
    title_placement: str = Field(
        default="top-center",
        description="Where to place the title"
    )
    title_space_reserved: bool = Field(
        default=True,
        description="Whether space is reserved for the title"
    )
    symbolic_elements: list[str] = Field(
        default_factory=list,
        description="Symbolic elements representing the life story"
    )
    composition_notes: str = Field(
        default="",
        description="Notes on the overall composition"
    )


class BackCoverConcept(BaseModel):
    """Concept for the book back cover."""
    
    design_type: Literal["symbolic", "pattern", "scene", "minimal"] = Field(
        default="symbolic",
        description="Type of back cover design"
    )
    main_elements: list[str] = Field(
        default_factory=list,
        description="Main visual elements"
    )
    color_scheme: list[str] = Field(
        default_factory=list,
        description="Color scheme (should complement front cover)"
    )
    symbolic_meaning: str = Field(
        default="",
        description="Meaning behind the symbolic elements"
    )
    text_area: bool = Field(
        default=False,
        description="Whether to include a text area"
    )
    text_content: Optional[str] = Field(
        default=None,
        description="Optional text for the back cover"
    )


class NarrativePlan(BaseModel):
    """Complete narrative plan for the book."""
    
    book_title: str = Field(
        ...,
        description="Title of the book"
    )
    total_pages: int = Field(
        ...,
        ge=10,
        le=20,
        description="Total number of pages"
    )
    cover: CoverConcept = Field(
        ...,
        description="Front cover concept"
    )
    back_cover: BackCoverConcept = Field(
        ...,
        description="Back cover concept"
    )
    pages: list[PagePlanItem] = Field(
        default_factory=list,
        description="Plan for each internal page"
    )
    narrative_arc: str = Field(
        default="",
        description="Description of the overall narrative arc"
    )
    visual_themes: list[str] = Field(
        default_factory=list,
        description="Visual themes to maintain throughout"
    )
    color_progression: str = Field(
        default="",
        description="How colors should progress through the book"
    )
    
    def get_pages_by_phase(self, phase: str) -> list[PagePlanItem]:
        """Get all pages for a specific life phase."""
        return [p for p in self.pages if p.life_phase == phase]
    
    def validate_page_count(self) -> bool:
        """Validate that the number of pages matches the plan."""
        return len(self.pages) == self.total_pages
