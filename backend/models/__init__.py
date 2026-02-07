"""
MemoryBook Models Module

Contains all Pydantic models for data validation and serialization.
"""

from .user_input import LifePhase, UserForm, BookPreferences, ReferenceImages
from .profile import NormalizedProfile, NormalizedLifePhase
from .visual import VisualFingerprint, FacialFeatures, BodyCharacteristics, StyleAttributes
from .planning import PagePlanItem, CoverConcept, BackCoverConcept, NarrativePlan
from .prompts import PromptItem, RenderParams
from .generation import GenerationResult, GenerationMetadata
from .review import ImageQCResult, IllustrationReviewItem, DesignReview, QualityMetrics
from .output import FinalBookPackage, BookPage

__all__ = [
    # User Input
    "LifePhase",
    "UserForm",
    "BookPreferences",
    "ReferenceImages",
    # Profile
    "NormalizedProfile",
    "NormalizedLifePhase",
    # Visual
    "VisualFingerprint",
    "FacialFeatures",
    "BodyCharacteristics",
    "StyleAttributes",
    # Planning
    "PagePlanItem",
    "CoverConcept",
    "BackCoverConcept",
    "NarrativePlan",
    # Prompts
    "PromptItem",
    "RenderParams",
    # Generation
    "GenerationResult",
    "GenerationMetadata",
    # Review
    "ImageQCResult",
    "IllustrationReviewItem",
    "DesignReview",
    "QualityMetrics",
    # Output
    "FinalBookPackage",
    "BookPage",
]
