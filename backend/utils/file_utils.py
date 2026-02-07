"""
File Utilities

File handling utilities for the backend.
"""

import os
import shutil
import uuid
from typing import Optional
from pathlib import Path


def ensure_directory(path: str) -> str:
    """
    Ensure a directory exists, creating it if necessary.
    
    Args:
        path: Directory path
        
    Returns:
        The directory path
    """
    os.makedirs(path, exist_ok=True)
    return path


def save_image(
    image_data: bytes,
    output_dir: str,
    filename: Optional[str] = None,
    extension: str = "png"
) -> str:
    """
    Save image data to a file.
    
    Args:
        image_data: Raw image bytes
        output_dir: Directory to save to
        filename: Optional filename (generated if not provided)
        extension: File extension
        
    Returns:
        Path to the saved file
    """
    ensure_directory(output_dir)
    
    if filename is None:
        filename = f"{uuid.uuid4()}.{extension}"
    elif not filename.endswith(f".{extension}"):
        filename = f"{filename}.{extension}"
    
    filepath = os.path.join(output_dir, filename)
    
    with open(filepath, 'wb') as f:
        f.write(image_data)
    
    return filepath


def load_image(path: str) -> Optional[bytes]:
    """
    Load image data from a file.
    
    Args:
        path: Path to the image file
        
    Returns:
        Image bytes or None if file doesn't exist
    """
    if not os.path.exists(path):
        return None
    
    with open(path, 'rb') as f:
        return f.read()


def copy_file(source: str, destination: str) -> str:
    """
    Copy a file to a new location.
    
    Args:
        source: Source file path
        destination: Destination path
        
    Returns:
        Destination path
    """
    ensure_directory(os.path.dirname(destination))
    shutil.copy2(source, destination)
    return destination


def move_file(source: str, destination: str) -> str:
    """
    Move a file to a new location.
    
    Args:
        source: Source file path
        destination: Destination path
        
    Returns:
        Destination path
    """
    ensure_directory(os.path.dirname(destination))
    shutil.move(source, destination)
    return destination


def delete_file(path: str) -> bool:
    """
    Delete a file if it exists.
    
    Args:
        path: File path
        
    Returns:
        True if file was deleted, False if it didn't exist
    """
    if os.path.exists(path):
        os.remove(path)
        return True
    return False


def get_file_size(path: str) -> int:
    """
    Get the size of a file in bytes.
    
    Args:
        path: File path
        
    Returns:
        File size in bytes, or 0 if file doesn't exist
    """
    if os.path.exists(path):
        return os.path.getsize(path)
    return 0


def list_files(directory: str, extension: Optional[str] = None) -> list[str]:
    """
    List files in a directory.
    
    Args:
        directory: Directory path
        extension: Optional extension filter
        
    Returns:
        List of file paths
    """
    if not os.path.exists(directory):
        return []
    
    files = []
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        if os.path.isfile(filepath):
            if extension is None or filename.endswith(f".{extension}"):
                files.append(filepath)
    
    return sorted(files)


def create_temp_directory(base_dir: str = "./temp") -> str:
    """
    Create a temporary directory with a unique name.
    
    Args:
        base_dir: Base directory for temp folders
        
    Returns:
        Path to the created directory
    """
    temp_dir = os.path.join(base_dir, str(uuid.uuid4()))
    ensure_directory(temp_dir)
    return temp_dir


def cleanup_directory(path: str) -> bool:
    """
    Remove a directory and all its contents.
    
    Args:
        path: Directory path
        
    Returns:
        True if directory was removed, False otherwise
    """
    if os.path.exists(path):
        shutil.rmtree(path)
        return True
    return False


def get_image_dimensions(path: str) -> Optional[tuple[int, int]]:
    """
    Get the dimensions of an image file.
    
    Args:
        path: Path to the image
        
    Returns:
        Tuple of (width, height) or None if unable to read
    """
    try:
        from PIL import Image
        with Image.open(path) as img:
            return img.size
    except Exception:
        return None


def create_thumbnail(
    source_path: str,
    output_path: str,
    max_size: tuple[int, int] = (256, 256)
) -> Optional[str]:
    """
    Create a thumbnail of an image.
    
    Args:
        source_path: Path to source image
        output_path: Path for thumbnail
        max_size: Maximum dimensions
        
    Returns:
        Path to thumbnail or None if failed
    """
    try:
        from PIL import Image
        
        ensure_directory(os.path.dirname(output_path))
        
        with Image.open(source_path) as img:
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            img.save(output_path)
        
        return output_path
    except Exception:
        return None
