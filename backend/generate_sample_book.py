#!/usr/bin/env python3
"""
Generate Sample Book

Script to generate the sample watercolor memory book
("As Memórias do Papai") using the full pipeline.

The generated images are saved to ../src/assets/sample-book/
and can be referenced in sampleBook.ts.

Usage:
    cd backend
    python generate_sample_book.py
"""

import os
import sys
import json
import asyncio
import shutil
from pathlib import Path

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

from models.user_input import UserForm, BookPreferences, ReferenceImages, LifePhase
from models.output import FinalBookPackage
from pipeline.runner import PipelineRunner
from clients.gemini_client import GeminiClient
from utils.logging import setup_logger
from utils.config import get_config, load_config_from_env


# Sample book data - matches sampleBook.ts
SAMPLE_FORM = UserForm(
    young=LifePhase(
        memories=[
            "Correr descalço no quintal da casa amarela, perseguindo borboletas entre as árvores de manga",
            "Brincar com os irmãos Pedro, Ana e João nas tardes quentes de verão",
            "Subir em árvores, pescar no riacho com o avô",
            "Ouvir histórias da vovó antes de dormir",
        ],
        key_events=[
            "Primeiro dia de escola com mochila nova e cabelo penteado pela avó",
            "Voltou para casa cheio de histórias sobre novos amigos e a professora que desenhava flores",
        ],
        emotions=["alegria", "inocência", "curiosidade", "liberdade"]
    ),
    adolescent=LifePhase(
        memories=[
            "Jogar futebol todas as tardes no campinho do bairro com os amigos",
            "Sonhar em ser jogador profissional",
            "Estudar de manhã e ajudar na mercearia do tio à tarde",
            "Mudou para a cidade pequena para estudar no colegial",
        ],
        key_events=[
            "Primeiro da família a se formar no colegial",
            "Formatura - avó chorou de alegria e avô disse que era o dia mais feliz da vida dele",
        ],
        emotions=["determinação", "orgulho", "amizade", "esperança"]
    ),
    adult=LifePhase(
        memories=[
            "Trabalhou como professor de matemática por 35 anos, transformando números em histórias",
            "Adorava jardinagem, café coado na hora e contar piadas",
            "Casou-se com Maria Helena numa manhã de sol - esqueceu o discurso e só sorriu",
            "Segurando a filha Ana Clara nos braços pela primeira vez, prometendo estar sempre ali",
            "Ensinando a filha a andar de bicicleta - 'Eu estou aqui, não vou te soltar'",
        ],
        key_events=[
            "Casamento com Maria Helena",
            "Nascimento da filha Ana Clara",
            "Momento em que soltou a bicicleta e a filha voou sozinha",
        ],
        emotions=["amor", "orgulho paternal", "felicidade", "ternura"]
    ),
    elderly=LifePhase(
        memories=[
            "Mora com a família na mesma casa onde criou a filha",
            "Todas as manhãs toma café no jardim olhando as flores que plantou",
            "Gosta de sentar na varanda ouvindo música antiga",
            "O som da risada dos netos traz alegria",
        ],
        key_events=[
            "Último Natal em família - sentou na cabeceira cercado por filhos e netos",
            "Mesmo quando as palavras faltam, o sorriso diz tudo",
        ],
        emotions=["serenidade", "saudade", "amor incondicional", "paz"]
    )
)

SAMPLE_PREFERENCES = BookPreferences(
    title="As Memórias do Papai",
    date="2026-02-14",
    page_count=10,
    style="watercolor"
)

SAMPLE_REFERENCE = ReferenceImages(paths=[])  # No reference photos for this sample

OUTPUT_DIR = Path(__file__).parent.parent / "src" / "assets" / "sample-book"


async def main():
    """Generate the sample book."""
    print("=" * 60)
    print("  Generating Sample Book: As Memórias do Papai")
    print("=" * 60)
    
    # Load config
    load_config_from_env()
    config = get_config()
    
    # Validate API key
    if not config.google_api_key:
        print("\nERROR: GOOGLE_API_KEY not set in .env")
        print("Please add your Google Gemini API key to backend/.env")
        sys.exit(1)
    
    # Setup logger
    logger = setup_logger("sample_book")
    
    # Initialize Gemini client
    print("\n[1/3] Initializing Gemini client...")
    gemini_client = GeminiClient(
        api_key=config.google_api_key,
    )
    
    # Create pipeline runner
    print("[2/3] Running pipeline...")
    runner = PipelineRunner(gemini_client, logger)
    
    try:
        result: FinalBookPackage = await runner.run(
            user_form=SAMPLE_FORM,
            preferences=SAMPLE_PREFERENCES,
            reference_images=SAMPLE_REFERENCE,
            user_language="pt-BR",
            max_retries=2
        )
        
        print(f"\n[3/3] Pipeline complete! {len(result.pages)} pages generated.")
        
        # Create output directory
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        
        # Copy generated images to assets
        print(f"\nCopying images to {OUTPUT_DIR}...")
        
        image_mapping = {}
        
        # Collect all pages: cover + content + back_cover
        all_book_pages = [result.cover] + list(result.pages) + [result.back_cover]
        
        for page in all_book_pages:
            if page.image_path and os.path.exists(page.image_path):
                # Determine filename
                if page.page_number == 0:
                    filename = "cover.png"
                elif page.page_number == -1:
                    filename = "back-cover.png"
                else:
                    filename = f"page-{page.page_number}.png"
                
                dest = OUTPUT_DIR / filename
                shutil.copy2(page.image_path, dest)
                print(f"  Copied: {filename}")
                
                image_mapping[page.page_number] = f"/src/assets/sample-book/{filename}"
        
        # Save metadata
        all_pages = [result.cover] + list(result.pages) + [result.back_cover]
        metadata = {
            "title": result.title,
            "total_pages": result.total_pages,
            "style": "watercolor",
            "generated_at": str(result.created_at if hasattr(result, 'created_at') else "2026-02-14"),
            "pages": [
                {
                    "page_number": p.page_number,
                    "page_type": p.page_type,
                    "narrative_text": p.narrative_text,
                    "life_phase": p.life_phase,
                    "memory_reference": p.memory_reference,
                    "image_file": image_mapping.get(p.page_number, ""),
                }
                for p in all_pages
            ]
        }
        
        metadata_path = OUTPUT_DIR / "metadata.json"
        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
        
        print(f"\n  Metadata saved to: {metadata_path}")
        print(f"\n{'=' * 60}")
        print(f"  SUCCESS! Sample book generated with {len(image_mapping)} images.")
        print(f"  Output: {OUTPUT_DIR}")
        print(f"{'=' * 60}")
        print(f"\nNext steps:")
        print(f"  1. Update src/data/sampleBook.ts with the local image paths")
        print(f"  2. Import images using: import coverImg from '../assets/sample-book/cover.png'")
        
    except Exception as e:
        print(f"\nERROR: Pipeline failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        await gemini_client.close()


if __name__ == "__main__":
    asyncio.run(main())
