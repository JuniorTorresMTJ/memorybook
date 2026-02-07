"""
Gemini Client

Client for Google Gemini API interactions using the new google-genai SDK.
"""

import os
import json
import base64
import uuid
import logging
from typing import Type, Optional, Any
from datetime import datetime
from pydantic import BaseModel

# Import for image generation results
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from models.generation import GenerationResult, GenerationMetadata

logger = logging.getLogger("memorybook")


class GeminiClient:
    """
    Client for interacting with Google Gemini API.
    
    Provides methods for text generation, JSON generation,
    image analysis, and image generation.
    """
    
    # Model types
    MODEL_FAST = os.getenv("GEMINI_MODEL_FAST", "gemini-2.0-flash")
    MODEL_CREATIVE = os.getenv("GEMINI_MODEL_CREATIVE", "gemini-2.0-pro-exp")
    # Gemini 2.5 Flash Image - stable image generation model (tested Feb 2026)
    MODEL_IMAGE = os.getenv("GEMINI_MODEL_IMAGE", "gemini-2.5-flash-image")
    
    def __init__(self, api_key: Optional[str] = None, model: str = None):
        """
        Initialize the Gemini client.
        
        Args:
            api_key: Google API key (defaults to GOOGLE_API_KEY env var)
            model: Model to use for generation (defaults to MODEL_FAST)
        """
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY")
        self.model = model or self.MODEL_FAST
        self._client = None
        self._stub_mode = not self.api_key
    
    def _ensure_client(self):
        """Ensure the client is initialized."""
        if self._stub_mode:
            return None
        
        if self._client is None:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except ImportError:
                self._stub_mode = True
                return None
        
        return self._client
    
    async def generate_text(self, system_prompt: str, user_prompt: str, model: str = None) -> str:
        """
        Generate text from a prompt.
        
        Args:
            system_prompt: System instructions
            user_prompt: User's prompt
            model: Optional model override
            
        Returns:
            Generated text response
        """
        client = self._ensure_client()
        model_name = model or self.model
        
        if client is None:
            return f"[STUB] Response to: {user_prompt[:100]}..."
        
        try:
            full_prompt = f"{system_prompt}\n\n{user_prompt}"
            response = client.models.generate_content(
                model=model_name,
                contents=[full_prompt]
            )
            return response.text
        except Exception as e:
            raise RuntimeError(f"Gemini text generation failed: {str(e)}")
    
    async def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
        images: Optional[list[str]] = None,
        schema: Optional[Type[BaseModel]] = None,
        model: str = None
    ) -> dict:
        """
        Generate JSON output from a prompt.
        
        Args:
            system_prompt: System instructions
            user_prompt: User's prompt
            images: Optional list of image paths
            schema: Optional Pydantic model for validation
            model: Optional model override
            
        Returns:
            Generated JSON as dictionary
        """
        client = self._ensure_client()
        model_name = model or self.model
        
        if client is None:
            return self._generate_stub_json(schema)
        
        try:
            # Build the prompt with JSON instruction
            json_instruction = ""
            if schema:
                json_instruction = f"\n\nRespond with valid JSON matching this schema:\n{schema.model_json_schema()}"
            
            full_prompt = f"{system_prompt}{json_instruction}\n\n{user_prompt}"
            
            # Prepare content parts
            content_parts = []
            
            # Add images if provided
            if images:
                for image_path in images:
                    image_data = self._load_image_for_genai(image_path)
                    if image_data:
                        content_parts.append(image_data)
            
            content_parts.append(full_prompt)
            
            response = client.models.generate_content(
                model=model_name,
                contents=content_parts
            )
            
            # Parse JSON from response
            response_text = response.text
            
            # Try to extract JSON from the response
            json_data = self._extract_json(response_text)
            
            # Validate against schema if provided
            if schema:
                validated = schema(**json_data)
                return validated.model_dump()
            
            return json_data
            
        except Exception as e:
            raise RuntimeError(f"Gemini JSON generation failed: {str(e)}")
    
    async def analyze_images(
        self,
        prompt: str,
        images: list[str],
        schema: Optional[Type[BaseModel]] = None
    ) -> dict:
        """
        Analyze images with a prompt.
        
        Args:
            prompt: Analysis prompt
            images: List of image paths
            schema: Optional Pydantic model for output
            
        Returns:
            Analysis results as dictionary
        """
        client = self._ensure_client()
        
        if client is None:
            return self._generate_stub_json(schema)
        
        try:
            # Build content with images
            content_parts = []
            
            for image_path in images:
                image_data = self._load_image_for_genai(image_path)
                if image_data:
                    content_parts.append(image_data)
            
            # Add the prompt
            json_instruction = ""
            if schema:
                json_instruction = f"\n\nRespond with valid JSON matching this schema:\n{schema.model_json_schema()}"
            
            content_parts.append(f"{prompt}{json_instruction}")
            
            response = client.models.generate_content(
                model=self.model,
                contents=content_parts
            )
            
            # Parse JSON from response
            json_data = self._extract_json(response.text)
            
            if schema:
                validated = schema(**json_data)
                return validated.model_dump()
            
            return json_data
            
        except Exception as e:
            raise RuntimeError(f"Gemini image analysis failed: {str(e)}")
    
    async def revise_text(
        self,
        prompt: str,
        schema: Optional[Type[BaseModel]] = None
    ) -> dict:
        """
        Revise or improve text based on a prompt.
        
        Args:
            prompt: Revision instructions
            schema: Optional Pydantic model for output
            
        Returns:
            Revised content as dictionary
        """
        system_prompt = """You are an expert editor and reviser.
Your task is to improve and refine content based on the given instructions.
Maintain the original intent while enhancing quality."""
        
        return await self.generate_json(
            system_prompt=system_prompt,
            user_prompt=prompt,
            schema=schema
        )
    
    def _load_image_for_genai(self, image_path: str) -> Optional[Any]:
        """Load an image for the GenAI API."""
        try:
            from google.genai import types
            
            # Check if it's a URL or file path
            if image_path.startswith(('http://', 'https://')):
                return None
            
            # Load from file
            with open(image_path, 'rb') as f:
                image_data = f.read()
            
            # Determine mime type
            if image_path.lower().endswith('.png'):
                mime_type = 'image/png'
            elif image_path.lower().endswith(('.jpg', '.jpeg')):
                mime_type = 'image/jpeg'
            elif image_path.lower().endswith('.gif'):
                mime_type = 'image/gif'
            elif image_path.lower().endswith('.webp'):
                mime_type = 'image/webp'
            else:
                mime_type = 'image/jpeg'
            
            return types.Part.from_bytes(data=image_data, mime_type=mime_type)
            
        except Exception:
            return None
    
    def _extract_json(self, text: str) -> dict:
        """Extract JSON from response text."""
        # Try direct parsing first
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass
        
        # Try to find JSON in markdown code blocks
        import re
        json_pattern = r'```(?:json)?\s*([\s\S]*?)\s*```'
        matches = re.findall(json_pattern, text)
        
        for match in matches:
            try:
                return json.loads(match)
            except json.JSONDecodeError:
                continue
        
        # Try to find JSON object in text
        brace_pattern = r'\{[\s\S]*\}'
        matches = re.findall(brace_pattern, text)
        
        for match in matches:
            try:
                return json.loads(match)
            except json.JSONDecodeError:
                continue
        
        # Return empty dict if nothing found
        return {}
    
    def _generate_stub_json(self, schema: Optional[Type[BaseModel]]) -> dict:
        """Generate stub JSON for testing."""
        if schema is None:
            return {"stub": True, "message": "Stub response"}
        
        # Generate minimal valid data for the schema
        try:
            # Get schema fields and create minimal data
            schema_dict = schema.model_json_schema()
            return self._generate_minimal_data(schema_dict)
        except Exception:
            return {"stub": True}
    
    def _generate_minimal_data(self, schema: dict) -> dict:
        """Generate minimal data matching a JSON schema."""
        result = {}
        
        properties = schema.get('properties', {})
        required = schema.get('required', [])
        
        for prop_name, prop_schema in properties.items():
            prop_type = prop_schema.get('type', 'string')
            
            if prop_type == 'string':
                result[prop_name] = prop_schema.get('default', f"stub_{prop_name}")
            elif prop_type == 'integer':
                result[prop_name] = prop_schema.get('default', 0)
            elif prop_type == 'number':
                result[prop_name] = prop_schema.get('default', 0.0)
            elif prop_type == 'boolean':
                result[prop_name] = prop_schema.get('default', False)
            elif prop_type == 'array':
                result[prop_name] = prop_schema.get('default', [])
            elif prop_type == 'object':
                result[prop_name] = prop_schema.get('default', {})
            else:
                result[prop_name] = None
        
        return result
    
    async def generate_image(
        self,
        prompt: str,
        output_path: Optional[str] = None,
        reference_images: Optional[list[str]] = None,
        render_params: Optional[dict] = None
    ) -> 'GenerationResult':
        """
        Generate an image using Gemini's image generation model.
        
        Args:
            prompt: Image generation prompt
            output_path: Optional path to save the generated image
            reference_images: Optional list of reference image paths
            render_params: Optional rendering parameters
            
        Returns:
            GenerationResult with the generated image
        """
        generation_id = str(uuid.uuid4())
        start_time = datetime.now()
        
        client = self._ensure_client()
        
        if client is None:
            return self._generate_stub_image_result(generation_id, prompt, output_path)
        
        try:
            from google.genai import types
            
            # Build content parts
            content_parts = []
            
            # Add reference images if provided
            if reference_images:
                for image_path in reference_images:
                    image_data = self._load_image_for_genai(image_path)
                    if image_data:
                        content_parts.append(image_data)
            
            # Add prompt with enforced no-text instruction
            enforced_prompt = prompt + ". CRITICAL: The image must contain absolutely NO text, letters, words, numbers, signs, or typography of any kind. Pure visual illustration only."
            content_parts.append(enforced_prompt)
            
            # Generate image using Gemini 3 Pro Image
            response = client.models.generate_content(
                model=self.MODEL_IMAGE,
                contents=content_parts,
                config=types.GenerateContentConfig(
                    response_modalities=["IMAGE", "TEXT"],
                )
            )
            
            # Extract image from response
            image_data = None
            text_snippet = None
            for part in response.candidates[0].content.parts:
                if part.inline_data is not None:
                    image_data = part.inline_data.data
                    mime_type = part.inline_data.mime_type
                    break
                if getattr(part, "text", None) and text_snippet is None:
                    text_snippet = str(part.text)[:200]

            if not image_data:
                message = "No image data returned by Gemini image model"
                if text_snippet:
                    message = f"{message}. Text: {text_snippet}"
                logger.warning(f"[generate_image] {message}")
                generation_time = int((datetime.now() - start_time).total_seconds() * 1000)
                return GenerationResult(
                    success=False,
                    error_message=message,
                    metadata=GenerationMetadata(
                        generation_id=generation_id,
                        model_used=self.MODEL_IMAGE,
                        generation_time_ms=generation_time,
                        parameters={"prompt": prompt}
                    )
                )
            
            if image_data and output_path:
                # Ensure directory exists
                os.makedirs(os.path.dirname(output_path), exist_ok=True)
                
                # Force .jpg extension
                output_path = os.path.splitext(output_path)[0] + '.jpg'
                
                # Normalize image_data to raw bytes
                if isinstance(image_data, str):
                    # base64 encoded string
                    image_bytes = base64.b64decode(image_data)
                elif isinstance(image_data, bytes):
                    image_bytes = image_data
                else:
                    # google.genai may return a special bytes-like object
                    image_bytes = bytes(image_data)
                
                logger.info(f"[generate_image] Raw data: type={type(image_data).__name__}, "
                            f"bytes_len={len(image_bytes)}, first4={image_bytes[:4].hex()}")
                
                # Compress with Pillow
                from PIL import Image as PILImage
                import io as _io
                
                img = None
                # Attempt 1: direct open
                try:
                    img = PILImage.open(_io.BytesIO(image_bytes))
                except Exception:
                    pass
                
                # Attempt 2: maybe it's base64 inside bytes
                if img is None:
                    try:
                        decoded = base64.b64decode(image_bytes)
                        img = PILImage.open(_io.BytesIO(decoded))
                        image_bytes = decoded
                        logger.info("[generate_image] Decoded double-base64 successfully")
                    except Exception:
                        pass
                
                if img is not None:
                    if img.mode != 'RGB':
                        img = img.convert('RGB')
                    MAX_W, MAX_H = 600, 900
                    w, h = img.size
                    if w > MAX_W or h > MAX_H:
                        ratio = min(MAX_W / w, MAX_H / h)
                        img = img.resize((int(w * ratio), int(h * ratio)), PILImage.Resampling.LANCZOS)
                    img.save(output_path, 'JPEG', quality=60, optimize=True, progressive=True)
                    logger.info(f"[generate_image] Saved compressed JPEG: {output_path} "
                                f"({os.path.getsize(output_path) / 1024:.0f}KB)")
                else:
                    # Last resort: save raw bytes and let the browser handle it
                    logger.warning(f"[generate_image] Pillow could not open image, saving raw "
                                   f"({len(image_bytes) / 1024:.0f}KB)")
                    with open(output_path, 'wb') as f:
                        f.write(image_bytes)
            
            generation_time = int((datetime.now() - start_time).total_seconds() * 1000)
            
            return GenerationResult(
                success=True,
                image_path=output_path,
                metadata=GenerationMetadata(
                    generation_id=generation_id,
                    model_used=self.MODEL_IMAGE,
                    generation_time_ms=generation_time,
                    parameters={"prompt": prompt}
                )
            )
            
        except Exception as e:
            logger.exception("[generate_image] Unexpected error during image generation")
            generation_time = int((datetime.now() - start_time).total_seconds() * 1000)
            return GenerationResult(
                success=False,
                error_message=str(e),
                metadata=GenerationMetadata(
                    generation_id=generation_id,
                    model_used=self.MODEL_IMAGE,
                    generation_time_ms=generation_time
                )
            )
    
    def _generate_stub_image_result(
        self,
        generation_id: str,
        prompt: str,
        output_path: Optional[str]
    ) -> 'GenerationResult':
        """Generate a stub result with a visible placeholder image."""
        if output_path:
            try:
                os.makedirs(os.path.dirname(output_path), exist_ok=True)
                
                # Try to generate a proper placeholder with Pillow
                try:
                    from PIL import Image as PILImage, ImageDraw, ImageFont
                    
                    width, height = 1024, 1024
                    # Soft gradient background
                    img = PILImage.new('RGB', (width, height), (230, 245, 245))
                    draw = ImageDraw.Draw(img)
                    
                    # Draw a subtle gradient-like pattern
                    for y in range(height):
                        r = int(230 - (y / height) * 30)
                        g = int(245 - (y / height) * 20)
                        b = int(245 - (y / height) * 15)
                        draw.line([(0, y), (width, y)], fill=(r, g, b))
                    
                    # Draw centered placeholder text
                    try:
                        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 36)
                        small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
                    except (OSError, IOError):
                        font = ImageFont.load_default()
                        small_font = font
                    
                    # Book icon placeholder
                    draw.rounded_rectangle(
                        [(width//2 - 80, height//2 - 120), (width//2 + 80, height//2 + 20)],
                        radius=15,
                        fill=(0, 229, 229),  # primary-teal
                        outline=(0, 200, 200),
                        width=2
                    )
                    
                    # Text below the icon
                    text = "Memory Book"
                    bbox = draw.textbbox((0, 0), text, font=font)
                    text_w = bbox[2] - bbox[0]
                    draw.text(
                        ((width - text_w) // 2, height // 2 + 50),
                        text,
                        fill=(80, 80, 80),
                        font=font
                    )
                    
                    sub_text = "Stub Mode - No API Key"
                    bbox2 = draw.textbbox((0, 0), sub_text, font=small_font)
                    sub_w = bbox2[2] - bbox2[0]
                    draw.text(
                        ((width - sub_w) // 2, height // 2 + 100),
                        sub_text,
                        fill=(150, 150, 150),
                        font=small_font
                    )
                    
                    img.save(output_path, 'PNG')
                    
                except ImportError:
                    # Pillow not available - create a minimal but valid PNG
                    # This creates a small but visible 64x64 teal square
                    import struct
                    import zlib
                    
                    w, h = 64, 64
                    # Raw pixel data: teal color (0, 229, 229)
                    raw_data = b''
                    for _ in range(h):
                        raw_data += b'\x00'  # filter byte
                        raw_data += b'\x00\xe5\xe5' * w  # RGB teal
                    
                    def png_chunk(chunk_type, data):
                        chunk = chunk_type + data
                        return struct.pack('>I', len(data)) + chunk + struct.pack('>I', zlib.crc32(chunk) & 0xffffffff)
                    
                    png = b'\x89PNG\r\n\x1a\n'
                    png += png_chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0))
                    png += png_chunk(b'IDAT', zlib.compress(raw_data))
                    png += png_chunk(b'IEND', b'')
                    
                    with open(output_path, 'wb') as f:
                        f.write(png)
                    
            except Exception:
                pass
        
        return GenerationResult(
            success=True,
            image_path=output_path or f"/tmp/stub_{generation_id}.png",
            metadata=GenerationMetadata(
                generation_id=generation_id,
                model_used="stub",
                generation_time_ms=100,
                parameters={"prompt": prompt, "stub": True}
            ),
            warnings=["Running in stub mode - placeholder image generated"]
        )
    
    async def close(self):
        """Close the client and cleanup resources."""
        self._client = None
