"""
Tests for AI Agents

Tests basic functionality of all agent classes.
"""

import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch

import sys
sys.path.insert(0, '..')

from agents.base import AgentBase
from agents.normalizer import NormalizerAgent
from agents.narrative_planner import NarrativePlannerAgent
from agents.visual_analyzer import VisualAnalyzerAgent
from agents.cover_creator import CoverCreatorAgent
from agents.back_cover_creator import BackCoverCreatorAgent
from agents.prompt_writer import PromptWriterAgent
from agents.prompt_reviewer import PromptReviewerAgent
from agents.illustrator_reviewer import IllustratorReviewerAgent
from agents.designer_reviewer import DesignerReviewerAgent
from agents.image_validator import ImageValidatorAgent
from agents.iterative_fix import IterativeFixAgent

from models.user_input import UserForm, BookPreferences, ReferenceImages, LifePhase
from models.profile import NormalizedProfile, NormalizedLifePhase
from models.visual import VisualFingerprint
from models.planning import NarrativePlan, CoverConcept, BackCoverConcept
from models.prompts import PromptItem
from models.generation import GenerationResult, GenerationMetadata
from models.review import ImageQCResult, QualityMetrics


@pytest.fixture
def mock_gemini_client():
    """Create a mock Gemini client."""
    client = Mock()
    client.generate_json = AsyncMock(return_value={})
    client.analyze_images = AsyncMock(return_value={})
    client.revise_text = AsyncMock(return_value={})
    return client


@pytest.fixture
def mock_logger():
    """Create a mock logger."""
    logger = Mock()
    logger.info = Mock()
    logger.debug = Mock()
    logger.warning = Mock()
    logger.error = Mock()
    return logger


@pytest.fixture
def sample_user_form():
    """Create a sample user form."""
    return UserForm(
        young=LifePhase(
            memories=["Playing in the park", "First day of school"],
            key_events=["Birth", "Learning to walk"],
            emotions=["Joy", "Curiosity"]
        ),
        adolescent=LifePhase(
            memories=["High school graduation"],
            key_events=["Graduation"],
            emotions=["Excitement"]
        ),
        adult=LifePhase(
            memories=["Wedding day"],
            key_events=["Marriage"],
            emotions=["Love"]
        ),
        elderly=LifePhase(
            memories=["Retirement"],
            key_events=["Retirement party"],
            emotions=["Gratitude"]
        )
    )


@pytest.fixture
def sample_preferences():
    """Create sample book preferences."""
    return BookPreferences(
        title="Maria's Life Journey",
        date="2024-03-15",
        page_count=10,
        style="watercolor"
    )


@pytest.fixture
def sample_reference_images():
    """Create sample reference images."""
    return ReferenceImages(
        paths=["/photo1.jpg", "/photo2.jpg", "/photo3.jpg"]
    )


@pytest.fixture
def sample_normalized_profile():
    """Create a sample normalized profile."""
    return NormalizedProfile(
        subject_name="Maria",
        life_phases=[
            NormalizedLifePhase(
                phase_name="young",
                age_range="0-12 years",
                core_memories=["Playing in the park"],
                significant_events=["Birth"],
                emotional_themes=["Joy"]
            )
        ],
        overall_themes=["Family", "Growth"],
        personality_traits=["Kind", "Adventurous"],
        visual_motifs=["Gardens", "Sunlight"]
    )


@pytest.fixture
def sample_visual_fingerprint():
    """Create a sample visual fingerprint."""
    return VisualFingerprint(
        subject_id="maria-001"
    )


class TestNormalizerAgent:
    """Tests for NormalizerAgent."""
    
    @pytest.mark.asyncio
    async def test_normalizer_creates_profile(self, mock_gemini_client, mock_logger, sample_user_form, sample_preferences):
        """Test that normalizer creates a profile."""
        mock_gemini_client.generate_json.return_value = {
            "subject_name": "Maria",
            "life_phases": [],
            "overall_themes": [],
            "personality_traits": [],
            "visual_motifs": []
        }
        
        agent = NormalizerAgent(mock_gemini_client, mock_logger)
        result = await agent.run((sample_user_form, sample_preferences))
        
        assert isinstance(result, NormalizedProfile)
        mock_gemini_client.generate_json.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_normalizer_fallback_on_error(self, mock_gemini_client, mock_logger, sample_user_form, sample_preferences):
        """Test fallback when Gemini fails."""
        mock_gemini_client.generate_json.side_effect = Exception("API Error")
        
        agent = NormalizerAgent(mock_gemini_client, mock_logger)
        result = await agent.run((sample_user_form, sample_preferences))
        
        assert isinstance(result, NormalizedProfile)
        assert len(result.life_phases) > 0


class TestNarrativePlannerAgent:
    """Tests for NarrativePlannerAgent."""
    
    @pytest.mark.asyncio
    async def test_planner_creates_plan(self, mock_gemini_client, mock_logger, sample_normalized_profile, sample_preferences):
        """Test that planner creates a narrative plan."""
        mock_gemini_client.generate_json.return_value = {
            "book_title": "Test Book",
            "total_pages": 10,
            "cover": {
                "main_subject_pose": "portrait",
                "background_elements": [],
                "color_scheme": [],
                "mood": "warm"
            },
            "back_cover": {
                "design_type": "symbolic",
                "main_elements": [],
                "color_scheme": []
            },
            "pages": [],
            "narrative_arc": "Life journey",
            "visual_themes": []
        }
        
        agent = NarrativePlannerAgent(mock_gemini_client, mock_logger)
        result = await agent.run((sample_normalized_profile, sample_preferences))
        
        assert isinstance(result, NarrativePlan)
        assert result.book_title == "Test Book"


class TestVisualAnalyzerAgent:
    """Tests for VisualAnalyzerAgent."""
    
    @pytest.mark.asyncio
    async def test_analyzer_creates_fingerprint(self, mock_gemini_client, mock_logger, sample_reference_images, sample_preferences):
        """Test that analyzer creates a visual fingerprint."""
        mock_gemini_client.analyze_images.return_value = {
            "subject_id": "test-001"
        }
        
        agent = VisualAnalyzerAgent(mock_gemini_client, mock_logger)
        result = await agent.run((sample_reference_images, sample_preferences))
        
        assert isinstance(result, VisualFingerprint)


class TestCoverCreatorAgent:
    """Tests for CoverCreatorAgent."""
    
    @pytest.mark.asyncio
    async def test_cover_creator(self, mock_gemini_client, mock_logger, sample_visual_fingerprint, sample_preferences):
        """Test cover prompt creation."""
        cover_concept = CoverConcept(
            main_subject_pose="portrait",
            mood="warm"
        )
        
        mock_gemini_client.generate_json.return_value = {
            "page_number": 0,
            "prompt_type": "cover",
            "main_prompt": "Cover illustration"
        }
        
        agent = CoverCreatorAgent(mock_gemini_client, mock_logger)
        result = await agent.run((cover_concept, sample_visual_fingerprint, sample_preferences))
        
        assert isinstance(result, PromptItem)
        assert result.prompt_type == "cover"


class TestPromptReviewerAgent:
    """Tests for PromptReviewerAgent."""
    
    @pytest.mark.asyncio
    async def test_reviewer_improves_prompts(self, mock_gemini_client, mock_logger):
        """Test prompt review."""
        prompts = [
            PromptItem(page_number=0, prompt_type="cover", main_prompt="Test cover"),
            PromptItem(page_number=1, prompt_type="page", main_prompt="Test page")
        ]
        
        mock_gemini_client.revise_text.return_value = {
            "page_number": 0,
            "prompt_type": "cover",
            "main_prompt": "Improved test cover"
        }
        
        agent = PromptReviewerAgent(mock_gemini_client, mock_logger)
        result = await agent.run(prompts)
        
        assert len(result) == len(prompts)


class TestImageValidatorAgent:
    """Tests for ImageValidatorAgent."""
    
    @pytest.mark.asyncio
    async def test_validator_checks_image(self, mock_gemini_client, mock_logger, sample_visual_fingerprint):
        """Test image validation."""
        generation_result = GenerationResult(
            success=True,
            image_path="/test/image.png",
            metadata=GenerationMetadata(generation_id="test-001")
        )
        
        mock_gemini_client.analyze_images.return_value = {
            "page_number": 1,
            "image_path": "/test/image.png",
            "passed": True,
            "metrics": {},
            "issues_found": [],
            "suggestions": [],
            "requires_regeneration": False,
            "fingerprint_match_score": 0.9
        }
        
        agent = ImageValidatorAgent(mock_gemini_client, mock_logger)
        result = await agent.run((generation_result, sample_visual_fingerprint, 1))
        
        assert isinstance(result, ImageQCResult)


class TestAgentBase:
    """Tests for base agent functionality."""
    
    @pytest.mark.asyncio
    async def test_execute_validates_input(self, mock_gemini_client, mock_logger):
        """Test that execute validates input."""
        agent = NormalizerAgent(mock_gemini_client, mock_logger)
        
        with pytest.raises(ValueError):
            await agent.execute(None)
    
    def test_agent_has_name(self, mock_gemini_client, mock_logger):
        """Test agent has a name property."""
        agent = NormalizerAgent(mock_gemini_client, mock_logger)
        assert agent.name == "NormalizerAgent"
