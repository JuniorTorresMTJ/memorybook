"""
NanoBanana Pro Client

Client for NanoBanana Pro image generation API.
"""

import os
import uuid
import aiohttp
from typing import Optional, Dict, Any
from datetime import datetime

import sys
sys.path.append('..')

from models.generation import GenerationResult, GenerationMetadata


class NanoBananaProClient:
    """
    Client for interacting with NanoBanana Pro API.
    
    Provides methods for image generation and editing
    with reference image support.
    """
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: str = "https://api.nanobanana.pro/v1"
    ):
        """
        Initialize the NanoBanana Pro client.
        
        Args:
            api_key: API key (defaults to NANOBANANA_API_KEY env var)
            base_url: Base URL for the API
        """
        self.api_key = api_key or os.getenv("NANOBANANA_API_KEY")
        self.base_url = base_url
        self._session: Optional[aiohttp.ClientSession] = None
        
        # Stub mode if no API key
        self._stub_mode = not self.api_key
    
    async def _ensure_session(self):
        """Ensure the HTTP session is initialized."""
        if self._session is None:
            self._session = aiohttp.ClientSession(
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
            )
    
    async def close(self):
        """Close the HTTP session."""
        if self._session:
            await self._session.close()
            self._session = None
    
    async def generate_image(
        self,
        prompt: str,
        reference_images: Optional[list[str]] = None,
        render_params: Optional[Dict[str, Any]] = None,
        output_path: Optional[str] = None
    ) -> GenerationResult:
        """
        Generate an image from a prompt.
        
        Args:
            prompt: Generation prompt
            reference_images: Optional list of reference image paths
            render_params: Optional rendering parameters
            output_path: Optional path to save the generated image
            
        Returns:
            GenerationResult with the generated image
        """
        generation_id = str(uuid.uuid4())
        start_time = datetime.now()
        
        if self._stub_mode:
            return self._generate_stub_result(generation_id, prompt, output_path)
        
        await self._ensure_session()
        
        try:
            # Prepare request payload
            payload = {
                "prompt": prompt,
                "width": render_params.get("width", 1024) if render_params else 1024,
                "height": render_params.get("height", 1024) if render_params else 1024,
                "guidance_scale": render_params.get("guidance_scale", 7.5) if render_params else 7.5,
                "num_inference_steps": render_params.get("num_inference_steps", 50) if render_params else 50,
            }
            
            if render_params and render_params.get("seed"):
                payload["seed"] = render_params["seed"]
            
            # Add reference images if provided
            if reference_images:
                payload["reference_images"] = await self._encode_images(reference_images)
                payload["reference_weight"] = render_params.get("reference_weight", 0.8) if render_params else 0.8
            
            # Make API request
            async with self._session.post(
                f"{self.base_url}/generate",
                json=payload
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    return GenerationResult(
                        success=False,
                        error_message=f"API error {response.status}: {error_text}",
                        metadata=GenerationMetadata(
                            generation_id=generation_id,
                            generation_time_ms=int((datetime.now() - start_time).total_seconds() * 1000)
                        )
                    )
                
                result_data = await response.json()
                
                # Save image if output path provided
                image_path = output_path
                if output_path and result_data.get("image_url"):
                    image_path = await self._download_image(
                        result_data["image_url"],
                        output_path
                    )
                
                return GenerationResult(
                    success=True,
                    image_path=image_path,
                    image_url=result_data.get("image_url"),
                    metadata=GenerationMetadata(
                        generation_id=generation_id,
                        model_used=result_data.get("model", "nanobanana-pro"),
                        generation_time_ms=int((datetime.now() - start_time).total_seconds() * 1000),
                        seed_used=result_data.get("seed"),
                        parameters=payload
                    )
                )
                
        except Exception as e:
            return GenerationResult(
                success=False,
                error_message=str(e),
                metadata=GenerationMetadata(
                    generation_id=generation_id,
                    generation_time_ms=int((datetime.now() - start_time).total_seconds() * 1000)
                )
            )
    
    async def edit_image(
        self,
        image_path: str,
        prompt: str,
        mask_path: Optional[str] = None,
        output_path: Optional[str] = None
    ) -> GenerationResult:
        """
        Edit an existing image.
        
        Args:
            image_path: Path to the image to edit
            prompt: Edit instructions
            mask_path: Optional mask for targeted editing
            output_path: Optional path to save the edited image
            
        Returns:
            GenerationResult with the edited image
        """
        generation_id = str(uuid.uuid4())
        start_time = datetime.now()
        
        if self._stub_mode:
            return self._generate_stub_result(generation_id, prompt, output_path)
        
        await self._ensure_session()
        
        try:
            # Encode the source image
            source_image = await self._encode_single_image(image_path)
            if not source_image:
                return GenerationResult(
                    success=False,
                    error_message=f"Failed to load source image: {image_path}",
                    metadata=GenerationMetadata(generation_id=generation_id)
                )
            
            payload = {
                "image": source_image,
                "prompt": prompt,
            }
            
            # Add mask if provided
            if mask_path:
                mask_image = await self._encode_single_image(mask_path)
                if mask_image:
                    payload["mask"] = mask_image
            
            # Make API request
            async with self._session.post(
                f"{self.base_url}/edit",
                json=payload
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    return GenerationResult(
                        success=False,
                        error_message=f"API error {response.status}: {error_text}",
                        metadata=GenerationMetadata(
                            generation_id=generation_id,
                            generation_time_ms=int((datetime.now() - start_time).total_seconds() * 1000)
                        )
                    )
                
                result_data = await response.json()
                
                # Save image if output path provided
                image_path_out = output_path
                if output_path and result_data.get("image_url"):
                    image_path_out = await self._download_image(
                        result_data["image_url"],
                        output_path
                    )
                
                return GenerationResult(
                    success=True,
                    image_path=image_path_out,
                    image_url=result_data.get("image_url"),
                    metadata=GenerationMetadata(
                        generation_id=generation_id,
                        model_used=result_data.get("model", "nanobanana-pro-edit"),
                        generation_time_ms=int((datetime.now() - start_time).total_seconds() * 1000),
                        parameters={"prompt": prompt}
                    )
                )
                
        except Exception as e:
            return GenerationResult(
                success=False,
                error_message=str(e),
                metadata=GenerationMetadata(
                    generation_id=generation_id,
                    generation_time_ms=int((datetime.now() - start_time).total_seconds() * 1000)
                )
            )
    
    async def _encode_images(self, image_paths: list[str]) -> list[str]:
        """Encode multiple images to base64."""
        encoded = []
        for path in image_paths:
            encoded_image = await self._encode_single_image(path)
            if encoded_image:
                encoded.append(encoded_image)
        return encoded
    
    async def _encode_single_image(self, image_path: str) -> Optional[str]:
        """Encode a single image to base64."""
        try:
            import base64
            with open(image_path, 'rb') as f:
                return base64.b64encode(f.read()).decode('utf-8')
        except Exception:
            return None
    
    async def _download_image(self, url: str, output_path: str) -> str:
        """Download an image from URL to local path."""
        try:
            async with self._session.get(url) as response:
                if response.status == 200:
                    # Ensure directory exists
                    os.makedirs(os.path.dirname(output_path), exist_ok=True)
                    
                    with open(output_path, 'wb') as f:
                        f.write(await response.read())
                    return output_path
        except Exception:
            pass
        return output_path
    
    def _generate_stub_result(
        self,
        generation_id: str,
        prompt: str,
        output_path: Optional[str]
    ) -> GenerationResult:
        """Generate a stub result for testing."""
        return GenerationResult(
            success=True,
            image_path=output_path or f"/tmp/stub_{generation_id}.png",
            image_url=None,
            metadata=GenerationMetadata(
                generation_id=generation_id,
                model_used="stub",
                generation_time_ms=100,
                parameters={"prompt": prompt, "stub": True}
            ),
            warnings=["Running in stub mode - no actual image generated"]
        )
