"""
Orchestrator Agent

Coordinates the entire book generation pipeline.
"""

from typing import Dict, Any, Optional
from dataclasses import dataclass, field
from enum import Enum
from .base import AgentBase

import sys
sys.path.append('..')

from models.user_input import UserForm, BookPreferences, ReferenceImages
from models.output import FinalBookPackage
from prompts.master_prompts import ORCHESTRATOR_PROMPT, build_prompt
from prompts.language_utils import resolve_language


class PipelineState(Enum):
    """States of the pipeline execution."""
    INITIALIZED = "initialized"
    NORMALIZING = "normalizing"
    PLANNING = "planning"
    ANALYZING_VISUALS = "analyzing_visuals"
    CREATING_PROMPTS = "creating_prompts"
    REVIEWING_PROMPTS = "reviewing_prompts"
    GENERATING_IMAGES = "generating_images"
    REVIEWING_ILLUSTRATIONS = "reviewing_illustrations"
    REVIEWING_DESIGN = "reviewing_design"
    VALIDATING = "validating"
    FIXING = "fixing"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class PipelineContext:
    """Context for pipeline execution."""
    user_form: UserForm
    preferences: BookPreferences
    reference_images: ReferenceImages
    user_language: str = "en-US"
    state: PipelineState = PipelineState.INITIALIZED
    error: Optional[str] = None
    retry_count: int = 0
    max_retries: int = 2
    intermediate_results: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        # Normalize language
        self.user_language = resolve_language(self.user_language)


class OrchestratorAgent(AgentBase[PipelineContext, FinalBookPackage]):
    """
    Agent responsible for orchestrating the entire pipeline.
    
    Coordinates all other agents, manages state, handles errors,
    and ensures the complete book is generated successfully.
    
    NOTE: This agent does NOT generate creative content.
    It only manages the execution flow.
    """

    async def run(self, input_data: PipelineContext) -> FinalBookPackage:
        """
        Execute the complete pipeline.
        
        Args:
            input_data: PipelineContext with all input data
            
        Returns:
            FinalBookPackage with the complete book
        """
        context = input_data
        user_language = context.user_language
        
        self._log_info(f"Starting pipeline orchestration (language: {user_language})")
        
        # Build system prompt (for logging/tracking purposes only)
        # The orchestrator doesn't use Gemini for content generation
        system_prompt = build_prompt(ORCHESTRATOR_PROMPT, user_language)
        
        try:
            # Import pipeline runner to avoid circular imports
            from pipeline.runner import PipelineRunner
            
            # Create and run the pipeline
            runner = PipelineRunner(self.gemini, self.logger)
            result = await runner.run(
                user_form=context.user_form,
                preferences=context.preferences,
                reference_images=context.reference_images,
                user_language=user_language,
                max_retries=context.max_retries
            )
            
            context.state = PipelineState.COMPLETED
            self._log_info("Pipeline completed successfully")
            
            return result
            
        except Exception as e:
            context.state = PipelineState.FAILED
            context.error = str(e)
            self._log_error(f"Pipeline failed: {str(e)}")
            raise
    
    async def validate_input(self, input_data: PipelineContext) -> bool:
        """Validate pipeline input."""
        context = input_data
        
        # Reference images are optional now - log if not provided
        if not context.reference_images.has_images():
            self._log_info("No reference images provided - will generate based on user story only")
        
        # Check preferences
        if not context.preferences.title:
            self._log_error("Book title is required")
            return False
        
        return True
    
    def get_state_description(self, state: PipelineState, user_language: str) -> str:
        """Get a human-readable description of a state in the user's language."""
        descriptions = {
            "pt-BR": {
                PipelineState.INITIALIZED: "Pipeline inicializado",
                PipelineState.NORMALIZING: "Normalizando dados do usuário",
                PipelineState.PLANNING: "Criando plano narrativo",
                PipelineState.ANALYZING_VISUALS: "Analisando imagens de referência",
                PipelineState.CREATING_PROMPTS: "Criando prompts de imagem",
                PipelineState.REVIEWING_PROMPTS: "Revisando e melhorando prompts",
                PipelineState.GENERATING_IMAGES: "Gerando ilustrações",
                PipelineState.REVIEWING_ILLUSTRATIONS: "Revisando qualidade das ilustrações",
                PipelineState.REVIEWING_DESIGN: "Revisando design geral",
                PipelineState.VALIDATING: "Validando imagens",
                PipelineState.FIXING: "Corrigindo imagens com problemas",
                PipelineState.COMPLETED: "Pipeline concluído",
                PipelineState.FAILED: "Pipeline falhou"
            },
            "en-US": {
                PipelineState.INITIALIZED: "Pipeline initialized",
                PipelineState.NORMALIZING: "Normalizing user input",
                PipelineState.PLANNING: "Creating narrative plan",
                PipelineState.ANALYZING_VISUALS: "Analyzing reference images",
                PipelineState.CREATING_PROMPTS: "Creating image prompts",
                PipelineState.REVIEWING_PROMPTS: "Reviewing and improving prompts",
                PipelineState.GENERATING_IMAGES: "Generating illustrations",
                PipelineState.REVIEWING_ILLUSTRATIONS: "Reviewing illustration quality",
                PipelineState.REVIEWING_DESIGN: "Reviewing overall design",
                PipelineState.VALIDATING: "Validating images",
                PipelineState.FIXING: "Fixing failed images",
                PipelineState.COMPLETED: "Pipeline completed",
                PipelineState.FAILED: "Pipeline failed"
            },
            "es-ES": {
                PipelineState.INITIALIZED: "Pipeline inicializado",
                PipelineState.NORMALIZING: "Normalizando datos del usuario",
                PipelineState.PLANNING: "Creando plan narrativo",
                PipelineState.ANALYZING_VISUALS: "Analizando imágenes de referencia",
                PipelineState.CREATING_PROMPTS: "Creando prompts de imagen",
                PipelineState.REVIEWING_PROMPTS: "Revisando y mejorando prompts",
                PipelineState.GENERATING_IMAGES: "Generando ilustraciones",
                PipelineState.REVIEWING_ILLUSTRATIONS: "Revisando calidad de ilustraciones",
                PipelineState.REVIEWING_DESIGN: "Revisando diseño general",
                PipelineState.VALIDATING: "Validando imágenes",
                PipelineState.FIXING: "Corrigiendo imágenes con problemas",
                PipelineState.COMPLETED: "Pipeline completado",
                PipelineState.FAILED: "Pipeline falló"
            }
        }
        
        lang_descriptions = descriptions.get(user_language, descriptions["en-US"])
        return lang_descriptions.get(state, "Unknown state")
