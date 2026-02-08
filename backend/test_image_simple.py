"""Simple image generation test."""
import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

async def test_image_generation():
    """Test image generation with Gemini."""
    from google import genai
    from google.genai import types
    
    api_key = os.getenv("GOOGLE_API_KEY")
    print(f"API Key: {api_key[:20]}...")
    
    # Available models from list
    models_to_try = [
        "imagen-4.0-fast-generate-001",  # Imagen 4 fast
        "imagen-4.0-generate-001",        # Imagen 4 standard
        "gemini-2.5-flash-image",         # Gemini 2.5 with image
        "gemini-3-pro-image-preview",     # Gemini 3 (current)
    ]
    
    prompt = "A watercolor painting of a happy family having a picnic in a sunny park"
    
    client = genai.Client(api_key=api_key)
    
    # List available models
    print("\nListing available models with image generation capability...")
    try:
        for model in client.models.list():
            model_id = model.name.split("/")[-1] if "/" in model.name else model.name
            if "image" in model_id.lower() or "imagen" in model_id.lower():
                print(f"  - {model_id}")
    except Exception as e:
        print(f"Error listing models: {e}")
    
    for model_name in models_to_try:
        print(f"\n{'='*50}")
        print(f"Testing model: {model_name}")
        print(f"{'='*50}")
        
        try:
            # Different approach for Imagen vs Gemini models
            if "imagen" in model_name:
                # Imagen models use a different API
                print("Using Imagen API...")
                response = client.models.generate_images(
                    model=model_name,
                    prompt=prompt,
                    config=types.GenerateImagesConfig(
                        number_of_images=1,
                    )
                )
                
                if response.generated_images:
                    image = response.generated_images[0]
                    print(f"SUCCESS! Image generated")
                    # Save image
                    output_path = f"test_output_{model_name.replace('.', '_')}.png"
                    with open(output_path, "wb") as f:
                        f.write(image.image.image_bytes)
                    print(f"Saved to: {output_path}")
                    return True
                else:
                    print("No image in response")
                    
            else:
                # Gemini models use generate_content
                print("Using Gemini generate_content API...")
                response = client.models.generate_content(
                    model=model_name,
                    contents=[prompt],
                    config=types.GenerateContentConfig(
                        response_modalities=["IMAGE", "TEXT"],
                    )
                )
                
                # Check for image in response
                for candidate in response.candidates:
                    for part in candidate.content.parts:
                        if hasattr(part, 'inline_data') and part.inline_data:
                            print(f"SUCCESS! Image generated")
                            output_path = f"test_output_{model_name.replace('.', '_')}.png"
                            with open(output_path, "wb") as f:
                                f.write(part.inline_data.data)
                            print(f"Saved to: {output_path}")
                            return True
                
                print("No image in response")
                if response.text:
                    print(f"Text response: {response.text[:200]}...")
                    
        except Exception as e:
            print(f"ERROR: {type(e).__name__}: {e}")
    
    return False

if __name__ == "__main__":
    result = asyncio.run(test_image_generation())
    print(f"\n{'='*50}")
    print(f"Test result: {'SUCCESS' if result else 'FAILED'}")
