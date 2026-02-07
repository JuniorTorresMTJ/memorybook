"""
File Storage

Utilities for managing uploaded files and generated assets.
"""

import os
import shutil
import uuid
from typing import List, Optional, Tuple
from pathlib import Path

# Base storage directory
STORAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "storage")


def ensure_storage_dir():
    """Ensure the base storage directory exists."""
    os.makedirs(STORAGE_DIR, exist_ok=True)
    return STORAGE_DIR


def get_job_dir(job_id: str) -> str:
    """Get the storage directory for a specific job."""
    job_dir = os.path.join(STORAGE_DIR, job_id)
    os.makedirs(job_dir, exist_ok=True)
    return job_dir


def get_references_dir(job_id: str) -> str:
    """Get the references directory for a job."""
    refs_dir = os.path.join(get_job_dir(job_id), "references")
    os.makedirs(refs_dir, exist_ok=True)
    return refs_dir


def get_outputs_dir(job_id: str) -> str:
    """Get the outputs directory for a job."""
    outputs_dir = os.path.join(get_job_dir(job_id), "outputs")
    os.makedirs(outputs_dir, exist_ok=True)
    return outputs_dir


async def save_uploaded_file(
    job_id: str,
    file_content: bytes,
    original_filename: str,
    file_index: int
) -> str:
    """
    Save an uploaded reference image.
    
    Args:
        job_id: Job identifier
        file_content: File bytes
        original_filename: Original filename
        file_index: Index of the file (for ordering)
        
    Returns:
        Path to saved file
    """
    refs_dir = get_references_dir(job_id)
    
    # Get extension from original filename
    ext = os.path.splitext(original_filename)[1].lower()
    if ext not in ['.jpg', '.jpeg', '.png', '.webp']:
        ext = '.jpg'
    
    # Create filename with index
    filename = f"reference_{file_index:02d}{ext}"
    filepath = os.path.join(refs_dir, filename)
    
    # Write file
    with open(filepath, 'wb') as f:
        f.write(file_content)
    
    return filepath


async def save_uploaded_files(
    job_id: str,
    files: List[Tuple[bytes, str]]
) -> List[str]:
    """
    Save multiple uploaded files.
    
    Args:
        job_id: Job identifier
        files: List of (content, filename) tuples
        
    Returns:
        List of saved file paths
    """
    paths = []
    for i, (content, filename) in enumerate(files):
        path = await save_uploaded_file(job_id, content, filename, i)
        paths.append(path)
    return paths


def get_output_path(job_id: str, filename: str) -> str:
    """
    Get the full path for an output file.
    
    Args:
        job_id: Job identifier
        filename: Output filename
        
    Returns:
        Full path to output file
    """
    outputs_dir = get_outputs_dir(job_id)
    return os.path.join(outputs_dir, filename)


def get_asset_path(job_id: str, filename: str) -> Optional[str]:
    """
    Get the path to an asset file if it exists.
    
    Args:
        job_id: Job identifier
        filename: Asset filename
        
    Returns:
        Full path if file exists, None otherwise
    """
    # Check in outputs first
    outputs_path = os.path.join(get_outputs_dir(job_id), filename)
    if os.path.exists(outputs_path):
        return outputs_path
    
    # Check in references
    refs_path = os.path.join(get_references_dir(job_id), filename)
    if os.path.exists(refs_path):
        return refs_path
    
    return None


def list_job_assets(job_id: str) -> dict:
    """
    List all assets for a job.
    
    Args:
        job_id: Job identifier
        
    Returns:
        Dict with references and outputs lists
    """
    result = {
        "references": [],
        "outputs": []
    }
    
    refs_dir = get_references_dir(job_id)
    if os.path.exists(refs_dir):
        result["references"] = sorted(os.listdir(refs_dir))
    
    outputs_dir = get_outputs_dir(job_id)
    if os.path.exists(outputs_dir):
        result["outputs"] = sorted(os.listdir(outputs_dir))
    
    return result


def cleanup_job_storage(job_id: str) -> bool:
    """
    Remove all storage for a job.
    
    Args:
        job_id: Job identifier
        
    Returns:
        True if cleanup was successful
    """
    job_dir = os.path.join(STORAGE_DIR, job_id)
    if os.path.exists(job_dir):
        shutil.rmtree(job_dir)
        return True
    return False


def get_mime_type(filename: str) -> str:
    """Get MIME type for a file based on extension."""
    ext = os.path.splitext(filename)[1].lower()
    mime_types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.json': 'application/json',
    }
    return mime_types.get(ext, 'application/octet-stream')


def upload_output_image(job_id: str, filename: str, local_path: str) -> Optional[str]:
    """
    Upload a generated image to Firebase Storage and return a public URL.
    Uses a public folder to allow unauthenticated access.
    """
    if not local_path or not os.path.exists(local_path):
        return None

    try:
        from utils.firebase_admin import get_storage_bucket

        bucket = get_storage_bucket()
        blob_path = f"public/generated/{job_id}/{filename}"
        blob = bucket.blob(blob_path)
        blob.upload_from_filename(local_path, content_type=get_mime_type(filename))
        blob.make_public()
        return blob.public_url
    except Exception:
        return None
