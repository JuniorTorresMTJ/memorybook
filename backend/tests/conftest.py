"""
Pytest Configuration

Shared fixtures and configuration for tests.
"""

import pytest
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture(autouse=True)
def setup_test_environment():
    """Set up test environment variables."""
    os.environ.setdefault("GOOGLE_API_KEY", "test-key")
    os.environ.setdefault("NANOBANANA_API_KEY", "test-key")
    os.environ.setdefault("DEBUG", "true")
    os.environ.setdefault("OUTPUT_DIR", "./test_output")
    os.environ.setdefault("TEMP_DIR", "./test_temp")
    yield


@pytest.fixture
def temp_directory(tmp_path):
    """Provide a temporary directory for tests."""
    return str(tmp_path)
