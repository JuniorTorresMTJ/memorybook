"""
Output Models

Models for the final book package output.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from .generation import GenerationResult
from .review import DesignReview
from .planning import NarrativePlan
from .visual import VisualFingerprint


class BookPage(BaseModel):
    """A single page in the final book."""
    
    page_number: int = Field(
        ...,
        description="Page number (0 for cover, -1 for back cover)"
    )
    page_type: str = Field(
        ...,
        description="Type of page (cover, back_cover, content)"
    )
    image_path: str = Field(
        ...,
        description="Path to the final image"
    )
    image_data: Optional[str] = Field(
        default=None,
        description="Base64 encoded image data (data URL) for persistence"
    )
    thumbnail_path: Optional[str] = Field(
        default=None,
        description="Path to thumbnail image"
    )
    narrative_text: Optional[str] = Field(
        default=None,
        description="Text accompanying the page"
    )
    life_phase: Optional[str] = Field(
        default=None,
        description="Life phase this page represents"
    )
    memory_reference: Optional[str] = Field(
        default=None,
        description="The memory being illustrated"
    )
    generation_attempts: int = Field(
        default=1,
        description="Number of generation attempts"
    )


class FinalBookPackage(BaseModel):
    """Complete final book package with all assets and metadata."""
    
    book_id: str = Field(
        ...,
        description="Unique identifier for this book"
    )
    title: str = Field(
        ...,
        description="Book title"
    )
    style: str = Field(
        ...,
        description="Illustration style used"
    )
    created_at: datetime = Field(
        default_factory=datetime.now,
        description="When the book was created"
    )
    
    # Book content
    cover: BookPage = Field(
        ...,
        description="Front cover page"
    )
    back_cover: BookPage = Field(
        ...,
        description="Back cover page"
    )
    pages: list[BookPage] = Field(
        default_factory=list,
        description="All content pages"
    )
    
    # Metadata
    total_pages: int = Field(
        ...,
        description="Total number of pages including covers"
    )
    narrative_plan: Optional[NarrativePlan] = Field(
        default=None,
        description="The narrative plan used"
    )
    visual_fingerprint: Optional[VisualFingerprint] = Field(
        default=None,
        description="Visual fingerprint used for consistency"
    )
    design_review: Optional[DesignReview] = Field(
        default=None,
        description="Final design review"
    )
    
    # Generation stats
    total_generation_time_ms: int = Field(
        default=0,
        description="Total time for all generations"
    )
    total_retries: int = Field(
        default=0,
        description="Total number of retries across all pages"
    )
    
    # Output paths
    output_directory: str = Field(
        default="",
        description="Directory containing all output files"
    )
    pdf_path: Optional[str] = Field(
        default=None,
        description="Path to the generated PDF"
    )
    
    def get_all_image_paths(self) -> list[str]:
        """Get all image paths in order."""
        paths = [self.cover.image_path]
        paths.extend([p.image_path for p in self.pages])
        paths.append(self.back_cover.image_path)
        return paths
    
    def get_page(self, page_number: int) -> Optional[BookPage]:
        """Get a specific page by number."""
        if page_number == 0:
            return self.cover
        elif page_number == -1:
            return self.back_cover
        else:
            for page in self.pages:
                if page.page_number == page_number:
                    return page
        return None
    
    @property
    def is_complete(self) -> bool:
        """Check if the book package is complete."""
        return (
            self.cover is not None
            and self.back_cover is not None
            and len(self.pages) == self.total_pages - 2  # Excluding covers
        )
