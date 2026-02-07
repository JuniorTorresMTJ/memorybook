"""
Tests for Pydantic Models

Tests validation and serialization of all model classes.
"""

import pytest
from datetime import datetime

import sys
sys.path.insert(0, '..')

from models.user_input import LifePhase, UserForm, BookPreferences, ReferenceImages
from models.profile import NormalizedProfile, NormalizedLifePhase
from models.visual import VisualFingerprint, FacialFeatures, BodyCharacteristics, StyleAttributes
from models.planning import PagePlanItem, CoverConcept, BackCoverConcept, NarrativePlan
from models.prompts import PromptItem, RenderParams
from models.generation import GenerationResult, GenerationMetadata
from models.review import ImageQCResult, IllustrationReviewItem, DesignReview, QualityMetrics
from models.output import FinalBookPackage, BookPage


class TestLifePhase:
    """Tests for LifePhase model."""
    
    def test_create_empty_life_phase(self):
        """Test creating an empty life phase."""
        phase = LifePhase()
        assert phase.memories == []
        assert phase.key_events == []
        assert phase.emotions == []
    
    def test_create_life_phase_with_data(self):
        """Test creating a life phase with data."""
        phase = LifePhase(
            memories=["First day of school", "Birthday party"],
            key_events=["Birth", "Started walking"],
            emotions=["Joy", "Wonder"]
        )
        assert len(phase.memories) == 2
        assert len(phase.key_events) == 2
        assert len(phase.emotions) == 2


class TestUserForm:
    """Tests for UserForm model."""
    
    def test_create_empty_user_form(self):
        """Test creating an empty user form."""
        form = UserForm()
        assert form.young.memories == []
        assert form.adolescent.memories == []
        assert form.adult.memories == []
        assert form.elderly.memories == []
    
    def test_create_user_form_with_data(self):
        """Test creating a user form with data."""
        form = UserForm(
            young=LifePhase(memories=["Childhood memory"]),
            adolescent=LifePhase(memories=["Teen memory"]),
            adult=LifePhase(memories=["Adult memory"]),
            elderly=LifePhase(memories=["Later life memory"])
        )
        assert form.young.memories[0] == "Childhood memory"


class TestBookPreferences:
    """Tests for BookPreferences model."""
    
    def test_create_valid_preferences(self):
        """Test creating valid book preferences."""
        prefs = BookPreferences(
            title="My Memory Book",
            date="2024-03-15",
            page_count=15,
            style="watercolor"
        )
        assert prefs.title == "My Memory Book"
        assert prefs.page_count == 15
        assert prefs.style == "watercolor"
    
    def test_default_values(self):
        """Test default values."""
        prefs = BookPreferences(
            title="Test Book",
            date="2024-01-01"
        )
        assert prefs.page_count == 10
        assert prefs.style == "watercolor"
    
    def test_invalid_page_count(self):
        """Test invalid page count raises error."""
        with pytest.raises(ValueError):
            BookPreferences(
                title="Test",
                date="2024-01-01",
                page_count=25  # Invalid - must be 10, 15, or 20
            )


class TestReferenceImages:
    """Tests for ReferenceImages model."""
    
    def test_validate_minimum_images(self):
        """Test minimum images validation."""
        images = ReferenceImages(paths=["/img1.jpg", "/img2.jpg", "/img3.jpg"])
        assert images.validate_minimum_images() == True
    
    def test_validate_insufficient_images(self):
        """Test validation with insufficient images."""
        images = ReferenceImages(paths=["/img1.jpg", "/img2.jpg"])
        assert images.validate_minimum_images() == False


class TestNormalizedProfile:
    """Tests for NormalizedProfile model."""
    
    def test_create_profile(self):
        """Test creating a normalized profile."""
        profile = NormalizedProfile(
            subject_name="Maria",
            life_phases=[
                NormalizedLifePhase(
                    phase_name="young",
                    age_range="0-12 years",
                    core_memories=["Memory 1"]
                )
            ],
            overall_themes=["Family", "Adventure"]
        )
        assert profile.subject_name == "Maria"
        assert len(profile.life_phases) == 1
    
    def test_get_phase(self):
        """Test getting a specific phase."""
        profile = NormalizedProfile(
            life_phases=[
                NormalizedLifePhase(phase_name="young", age_range="0-12"),
                NormalizedLifePhase(phase_name="adult", age_range="20-59")
            ]
        )
        phase = profile.get_phase("adult")
        assert phase is not None
        assert phase.phase_name == "adult"
    
    def test_get_all_memories(self):
        """Test getting all memories."""
        profile = NormalizedProfile(
            life_phases=[
                NormalizedLifePhase(
                    phase_name="young",
                    age_range="0-12",
                    core_memories=["Memory 1", "Memory 2"]
                ),
                NormalizedLifePhase(
                    phase_name="adult",
                    age_range="20-59",
                    core_memories=["Memory 3"]
                )
            ]
        )
        memories = profile.get_all_memories()
        assert len(memories) == 3


class TestVisualFingerprint:
    """Tests for VisualFingerprint model."""
    
    def test_get_prompt_description(self):
        """Test generating prompt description."""
        fingerprint = VisualFingerprint(
            facial_features=FacialFeatures(
                face_shape="oval",
                eye_color="brown",
                hair_color="black",
                hair_style="long",
                skin_tone="medium"
            )
        )
        desc = fingerprint.get_prompt_description()
        assert "oval face" in desc
        assert "brown eyes" in desc
        assert "black long hair" in desc


class TestPromptItem:
    """Tests for PromptItem model."""
    
    def test_get_full_prompt(self):
        """Test combining prompt components."""
        prompt = PromptItem(
            page_number=1,
            prompt_type="page",
            main_prompt="A child playing in the garden",
            character_description="Young girl with brown hair",
            scene_description="Sunny garden with flowers"
        )
        full = prompt.get_full_prompt()
        assert "child playing" in full
        assert "brown hair" in full
    
    def test_get_negative_prompt(self):
        """Test generating negative prompt."""
        prompt = PromptItem(
            page_number=0,
            prompt_type="cover",
            main_prompt="Test",
            negative_constraints=["text on image", "multiple faces"]
        )
        negative = prompt.get_negative_prompt()
        assert "text on image" in negative
        assert "blurry" in negative  # Default negative


class TestGenerationResult:
    """Tests for GenerationResult model."""
    
    def test_has_image(self):
        """Test has_image property."""
        result = GenerationResult(
            success=True,
            image_path="/path/to/image.png"
        )
        assert result.has_image == True
    
    def test_failed_result(self):
        """Test failed result."""
        result = GenerationResult(
            success=False,
            error_message="Generation failed"
        )
        assert result.has_image == False


class TestDesignReview:
    """Tests for DesignReview model."""
    
    def test_get_average_score(self):
        """Test calculating average score."""
        review = DesignReview(
            overall_cohesion=8.0,
            style_consistency_score=7.0,
            color_palette_harmony=9.0,
            narrative_flow=8.0,
            character_consistency=8.0
        )
        avg = review.get_average_score()
        assert avg == 8.0


class TestFinalBookPackage:
    """Tests for FinalBookPackage model."""
    
    def test_get_all_image_paths(self):
        """Test getting all image paths."""
        package = FinalBookPackage(
            book_id="test-123",
            title="Test Book",
            style="watercolor",
            cover=BookPage(page_number=0, page_type="cover", image_path="/cover.png"),
            back_cover=BookPage(page_number=-1, page_type="back_cover", image_path="/back.png"),
            pages=[
                BookPage(page_number=1, page_type="content", image_path="/page1.png"),
                BookPage(page_number=2, page_type="content", image_path="/page2.png")
            ],
            total_pages=4
        )
        paths = package.get_all_image_paths()
        assert len(paths) == 4
        assert paths[0] == "/cover.png"
        assert paths[-1] == "/back.png"
    
    def test_is_complete(self):
        """Test is_complete property."""
        package = FinalBookPackage(
            book_id="test",
            title="Test",
            style="cartoon",
            cover=BookPage(page_number=0, page_type="cover", image_path="/c.png"),
            back_cover=BookPage(page_number=-1, page_type="back_cover", image_path="/b.png"),
            pages=[BookPage(page_number=i, page_type="content", image_path=f"/{i}.png") for i in range(1, 11)],
            total_pages=12
        )
        assert package.is_complete == True
