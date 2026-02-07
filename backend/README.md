# MemoryBook Backend

Multi-agent backend for generating personalized memory books using AI.

## Quick Start

```bash
# Create virtual environment
cd backend
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python run_local.py
```

The API will be available at:
- **API**: http://127.0.0.1:8000
- **Docs**: http://127.0.0.1:8000/docs
- **Health**: http://127.0.0.1:8000/health

## API Endpoints

### POST /jobs

Create a new book generation job with multipart/form-data.

**Request:**
```bash
curl -X POST "http://localhost:8000/jobs" \
  -F "payload={
    \"title\": \"Maria's Life Journey\",
    \"date\": \"2024-03-15\",
    \"page_count\": 10,
    \"style\": \"watercolor\",
    \"user_language\": \"pt-BR\",
    \"young\": {
      \"memories\": [\"Brincando no jardim da avó\", \"Primeiro dia de escola\"],
      \"key_events\": [\"Nascimento\", \"Aprender a andar\"],
      \"emotions\": [\"Alegria\", \"Curiosidade\"]
    },
    \"adolescent\": {
      \"memories\": [\"Formatura do ensino médio\"],
      \"key_events\": [\"Formatura\"],
      \"emotions\": [\"Empolgação\"]
    },
    \"adult\": {
      \"memories\": [\"Dia do casamento\"],
      \"key_events\": [\"Casamento\"],
      \"emotions\": [\"Amor\"]
    },
    \"elderly\": {
      \"memories\": [\"Aposentadoria\"],
      \"key_events\": [\"Festa de aposentadoria\"],
      \"emotions\": [\"Gratidão\"]
    }
  }" \
  -F "reference_images=@photo1.jpg" \
  -F "reference_images=@photo2.jpg" \
  -F "reference_images=@photo3.jpg"
```

**Response:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "queued",
  "message": "Job created and queued for processing"
}
```

### GET /jobs/{job_id}

Get job status and progress.

**Response:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "current_step": "image_generation",
  "progress_percent": 65,
  "steps": [
    {
      "name": "normalization",
      "status": "completed",
      "started_at": "2024-03-15T10:30:00",
      "completed_at": "2024-03-15T10:30:05",
      "error": null
    },
    {
      "name": "planning",
      "status": "completed",
      "started_at": "2024-03-15T10:30:05",
      "completed_at": "2024-03-15T10:30:15",
      "error": null
    },
    {
      "name": "image_generation",
      "status": "in_progress",
      "started_at": "2024-03-15T10:30:30",
      "completed_at": null,
      "error": null
    }
  ],
  "pages": [
    { "page_number": 0, "page_type": "cover", "status": "completed", "retry_count": 0 },
    { "page_number": 1, "page_type": "page", "status": "completed", "retry_count": 0 },
    { "page_number": 2, "page_type": "page", "status": "generating", "retry_count": 0 },
    { "page_number": 3, "page_type": "page", "status": "pending", "retry_count": 0 }
  ],
  "created_at": "2024-03-15T10:30:00",
  "updated_at": "2024-03-15T10:31:00",
  "error": null
}
```

### GET /jobs/{job_id}/result

Get the final book package (only available when status is "completed").

**Response:**
```json
{
  "book_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Maria's Life Journey",
  "style": "watercolor",
  "created_at": "2024-03-15T10:30:00",
  "cover": {
    "page_number": 0,
    "page_type": "cover",
    "image_path": "/path/to/cover.png",
    "generation_attempts": 1
  },
  "back_cover": {
    "page_number": -1,
    "page_type": "back_cover",
    "image_path": "/path/to/back_cover.png",
    "generation_attempts": 1
  },
  "pages": [
    {
      "page_number": 1,
      "page_type": "content",
      "image_path": "/path/to/page_01.png",
      "life_phase": "young",
      "memory_reference": "Brincando no jardim da avó",
      "generation_attempts": 1
    }
  ],
  "total_pages": 12,
  "design_review": {
    "overall_cohesion": 8.5,
    "style_consistency_score": 9.0,
    "color_palette_harmony": 8.0,
    "narrative_flow": 8.5,
    "character_consistency": 7.5,
    "approved": true,
    "global_suggestions": []
  },
  "total_generation_time_ms": 45000,
  "total_retries": 2
}
```

### GET /jobs/{job_id}/assets

List all assets (references and outputs) for a job.

**Response:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "references": [
    { "filename": "reference_00.jpg", "url": "/assets/{job_id}/references/reference_00.jpg" },
    { "filename": "reference_01.jpg", "url": "/assets/{job_id}/references/reference_01.jpg" },
    { "filename": "reference_02.jpg", "url": "/assets/{job_id}/references/reference_02.jpg" }
  ],
  "outputs": [
    { "filename": "cover.png", "url": "/assets/{job_id}/outputs/cover.png" },
    { "filename": "page_01.png", "url": "/assets/{job_id}/outputs/page_01.png" },
    { "filename": "back_cover.png", "url": "/assets/{job_id}/outputs/back_cover.png" },
    { "filename": "result.json", "url": "/assets/{job_id}/outputs/result.json" }
  ]
}
```

### GET /assets/{job_id}/{folder}/{filename}

Serve an asset file (image or JSON).

- `folder`: "references" or "outputs"
- `filename`: The file to retrieve

### GET /jobs

List recent jobs.

**Query Parameters:**
- `limit`: Maximum number of jobs (default: 20)

**Response:**
```json
{
  "jobs": [
    {
      "job_id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "completed",
      "progress_percent": 100,
      "created_at": "2024-03-15T10:30:00",
      "title": "Maria's Life Journey"
    }
  ],
  "total": 1
}
```

### DELETE /jobs/{job_id}

Delete a job and all its assets.

### GET /languages

Get list of supported languages.

**Response:**
```json
{
  "languages": [
    { "code": "pt-BR", "name": "Português (Brasil)" },
    { "code": "en-US", "name": "English (United States)" },
    { "code": "es-ES", "name": "Español (España)" }
  ],
  "default": "en-US"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-03-15T10:30:00",
  "config_valid": true,
  "stub_mode": true,
  "supported_languages": ["pt-BR", "en-US", "es-ES", "fr-FR", "de-DE", "it-IT"]
}
```

## Frontend Integration

### JavaScript/TypeScript Example

```typescript
// Create a job
const formData = new FormData();

const payload = {
  title: "Maria's Life Journey",
  date: "2024-03-15",
  page_count: 10,
  style: "watercolor",
  user_language: "pt-BR",
  young: {
    memories: ["Playing in grandma's garden"],
    key_events: ["Birth"],
    emotions: ["Joy"]
  },
  adolescent: { memories: [], key_events: [], emotions: [] },
  adult: { memories: [], key_events: [], emotions: [] },
  elderly: { memories: [], key_events: [], emotions: [] }
};

formData.append('payload', JSON.stringify(payload));
files.forEach(file => formData.append('reference_images', file));

const response = await fetch('http://localhost:8000/jobs', {
  method: 'POST',
  body: formData
});

const { job_id } = await response.json();

// Poll for status
const checkStatus = async () => {
  const res = await fetch(`http://localhost:8000/jobs/${job_id}`);
  const status = await res.json();
  
  if (status.status === 'completed') {
    const resultRes = await fetch(`http://localhost:8000/jobs/${job_id}/result`);
    const result = await resultRes.json();
    console.log('Book ready!', result);
  } else if (status.status === 'failed') {
    console.error('Job failed:', status.error);
  } else {
    console.log(`Progress: ${status.progress_percent}%`);
    setTimeout(checkStatus, 1000);
  }
};

checkStatus();
```

## Project Structure

```
backend/
├── app.py                    # FastAPI application
├── run_local.py              # Local development runner
├── requirements.txt          # Python dependencies
├── README.md                 # This file
│
├── agents/                   # AI Agents
├── models/                   # Pydantic models
├── clients/                  # External API clients
├── pipeline/                 # Pipeline orchestration
├── prompts/                  # Master prompts for agents
├── store/                    # In-memory job storage
├── storage/                  # File storage (uploads/outputs)
├── utils/                    # Utilities
└── tests/                    # Tests
```

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_API_KEY` | Google Gemini API key | (stub mode if not set) |
| `NANOBANANA_API_KEY` | NanoBanana Pro API key | (stub mode if not set) |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |
| `DEBUG` | Debug mode | `false` |

## Stub Mode

If API keys are not configured, the backend runs in "stub mode":
- Gemini calls return mock JSON responses
- Image generation returns placeholder paths
- All features work for testing without real API calls

## Testing

```bash
pytest
pytest -v
pytest --cov=.
```

## License

MIT License
