"""
Configuration Utilities

Application configuration management.
"""

import os
from typing import Optional
from dataclasses import dataclass, field

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()


# Model configuration for different task types
MODEL_CONFIG = {
    "fast": os.getenv("GEMINI_MODEL_FAST", "gemini-2.0-flash"),
    "creative": os.getenv("GEMINI_MODEL_CREATIVE", "gemini-2.0-pro-exp"),
    # Gemini 2.5 Flash Image - stable image generation model
    "image_gen": os.getenv("GEMINI_MODEL_IMAGE", "gemini-2.5-flash-image"),
}


@dataclass
class Config:
    """Application configuration."""
    
    # API Keys
    google_api_key: str = field(default_factory=lambda: os.getenv("GOOGLE_API_KEY", ""))
    nanobanana_api_key: str = field(default_factory=lambda: os.getenv("NANOBANANA_API_KEY", ""))
    
    # Model settings
    gemini_model: str = field(default_factory=lambda: os.getenv("GEMINI_MODEL_FAST", "gemini-2.0-flash"))
    gemini_model_fast: str = field(default_factory=lambda: os.getenv("GEMINI_MODEL_FAST", "gemini-2.0-flash"))
    gemini_model_creative: str = field(default_factory=lambda: os.getenv("GEMINI_MODEL_CREATIVE", "gemini-2.0-pro-exp"))
    gemini_model_image: str = field(default_factory=lambda: os.getenv("GEMINI_MODEL_IMAGE", "gemini-2.5-flash-image"))
    
    # Generation settings
    default_image_width: int = 1024
    default_image_height: int = 1024
    default_guidance_scale: float = 7.5
    default_inference_steps: int = 50
    
    # Pipeline settings
    max_retries: int = 2
    validation_threshold: float = 7.0
    
    # Output settings
    output_directory: str = field(default_factory=lambda: os.getenv("OUTPUT_DIR", "./output"))
    temp_directory: str = field(default_factory=lambda: os.getenv("TEMP_DIR", "./temp"))
    
    # Logging
    log_level: str = field(default_factory=lambda: os.getenv("LOG_LEVEL", "INFO"))
    log_file: Optional[str] = field(default_factory=lambda: os.getenv("LOG_FILE"))
    
    # Server settings
    host: str = field(default_factory=lambda: os.getenv("HOST", "0.0.0.0"))
    port: int = field(default_factory=lambda: int(os.getenv("PORT", "8000")))
    debug: bool = field(default_factory=lambda: os.getenv("DEBUG", "false").lower() == "true")
    
    def __post_init__(self):
        """Validate configuration after initialization."""
        # Create directories if they don't exist
        os.makedirs(self.output_directory, exist_ok=True)
        os.makedirs(self.temp_directory, exist_ok=True)
    
    @property
    def is_stub_mode(self) -> bool:
        """Check if running in stub mode (no API keys)."""
        return not self.google_api_key
    
    def validate(self) -> list[str]:
        """
        Validate the configuration.
        
        Returns:
            List of validation errors (empty if valid)
        """
        errors = []
        
        if not self.google_api_key:
            errors.append("GOOGLE_API_KEY is not set")
        
        if self.max_retries < 0:
            errors.append("max_retries must be non-negative")
        
        if not 0 <= self.validation_threshold <= 10:
            errors.append("validation_threshold must be between 0 and 10")
        
        return errors


# Global configuration instance
_config: Optional[Config] = None


def get_config() -> Config:
    """
    Get the global configuration instance.
    
    Returns:
        Config instance
    """
    global _config
    
    if _config is None:
        _config = Config()
    
    return _config


def set_config(config: Config) -> None:
    """
    Set the global configuration instance.
    
    Args:
        config: Config instance to use
    """
    global _config
    _config = config


def load_config_from_env() -> Config:
    """
    Load configuration from environment variables.
    
    Returns:
        Config instance
    """
    config = Config()
    set_config(config)
    return config
