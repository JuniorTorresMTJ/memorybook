#!/usr/bin/env python3
"""
Generate Sample Books — Images for 4 additional example books.

Generates images using Gemini 2.5 Flash Image and uploads them to
Firebase Storage under /public/sample-books/{bookId}/.

Usage:
    cd backend
    python generate_all_sample_books.py
"""

import os
import sys
import io
import asyncio
import logging
from pathlib import Path
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()

# ── Logging ──────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("sample_books")

# ── Config ───────────────────────────────────────────────────
API_KEY = os.getenv("GOOGLE_API_KEY")
BUCKET_NAME = os.getenv("FIREBASE_STORAGE_BUCKET", "memory-book-app-1bfd7.firebasestorage.app")
OUTPUT_LOCAL = Path(__file__).parent / "output" / "sample-books"

if not API_KEY:
    print("ERROR: GOOGLE_API_KEY not set in .env")
    sys.exit(1)


# ── Data Classes ─────────────────────────────────────────────
@dataclass
class PagePrompt:
    filename: str          # e.g. "cover.jpg", "page-01.jpg"
    prompt: str


@dataclass
class BookConfig:
    book_id: str
    style: str
    character_desc: str
    pages: list[PagePrompt]


# ── Style directives ─────────────────────────────────────────
STYLE_DIRECTIVES = {
    "cartoon": "vibrant cartoon illustration, bold outlines, bright cheerful colors, clean shapes, Pixar-style, friendly character design, warm lighting",
    "anime": "soft anime illustration, large expressive eyes, gentle pastel colors, Japanese animation style, delicate features, emotional atmosphere, beautiful soft lighting",
    "coloring": "coloring book page, clean black outlines on white background, simple shapes, no shading, no color fill, ready to color, clear line art, minimal background detail",
    "watercolor": "delicate watercolor illustration, soft washes, dreamy atmosphere, warm pastel colors, gentle brushstrokes, artistic texture, soft natural lighting",
}


# ════════════════════════════════════════════════════════════
# BOOK DEFINITIONS
# ════════════════════════════════════════════════════════════

def make_prompt(style: str, char_desc: str, scene: str) -> str:
    """Build a complete prompt from style + character + scene."""
    return f"{STYLE_DIRECTIVES[style]}. Character: {char_desc}. Scene: {scene}. IMPORTANT: Do NOT include any text, letters, words, numbers, captions, titles, labels, signs, or typography anywhere in the image. The image must be purely visual with zero written content."


# ── Book 1: Cartoon — Pai João ──────────────────────────────
CARTOON_PAI = BookConfig(
    book_id="cartoon-pai",
    style="cartoon",
    character_desc="Brazilian man named João, dark brown skin, short black curly hair, warm brown eyes, strong fisherman build, friendly wide smile, wearing simple clothes",
    pages=[
        PagePrompt("cover.jpg", make_prompt("cartoon",
            "elderly Brazilian fisherman, dark brown skin, short white curly hair, warm brown eyes, weathered kind face, wearing a simple white shirt",
            "portrait of the character standing proudly near the ocean, blue sky, fishing boat in background, warm golden hour lighting, editorial book cover composition with space for title at top")),
        PagePrompt("page-01.jpg", make_prompt("cartoon",
            "young Brazilian boy around 5, dark brown skin, short black curly hair, big curious eyes, wearing shorts and no shirt",
            "little boy building an enormous sandcastle on a beautiful tropical beach, waves in background, seashells around, coconut palms, bright sunny day, joyful expression")),
        PagePrompt("page-02.jpg", make_prompt("cartoon",
            "young Brazilian boy around 7, dark brown skin, short black curly hair, big eyes, sitting in a wooden boat",
            "boy and his grandfather (elderly dark-skinned man with white hair) on a traditional wooden jangada fishing boat at dawn, calm ocean, golden sunrise, grandfather teaching boy to fish, warm bonding moment")),
        PagePrompt("page-03.jpg", make_prompt("cartoon",
            "Brazilian teenager around 15, dark brown skin, curly black hair, athletic build, barefoot",
            "teenager playing football on a beach at sunset with friends, kicking the ball mid-air, dynamic action pose, orange sky, other teens in background, sand flying, joyful energy")),
        PagePrompt("page-04.jpg", make_prompt("cartoon",
            "young Brazilian man around 18, dark brown skin, short curly hair, proud expression, wearing work clothes",
            "young man standing proudly next to his first small fishing boat painted blue and white named 'Estrela do Mar', at a wooden dock, calm ocean, sunrise, emotional proud moment")),
        PagePrompt("page-05.jpg", make_prompt("cartoon",
            "young Brazilian man around 22, dark brown skin, curly hair, handsome, wearing a plaid shirt and straw hat",
            "lively São João festival night scene, the man dancing forró with a beautiful young woman in a chintz dress, bonfire in background, string lights, fireworks in the sky, romantic joyful atmosphere")),
        PagePrompt("page-06.jpg", make_prompt("cartoon",
            "young Brazilian couple, the man dark-skinned with curly hair in a suit, the woman in a simple white dress with jasmine flowers in hair",
            "intimate wedding ceremony at a small white church near the ocean, waves visible, warm sunlight streaming through windows, emotional moment at the altar, guests smiling")),
        PagePrompt("page-07.jpg", make_prompt("cartoon",
            "adult Brazilian man around 30, dark brown skin, curly hair, emotional expression, wearing hospital gown",
            "new father holding a tiny newborn baby in his big fisherman hands at a hospital room, tears of joy, tender careful gesture, warm soft lighting, deeply emotional moment")),
        PagePrompt("page-08.jpg", make_prompt("cartoon",
            "adult Brazilian man around 35, dark brown skin, short curly hair, patient loving expression, and a small boy around 6",
            "father and young son on a fishing boat together, father teaching son to hold a fishing rod, calm sea, beautiful morning light, bonding moment, son looking up at father with admiration")),
        PagePrompt("page-09.jpg", make_prompt("cartoon",
            "elderly Brazilian man around 65, dark brown skin, white curly hair, kind wrinkled face, wearing a straw hat",
            "elderly man tending a beautiful tropical garden next to a blue seaside house, hibiscus flowers, coconut palm, herbs, a colorful parrot perched on his shoulder, peaceful afternoon light")),
        PagePrompt("page-10.jpg", make_prompt("cartoon",
            "large multigenerational Brazilian family, mix of ages from elderly to children, dark-skinned",
            "big family reunion on a tropical beach, long table with white tablecloth and food, multiple generations laughing together, sunset over ocean, festive warm atmosphere, string lights")),
        PagePrompt("back-cover.jpg", make_prompt("cartoon",
            "no character focus",
            "beautiful sunset over a calm tropical ocean, silhouette of a small fishing boat, warm orange and pink sky, gentle waves, peaceful serene atmosphere, cinematic composition, minimal")),
    ]
)

# ── Book 2: Anime — Mãe Helena ──────────────────────────────
ANIME_MAE = BookConfig(
    book_id="anime-mae",
    style="anime",
    character_desc="Brazilian woman named Helena, light brown skin, long straight dark brown hair, warm brown eyes behind round glasses, gentle kind face",
    pages=[
        PagePrompt("cover.jpg", make_prompt("anime",
            "mature Brazilian woman around 55, light brown skin, long dark hair with some gray strands, round glasses, gentle maternal expression, wearing a white blouse",
            "portrait of the character in a warm indoor setting with soft light, bookshelf and plants in background, serene caring expression, editorial book cover style with space for title")),
        PagePrompt("page-01.jpg", make_prompt("anime",
            "young Brazilian girl around 6, light brown skin, straight dark hair in ponytails, big curious brown eyes",
            "little girl in a small cozy apartment, looking out a window at trees in a city square, dreamy expression, warm afternoon light, toys and books around her, vintage São Paulo neighborhood")),
        PagePrompt("page-02.jpg", make_prompt("anime",
            "young Brazilian girl around 8, light brown skin, dark hair, expressive eyes, holding a flashlight",
            "girl telling stories to two younger siblings under a blanket tent on a bed, flashlight creating warm glow, siblings listening with wide eyes, stuffed animals around, magical cozy nighttime scene")),
        PagePrompt("page-03.jpg", make_prompt("anime",
            "teenage Brazilian girl around 14, light brown skin, long dark hair, wearing school uniform",
            "girl in a hospital corridor, observing a kind nurse caring for an elderly patient, the girl watches with admiration and determination, clean white hospital environment, emotional learning moment")),
        PagePrompt("page-04.jpg", make_prompt("anime",
            "young Brazilian woman around 22, light brown skin, long dark hair, wearing graduation cap and gown, beaming with pride",
            "nursing school graduation ceremony, family in audience cheering, elderly grandmother in wheelchair applauding, confetti, bright auditorium, emotional proud moment, tears of joy")),
        PagePrompt("page-05.jpg", make_prompt("anime",
            "young Brazilian woman around 25, light brown skin, dark hair in a bun, wearing nurse scrubs, determined expression",
            "night shift at a large hospital, nurse attending to a patient with care, warm bedside lamp, monitors glowing softly, compassionate professional moment, hospital at night atmosphere")),
        PagePrompt("page-06.jpg", make_prompt("anime",
            "young Brazilian woman around 28, light brown skin, long dark hair, glasses, casual clothes, and a young man with brown eyes",
            "cozy bookstore scene, the woman and man reaching for the same book on a high shelf, their hands almost touching, warm golden bookstore lighting, romantic meet-cute moment")),
        PagePrompt("page-07.jpg", make_prompt("anime",
            "Brazilian couple, woman in white dress, man in simple suit, both smiling radiantly",
            "intimate garden wedding ceremony, flower arch, small group of family, sunlight filtering through trees, bride and groom exchanging vows, emotional beautiful moment, cherry blossoms")),
        PagePrompt("page-08.jpg", make_prompt("anime",
            "young Brazilian woman around 32, light brown skin, dark hair, exhausted but glowing with happiness, holding a newborn",
            "hospital room, new mother holding baby for the first time, morning sunlight through window, husband filming with tears, tender intimate moment, soft warm lighting")),
        PagePrompt("page-09.jpg", make_prompt("anime",
            "mature Brazilian woman around 55, light brown skin, long dark hair with gray, glasses, wearing formal clothes, emotional",
            "retirement ceremony at a hospital, colleagues applauding, flowers and a plaque, the woman hugging an elderly former mentor, tears and smiles, warm emotional tribute scene")),
        PagePrompt("page-10.jpg", make_prompt("anime",
            "mature Brazilian woman around 60, light brown skin, gray-streaked hair, glasses, wearing gardening clothes, happy and peaceful",
            "beautiful home garden, woman and her adult daughter gardening together, planting flowers, laughing, warm afternoon sunlight, peaceful domestic scene, roses and herbs growing")),
        PagePrompt("back-cover.jpg", make_prompt("anime",
            "no character",
            "open book lying in a sunlit garden with delicate flowers growing from its pages, butterflies, soft dreamy light, magical peaceful atmosphere, symbolic of stories and life")),
    ]
)

# ── Book 3: Coloring — Vovô Antônio ─────────────────────────
COLORING_AVO = BookConfig(
    book_id="coloring-avo",
    style="coloring",
    character_desc="elderly Brazilian man, thin build, white hair, thick white mustache, straw hat, weathered kind face with smile lines, wearing simple farm clothes",
    pages=[
        PagePrompt("cover.jpg", make_prompt("coloring",
            "elderly Brazilian farmer, white hair, thick mustache, straw hat, kind smile, wearing simple shirt",
            "portrait of the farmer standing in front of a farm landscape, fence, barn, and rolling hills behind him, large space at top for title text, clean simple lines")),
        PagePrompt("page-01.jpg", make_prompt("coloring",
            "small boy around 5, wearing overalls and bare feet, cheerful face",
            "little boy feeding chickens in a farmyard, big barn behind, wooden fence, a dog sitting nearby, mango trees, simple rural scene with clear outlines")),
        PagePrompt("page-02.jpg", make_prompt("coloring",
            "boy around 8 sitting on a horse, and his father (adult man in cowboy hat) on another horse",
            "father and son riding horses through open fields, cerrado landscape with scattered trees, rolling hills, birds in sky, peaceful countryside scene")),
        PagePrompt("page-03.jpg", make_prompt("coloring",
            "teenage boy around 14, wearing school uniform, riding a bicycle",
            "teenager riding a bicycle on a dirt road between fields, school bag on back, farm in the distance, dust trail, morning sun, rural landscape")),
        PagePrompt("page-04.jpg", make_prompt("coloring",
            "young man around 20 in plaid shirt, and a young woman in a flowered dress",
            "couple dancing at a festive town dance, string lights overhead, other couples dancing in background, musicians playing, joyful celebration scene")),
        PagePrompt("page-05.jpg", make_prompt("coloring",
            "young man around 25 laying bricks, and a young woman carrying materials, both smiling",
            "couple building a house together, partially built walls, construction materials around, helpers in background, rural setting, hopeful determined scene")),
        PagePrompt("page-06.jpg", make_prompt("coloring",
            "adult man around 30 with a straw hat, standing proudly in a field",
            "farmer standing in a bountiful harvest field with tall golden corn, baskets of produce, tractor in background, sunrise, vast fertile farmland, proud moment")),
        PagePrompt("page-07.jpg", make_prompt("coloring",
            "adult man around 40 with four children of different ages around him",
            "father teaching children about farming, showing them plants, farm animals nearby, children listening attentively, rural family scene, educational warm moment")),
        PagePrompt("page-08.jpg", make_prompt("coloring",
            "large family gathered around a long table on a veranda",
            "big family Sunday lunch scene, long table full of food on a farmhouse veranda, multiple generations, grandmother serving, children playing, dogs under table, festive warm scene")),
        PagePrompt("page-09.jpg", make_prompt("coloring",
            "elderly man sitting in a rocking chair on a porch, playing guitar",
            "old man playing a viola guitar on a farmhouse veranda at sunset, wife doing crochet nearby, dogs at his feet, peaceful rural evening, rolling hills in distance")),
        PagePrompt("page-10.jpg", make_prompt("coloring",
            "elderly man surrounded by several small children, all smiling",
            "grandfather showing grandchildren farm animals - cow, horse, chickens, dog, children petting the animals excitedly, barn in background, pastoral family scene")),
        PagePrompt("back-cover.jpg", make_prompt("coloring",
            "no characters",
            "peaceful farm landscape, rolling hills, fence line, single large tree, sunset sky, barn in distance, serene minimalist countryside scene")),
    ]
)

# ── Book 4: Watercolor — Tia Rosa ───────────────────────────
WATERCOLOR_TIA = BookConfig(
    book_id="watercolor-tia",
    style="watercolor",
    character_desc="Brazilian woman named Rosa, medium brown skin, curly dark hair turning gray, round cheerful face, warm smile, always wearing a baker's apron with flour dusting",
    pages=[
        PagePrompt("cover.jpg", make_prompt("watercolor",
            "mature Brazilian woman around 55, medium brown skin, curly gray-streaked dark hair, round cheerful face, wearing a flour-dusted apron, warm inviting smile",
            "portrait of the baker in her warm bakery, shelves with bread behind her, soft golden oven light, flour particles in air, editorial cover composition with title space at top")),
        PagePrompt("page-01.jpg", make_prompt("watercolor",
            "tiny girl around 4, medium brown skin, curly dark hair, standing on a wooden stool",
            "little girl watching her grandmother (elderly woman with white hair, apron) kneading bread dough in an old rustic kitchen, wood-burning stove, cast iron pans on wall, warm golden light, flour floating in air")),
        PagePrompt("page-02.jpg", make_prompt("watercolor",
            "girl around 8, medium brown skin, curly dark hair, proud expression, holding a cake pan",
            "girl alone in a kitchen, just pulled a golden cornmeal cake from the oven, steam rising, simple kitchen, rainy day visible through window, warm cozy atmosphere, sense of accomplishment")),
        PagePrompt("page-03.jpg", make_prompt("watercolor",
            "girl around 12, medium brown skin, curly dark hair, glasses, surrounded by other children",
            "school lunchtime scene, the girl opening her lunchbox filled with homemade treats, classmates gathered around eagerly, outdoor school courtyard, warm friendly atmosphere")),
        PagePrompt("page-04.jpg", make_prompt("watercolor",
            "teenage girl around 16, medium brown skin, curly dark hair, determined expression, riding a bicycle",
            "teenager delivering boxes of homemade sweets on a bicycle through a charming small town, cobblestone streets, colonial architecture, warm afternoon light, entrepreneurial spirit")),
        PagePrompt("page-05.jpg", make_prompt("watercolor",
            "young woman around 25, medium brown skin, curly dark hair, wearing a new apron, beaming with pride",
            "grand opening of a small bakery on a town square, 'Padaria da Rosa' sign being hung, line of customers waiting, elderly grandmother in wheelchair at first table, flowers, festive atmosphere")),
        PagePrompt("page-06.jpg", make_prompt("watercolor",
            "woman around 35, medium brown skin, curly dark hair, apron, confident and happy",
            "warm bakery interior, display case full of golden cheese breads, customers at small tables chatting over coffee, steam from the oven, warm wood and yellow tones, community gathering spot")),
        PagePrompt("page-07.jpg", make_prompt("watercolor",
            "woman around 40, medium brown skin, curly dark hair with some gray, apron, patient kind expression",
            "cooking class scene, the woman teaching small children wearing tiny aprons to bake, flour everywhere, children laughing, mixing bowls and spoons, warm chaotic kitchen, joyful mess")),
        PagePrompt("page-08.jpg", make_prompt("watercolor",
            "woman around 45, medium brown skin, curly dark hair, apron, warm generous expression",
            "Christmas Eve scene at the bakery, decorated with lights and a nativity scene, long line of people receiving free bread and hot chocolate, warm golden glow, community generosity, holiday magic")),
        PagePrompt("page-09.jpg", make_prompt("watercolor",
            "mature woman around 55, medium brown skin, graying curly hair, wearing a gardening hat, peaceful expression",
            "herb garden behind the bakery, woman sitting on a small bench with coffee, surrounded by basil, rosemary, mint, lavender, a large bay tree, birds, soft afternoon light, peaceful retreat")),
        PagePrompt("page-10.jpg", make_prompt("watercolor",
            "mature woman around 55, medium brown skin, graying curly hair, apron, and two young women (nieces) around 18-20",
            "three women cooking together in the bakery kitchen, the aunt teaching nieces to knead dough, an old recipe notebook open on the counter, flour on everyone, laughing together, warm multigenerational scene")),
        PagePrompt("back-cover.jpg", make_prompt("watercolor",
            "no character",
            "a rustic wooden kitchen table with freshly baked bread, a cup of steaming coffee, dried flowers in a vase, warm morning light streaming through a window, peaceful still life, soft focus")),
    ]
)

ALL_BOOKS = [CARTOON_PAI, ANIME_MAE, COLORING_AVO, WATERCOLOR_TIA]


# ════════════════════════════════════════════════════════════
# IMAGE GENERATION
# ════════════════════════════════════════════════════════════

async def generate_image(client, prompt: str, output_path: str) -> bool:
    """Generate a single image using Gemini."""
    from clients.gemini_client import GeminiClient
    
    gc: GeminiClient = client
    result = await gc.generate_image(prompt=prompt, output_path=output_path)
    return result.success


async def generate_book(client, book: BookConfig):
    """Generate all images for a single book."""
    book_dir = OUTPUT_LOCAL / book.book_id
    book_dir.mkdir(parents=True, exist_ok=True)

    logger.info(f"{'='*50}")
    logger.info(f"Generating: {book.book_id} ({book.style})")
    logger.info(f"{'='*50}")

    semaphore = asyncio.Semaphore(2)  # max 2 concurrent per book

    async def gen_page(page: PagePrompt):
        async with semaphore:
            output = str(book_dir / page.filename)
            # The GeminiClient forces .jpg extension
            output_jpg = output.replace(".jpg", "") + ".jpg"
            if os.path.exists(output_jpg):
                logger.info(f"  [skip] {page.filename} already exists")
                return True
            logger.info(f"  [gen]  {page.filename} ...")
            for attempt in range(3):
                ok = await generate_image(client, page.prompt, output)
                if ok:
                    logger.info(f"  [done] {page.filename}")
                    return True
                logger.warning(f"  [retry {attempt+1}] {page.filename}")
                await asyncio.sleep(2)
            logger.error(f"  [FAIL] {page.filename}")
            return False

    results = await asyncio.gather(*[gen_page(p) for p in book.pages])
    success = sum(results)
    logger.info(f"  => {success}/{len(book.pages)} images generated for {book.book_id}")
    return success


# ════════════════════════════════════════════════════════════
# FIREBASE STORAGE UPLOAD
# ════════════════════════════════════════════════════════════

def upload_to_storage():
    """Upload generated images to Firebase Storage."""
    try:
        from utils.firebase_admin import get_storage_bucket
    except Exception as e:
        logger.warning(f"Firebase Admin not available: {e}")
        logger.info("Skipping upload. Use gsutil to upload manually:")
        logger.info(f'  gsutil -m cp -r "{OUTPUT_LOCAL}/*" gs://{BUCKET_NAME}/public/sample-books/')
        return False

    os.environ.setdefault("FIREBASE_STORAGE_BUCKET", BUCKET_NAME)
    bucket = get_storage_bucket()
    uploaded = 0

    for book in ALL_BOOKS:
        book_dir = OUTPUT_LOCAL / book.book_id
        if not book_dir.exists():
            continue
        for img_file in sorted(book_dir.glob("*.jpg")):
            blob_path = f"public/sample-books/{book.book_id}/{img_file.name}"
            blob = bucket.blob(blob_path)
            blob.upload_from_filename(str(img_file), content_type="image/jpeg")
            blob.make_public()
            logger.info(f"  [upload] {blob_path} => {blob.public_url}")
            uploaded += 1

    logger.info(f"  => Uploaded {uploaded} images to Firebase Storage")
    return True


# ════════════════════════════════════════════════════════════
# MAIN
# ════════════════════════════════════════════════════════════

async def main():
    from clients.gemini_client import GeminiClient

    print("=" * 60)
    print("  Sample Books Image Generator")
    print("  4 books × 12 images = 48 images")
    print("=" * 60)

    client = GeminiClient(api_key=API_KEY)

    total = 0
    for book in ALL_BOOKS:
        n = await generate_book(client, book)
        total += n

    await client.close()

    print(f"\nGeneration complete: {total}/48 images")
    print(f"Local output: {OUTPUT_LOCAL}")

    # Upload
    print("\nUploading to Firebase Storage...")
    ok = upload_to_storage()
    if not ok:
        print("\nManual upload command:")
        print(f'  gsutil -m cp -r "{OUTPUT_LOCAL}/*" gs://{BUCKET_NAME}/public/sample-books/')

    print("\nDone!")


if __name__ == "__main__":
    asyncio.run(main())
