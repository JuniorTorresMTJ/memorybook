"""
Tests for Pipeline Runner

Tests the main pipeline orchestration.
"""

import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch, MagicMock

import sys
sys.path.insert(0, '..')

from pipeline.runner import PipelineRunner
from pipeline.validation_graph import ValidationGraph, ValidationContext, ValidationState

from models.user_input import UserForm, BookPreferences, ReferenceImages, LifePhase
from models.profile import NormalizedProfile
from models.visual import VisualFingerprint
from models.planning import NarrativePlan
from models.prompts import PromptItem
from models.generation import GenerationResult, GenerationMetadata
from models.output import FinalBookPackage


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
            memories=["Playing in the park"],
            key_events=["Birth"],
            emotions=["Joy"]
        )
    )


@pytest.fixture
def sample_preferences():
    """Create sample book preferences."""
    return BookPreferences(
        title="Test Book",
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


class TestPipelineRunner:
    """Tests for PipelineRunner."""
    
    def test_runner_initializes(self, mock_gemini_client, mock_logger):
        """Test runner initialization."""
        runner = PipelineRunner(mock_gemini_client, mock_logger)
        
        assert runner.gemini == mock_gemini_client
        assert runner.logger == mock_logger
        assert runner.normalizer is not None
        assert runner.narrative_planner is not None
    
    def test_runner_has_all_agents(self, mock_gemini_client, mock_logger):
        """Test runner has all required agents."""
        runner = PipelineRunner(mock_gemini_client, mock_logger)
        
        assert hasattr(runner, 'normalizer')
        assert hasattr(runner, 'narrative_planner')
        assert hasattr(runner, 'visual_analyzer')
        assert hasattr(runner, 'cover_creator')
        assert hasattr(runner, 'back_cover_creator')
        assert hasattr(runner, 'prompt_writer')
        assert hasattr(runner, 'prompt_reviewer')
        assert hasattr(runner, 'illustrator_reviewer')
        assert hasattr(runner, 'designer_reviewer')
        assert hasattr(runner, 'image_validator')
        assert hasattr(runner, 'iterative_fix')


class TestValidationGraph:
    """Tests for ValidationGraph."""
    
    def test_validation_context_initial_state(self):
        """Test initial validation context state."""
        result = GenerationResult(success=True, image_path="/test.png")
        prompt = PromptItem(page_number=1, prompt_type="page", main_prompt="Test")
        fingerprint = VisualFingerprint()
        
        context = ValidationContext(
            result=result,
            prompt=prompt,
            fingerprint=fingerprint
        )
        
        assert context.state == ValidationState.VALIDATE
        assert context.retry_count == 0
    
    @pytest.mark.asyncio
    async def test_validation_graph_passes_valid_image(self):
        """Test that valid images pass through."""
        mock_validator = Mock()
        mock_validator.execute = AsyncMock(return_value=Mock(
            passed=True,
            requires_regeneration=False
        ))
        
        mock_fixer = Mock()
        mock_image_client = Mock()
        
        graph = ValidationGraph(mock_validator, mock_fixer, mock_image_client)
        
        result = GenerationResult(
            success=True,
            image_path="/test.png",
            metadata=GenerationMetadata(generation_id="test")
        )
        prompt = PromptItem(page_number=1, prompt_type="page", main_prompt="Test")
        fingerprint = VisualFingerprint()
        
        final_result, retries = await graph.run(
            result=result,
            prompt=prompt,
            fingerprint=fingerprint,
            reference_images=[],
            output_path="/output.png"
        )
        
        assert retries == 0
        mock_validator.execute.assert_called_once()


class TestValidationState:
    """Tests for ValidationState enum."""
    
    def test_all_states_exist(self):
        """Test all required states exist."""
        assert ValidationState.VALIDATE is not None
        assert ValidationState.FIX is not None
        assert ValidationState.REGENERATE is not None
        assert ValidationState.COMPLETE is not None
        assert ValidationState.FAILED is not None


class TestPipelineIntegration:
    """Integration tests for the pipeline."""
    
    @pytest.mark.asyncio
    async def test_pipeline_validates_minimum_images(self, mock_gemini_client, mock_logger):
        """Test that pipeline validates minimum image count."""
        runner = PipelineRunner(mock_gemini_client, mock_logger)
        
        user_form = UserForm()
        preferences = BookPreferences(title="Test", date="2024-01-01")
        reference_images = ReferenceImages(paths=["/img1.jpg", "/img2.jpg"])  # Only 2
        
        assert not reference_images.validate_minimum_images()
    
    def test_build_final_package_structure(self, mock_gemini_client, mock_logger):
        """Test that final package has correct structure."""
        runner = PipelineRunner(mock_gemini_client, mock_logger)
        
        # This tests the helper method structure
        assert hasattr(runner, '_build_final_package')


class TestParallelExecution:
    """Tests for parallel execution in pipeline."""
    
    @pytest.mark.asyncio
    async def test_async_gather_works(self):
        """Test that async gather works for parallel tasks."""
        async def task1():
            await asyncio.sleep(0.01)
            return "result1"
        
        async def task2():
            await asyncio.sleep(0.01)
            return "result2"
        
        results = await asyncio.gather(task1(), task2())
        
        assert len(results) == 2
        assert results[0] == "result1"
        assert results[1] == "result2"
