"""
Review Models

Models for image quality control and review.
"""

from typing import Optional, Literal
from pydantic import BaseModel, Field


class QualityMetrics(BaseModel):
    """Quality metrics for an image."""
    
    overall_score: float = Field(
        default=0.0,
        ge=0.0,
        le=10.0,
        description="Overall quality score (0-10)"
    )
    technical_quality: float = Field(
        default=0.0,
        ge=0.0,
        le=10.0,
        description="Technical quality (resolution, clarity)"
    )
    artistic_quality: float = Field(
        default=0.0,
        ge=0.0,
        le=10.0,
        description="Artistic quality (composition, aesthetics)"
    )
    style_consistency: float = Field(
        default=0.0,
        ge=0.0,
        le=10.0,
        description="Consistency with chosen style"
    )
    character_accuracy: float = Field(
        default=0.0,
        ge=0.0,
        le=10.0,
        description="Accuracy of character representation"
    )
    narrative_fit: float = Field(
        default=0.0,
        ge=0.0,
        le=10.0,
        description="How well it fits the narrative"
    )


class ImageQCResult(BaseModel):
    """Quality control result for a single image."""
    
    page_number: int = Field(
        ...,
        description="Page number of the reviewed image"
    )
    image_path: str = Field(
        ...,
        description="Path to the reviewed image"
    )
    passed: bool = Field(
        ...,
        description="Whether the image passed QC"
    )
    metrics: QualityMetrics = Field(
        default_factory=QualityMetrics,
        description="Quality metrics"
    )
    issues_found: list[str] = Field(
        default_factory=list,
        description="List of issues found"
    )
    suggestions: list[str] = Field(
        default_factory=list,
        description="Suggestions for improvement"
    )
    requires_regeneration: bool = Field(
        default=False,
        description="Whether the image needs to be regenerated"
    )
    fingerprint_match_score: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="How well the image matches the visual fingerprint"
    )


class IllustrationReviewItem(BaseModel):
    """Review of illustration quality for a single image."""
    
    page_number: int = Field(
        ...,
        description="Page number being reviewed"
    )
    artistic_assessment: str = Field(
        ...,
        description="Overall artistic assessment"
    )
    composition_notes: str = Field(
        default="",
        description="Notes on composition"
    )
    color_harmony: Literal["excellent", "good", "acceptable", "poor"] = Field(
        default="good",
        description="Assessment of color harmony"
    )
    emotional_impact: Literal["strong", "moderate", "weak"] = Field(
        default="moderate",
        description="Emotional impact of the illustration"
    )
    style_adherence: Literal["perfect", "good", "acceptable", "inconsistent"] = Field(
        default="good",
        description="How well it adheres to the chosen style"
    )
    strengths: list[str] = Field(
        default_factory=list,
        description="Strengths of the illustration"
    )
    areas_for_improvement: list[str] = Field(
        default_factory=list,
        description="Areas that could be improved"
    )
    recommended_action: Literal["approve", "minor_edit", "regenerate"] = Field(
        default="approve",
        description="Recommended action"
    )


class DesignReview(BaseModel):
    """Overall design review for the book."""
    
    overall_cohesion: float = Field(
        default=0.0,
        ge=0.0,
        le=10.0,
        description="Overall visual cohesion score"
    )
    style_consistency_score: float = Field(
        default=0.0,
        ge=0.0,
        le=10.0,
        description="Consistency of style across pages"
    )
    color_palette_harmony: float = Field(
        default=0.0,
        ge=0.0,
        le=10.0,
        description="Harmony of color palette"
    )
    narrative_flow: float = Field(
        default=0.0,
        ge=0.0,
        le=10.0,
        description="How well the visual narrative flows"
    )
    character_consistency: float = Field(
        default=0.0,
        ge=0.0,
        le=10.0,
        description="Consistency of character representation"
    )
    page_reviews: list[IllustrationReviewItem] = Field(
        default_factory=list,
        description="Individual page reviews"
    )
    global_issues: list[str] = Field(
        default_factory=list,
        description="Issues affecting the whole book"
    )
    global_suggestions: list[str] = Field(
        default_factory=list,
        description="Suggestions for the whole book"
    )
    pages_needing_attention: list[int] = Field(
        default_factory=list,
        description="Page numbers that need attention"
    )
    approved: bool = Field(
        default=False,
        description="Whether the design is approved"
    )
    
    def get_average_score(self) -> float:
        """Calculate the average of all scores."""
        scores = [
            self.overall_cohesion,
            self.style_consistency_score,
            self.color_palette_harmony,
            self.narrative_flow,
            self.character_consistency
        ]
        return sum(scores) / len(scores) if scores else 0.0
