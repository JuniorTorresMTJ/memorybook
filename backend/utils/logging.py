"""
Logging Utilities

Structured logging setup for the backend.
"""

import logging
import sys
from typing import Optional
from datetime import datetime


class ColoredFormatter(logging.Formatter):
    """Colored formatter for console output."""
    
    COLORS = {
        'DEBUG': '\033[36m',     # Cyan
        'INFO': '\033[32m',      # Green
        'WARNING': '\033[33m',   # Yellow
        'ERROR': '\033[31m',     # Red
        'CRITICAL': '\033[35m',  # Magenta
        'RESET': '\033[0m'       # Reset
    }
    
    def format(self, record):
        color = self.COLORS.get(record.levelname, self.COLORS['RESET'])
        reset = self.COLORS['RESET']
        
        # Add color to level name
        record.levelname = f"{color}{record.levelname}{reset}"
        
        return super().format(record)


def setup_logger(
    name: str = "memorybook",
    level: int = logging.INFO,
    log_file: Optional[str] = None,
    use_colors: bool = True
) -> logging.Logger:
    """
    Set up a logger with console and optional file output.
    
    Args:
        name: Logger name
        level: Logging level
        log_file: Optional file path for logging
        use_colors: Whether to use colored output
        
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Clear existing handlers
    logger.handlers.clear()
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    
    if use_colors:
        console_format = ColoredFormatter(
            '%(asctime)s | %(levelname)s | %(name)s | %(message)s',
            datefmt='%H:%M:%S'
        )
    else:
        console_format = logging.Formatter(
            '%(asctime)s | %(levelname)s | %(name)s | %(message)s',
            datefmt='%H:%M:%S'
        )
    
    console_handler.setFormatter(console_format)
    logger.addHandler(console_handler)
    
    # File handler (if specified)
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(level)
        file_format = logging.Formatter(
            '%(asctime)s | %(levelname)s | %(name)s | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        file_handler.setFormatter(file_format)
        logger.addHandler(file_handler)
    
    return logger


def get_logger(name: str = "memorybook") -> logging.Logger:
    """
    Get an existing logger or create a new one.
    
    Args:
        name: Logger name
        
    Returns:
        Logger instance
    """
    logger = logging.getLogger(name)
    
    # If logger has no handlers, set it up
    if not logger.handlers:
        return setup_logger(name)
    
    return logger


class PipelineLogger:
    """Logger specifically for pipeline execution."""
    
    def __init__(self, job_id: str, base_logger: Optional[logging.Logger] = None):
        """
        Initialize pipeline logger.
        
        Args:
            job_id: Unique job identifier
            base_logger: Base logger to use
        """
        self.job_id = job_id
        self.logger = base_logger or get_logger("memorybook.pipeline")
        self.start_time = datetime.now()
        self.step_times = {}
    
    def start_step(self, step_name: str):
        """Log the start of a pipeline step."""
        self.step_times[step_name] = datetime.now()
        self.logger.info(f"[{self.job_id}] Starting: {step_name}")
    
    def end_step(self, step_name: str, success: bool = True):
        """Log the end of a pipeline step."""
        start = self.step_times.get(step_name)
        duration = ""
        
        if start:
            elapsed = (datetime.now() - start).total_seconds()
            duration = f" ({elapsed:.2f}s)"
        
        status = "completed" if success else "failed"
        self.logger.info(f"[{self.job_id}] {step_name} {status}{duration}")
    
    def log_progress(self, message: str):
        """Log progress message."""
        self.logger.info(f"[{self.job_id}] {message}")
    
    def log_warning(self, message: str):
        """Log warning message."""
        self.logger.warning(f"[{self.job_id}] {message}")
    
    def log_error(self, message: str):
        """Log error message."""
        self.logger.error(f"[{self.job_id}] {message}")
    
    def get_total_time(self) -> float:
        """Get total elapsed time in seconds."""
        return (datetime.now() - self.start_time).total_seconds()
