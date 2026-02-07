"""
Base Agent Interface

Abstract base class for all agents in the pipeline.
"""

from abc import ABC, abstractmethod
from typing import Any, TypeVar, Generic
from logging import Logger

import sys
sys.path.append('..')

from clients.gemini_client import GeminiClient

InputT = TypeVar('InputT')
OutputT = TypeVar('OutputT')


class AgentBase(ABC, Generic[InputT, OutputT]):
    """
    Abstract base class for all agents.
    
    Each agent follows a consistent interface:
    - Receives typed input
    - Processes using Gemini or other services
    - Returns typed output
    """
    
    # Default model - override in subclasses
    # Use GeminiClient.MODEL_FAST or GeminiClient.MODEL_CREATIVE
    MODEL: str = None  # Will use client's default if None
    
    def __init__(self, gemini_client: GeminiClient, logger: Logger):
        """
        Initialize the agent.
        
        Args:
            gemini_client: Client for Gemini API calls
            logger: Logger instance for this agent
        """
        self.gemini = gemini_client
        self.logger = logger
        self._name = self.__class__.__name__
        self._model = self.MODEL  # Can be overridden per instance
    
    @property
    def name(self) -> str:
        """Get the agent name."""
        return self._name
    
    @abstractmethod
    async def run(self, input_data: InputT) -> OutputT:
        """
        Execute the agent's main task.
        
        Args:
            input_data: Typed input for the agent
            
        Returns:
            Typed output from the agent
        """
        pass
    
    async def validate_input(self, input_data: InputT) -> bool:
        """
        Validate input before processing.
        
        Override in subclasses for custom validation.
        
        Args:
            input_data: Input to validate
            
        Returns:
            True if valid, False otherwise
        """
        return input_data is not None
    
    async def pre_process(self, input_data: InputT) -> InputT:
        """
        Pre-process input before main execution.
        
        Override in subclasses for custom pre-processing.
        
        Args:
            input_data: Input to pre-process
            
        Returns:
            Pre-processed input
        """
        return input_data
    
    async def post_process(self, output_data: OutputT) -> OutputT:
        """
        Post-process output after main execution.
        
        Override in subclasses for custom post-processing.
        
        Args:
            output_data: Output to post-process
            
        Returns:
            Post-processed output
        """
        return output_data
    
    async def execute(self, input_data: InputT) -> OutputT:
        """
        Full execution pipeline with validation and processing.
        
        Args:
            input_data: Input for the agent
            
        Returns:
            Processed output
            
        Raises:
            ValueError: If input validation fails
        """
        self.logger.info(f"[{self.name}] Starting execution")
        
        # Validate input
        if not await self.validate_input(input_data):
            self.logger.error(f"[{self.name}] Input validation failed")
            raise ValueError(f"Invalid input for {self.name}")
        
        # Pre-process
        processed_input = await self.pre_process(input_data)
        
        # Main execution
        try:
            result = await self.run(processed_input)
        except Exception as e:
            self.logger.error(f"[{self.name}] Execution failed: {str(e)}")
            raise
        
        # Post-process
        final_result = await self.post_process(result)
        
        self.logger.info(f"[{self.name}] Execution completed successfully")
        return final_result
    
    def _log_debug(self, message: str) -> None:
        """Log a debug message."""
        self.logger.debug(f"[{self.name}] {message}")
    
    def _log_info(self, message: str) -> None:
        """Log an info message."""
        self.logger.info(f"[{self.name}] {message}")
    
    def _log_warning(self, message: str) -> None:
        """Log a warning message."""
        self.logger.warning(f"[{self.name}] {message}")
    
    def _log_error(self, message: str) -> None:
        """Log an error message."""
        self.logger.error(f"[{self.name}] {message}")
