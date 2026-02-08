# Memory Book

**Transform life stories into beautiful illustrated books using AI.**

Memory Book is a full-stack web application that turns family memories and reference photos into personalized, AI-generated illustrated memory books. Powered by Google Gemini's multi-agent pipeline, it creates professional-quality books in minutes — not weeks.

**Live Demo:** [memory-book-app-1bfd7.web.app](https://memory-book-app-1bfd7.web.app)

---

## The Problem

Over **55 million people** worldwide live with Alzheimer's or dementia. Every 3 seconds, someone loses a memory. As the disease progresses, the stories that define a person's life — their childhood adventures, first love, proudest moments — begin to fade irreversibly.

Families want to preserve these memories, but the options available today fall short:

- **Traditional photo albums** are static and don't capture the narrative behind each moment.
- **Professional memory books** cost **$500–$2,000+** and take weeks to produce.
- **DIY approaches** require design skills, time, and effort most families don't have.

There is no accessible, affordable way to turn a lifetime of stories into a beautiful, illustrated keepsake — until now.

## The Objective

Memory Book aims to **democratize memory preservation** by making it possible for anyone to create a personalized, illustrated memory book in minutes for a fraction of the cost of traditional services.

**Core goals:**

1. **Accessibility** — A simple guided wizard that anyone can use, regardless of technical skill.
2. **Affordability** — Reduce the cost from $500+ to under $1 per book using AI generation.
3. **Quality** — Produce visually consistent, professionally styled illustrations across every page.
4. **Personalization** — Maintain character likeness throughout the book using reference photo analysis.
5. **Global reach** — Support multiple languages (English, Portuguese, Spanish, French, German, Italian).

---

## Features

### Book Creation Wizard
- Step-by-step guided flow to input memories across life phases (childhood, teenage years, adult life, later years).
- Upload **1–5 reference photos** for character consistency across all illustrations.
- Choose from **4 art styles**: Watercolor, Cartoon, Anime, and Coloring Book.
- Select page count (up to 10 content pages + cover + back cover).
- Real-time **progress tracking** with per-page status updates during generation.

### AI-Powered Multi-Agent Pipeline
- **11 specialized Gemini-powered agents** working in coordinated sequence:
  - **Normalizer Agent** — Structures raw user input.
  - **Narrative Planner Agent** — Organizes memories into a coherent story arc.
  - **Visual Analyzer Agent** — Extracts facial and physical features from reference photos (visual fingerprint).
  - **Prompt Writer Agent** — Crafts detailed image generation prompts.
  - **Prompt Reviewer Agent** — Reviews and refines prompts for quality.
  - **Image Generator Agent** — Generates illustrations using Gemini 2.5 Flash Image.
  - **Quality Validator Agent** — Validates output quality with retry logic.
  - Additional agents for design review, fixing, and final packaging.
- Parallel execution where possible using `asyncio.gather()`.
- Quality control loop with up to 3 retry attempts per image.

### Interactive Book Viewer
- Realistic **page-flip book viewer** in the browser with spread layout.
- Navigate through cover, content pages, and back cover.
- Full-screen viewing mode.

### PDF Export
- Download books as **landscape A4 PDFs** with professional book-style layout.
- Custom fonts embedded (Playfair Display for titles, Lora for body text).
- Project logo watermark on each page.
- Side-by-side image and text layout with decorative elements.
- Cover page, content pages with alternating layouts, and styled back cover.

### Dashboard
- View all created books in a personal library.
- Create new books, delete existing ones.
- Track generation progress for in-flight jobs.

### Authentication & Storage
- **Firebase Authentication** with Google OAuth and email/password sign-in.
- **Firebase Firestore** for book metadata and user data.
- **Firebase Storage** for reference images and generated illustrations.

### Internationalization
- Full multi-language support: **EN, PT-BR, ES, FR, DE, IT**.
- Language selector in the navbar.
- All UI text, labels, and narratives adapt to the selected language.

### Landing Page
- Modern, responsive design with animated hero section.
- Sample book showcase with interactive page viewer.
- Statistics section about memory preservation.
- How-it-works guide and privacy/security information.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite 7 | Build tool & dev server |
| Tailwind CSS 4 | Utility-first styling |
| Framer Motion | Animations & page transitions |
| React Router 7 | Client-side routing |
| jsPDF | Client-side PDF generation |
| Firebase SDK | Auth, Firestore, Storage |
| Lucide React | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| Python 3.11+ | Runtime |
| FastAPI | REST API framework |
| Pydantic | Data validation & schemas |
| Google GenAI SDK | Gemini API integration |
| Firebase Admin SDK | Server-side Firebase access |
| Pillow | Image processing & optimization |
| aiohttp / aiofiles | Async I/O operations |

### Infrastructure
| Service | Purpose |
|---|---|
| Firebase Hosting | Frontend deployment |
| Firebase Authentication | User management |
| Firebase Firestore | NoSQL database |
| Firebase Storage | File storage (images) |
| Google Gemini API | AI engine (text, vision, image generation) |

### Gemini Models Used
| Model | Task |
|---|---|
| `gemini-2.0-flash` | Fast analysis, planning, structured JSON output |
| `gemini-2.0-pro-exp` | Creative narrative generation |
| `gemini-2.5-flash-image` | Native image generation (illustrations) |

---

## Project Structure

```
Memorybook/
├── src/                          # Frontend source
│   ├── assets/                   # Images, fonts, sample book
│   ├── components/
│   │   ├── book/                 # Book viewer components (BookViewer, BookEditor, SpreadView)
│   │   ├── layout/               # Navbar, Footer, Dashboard layout
│   │   ├── ui/                   # Reusable UI components (Modals, Cards, Buttons)
│   │   └── wizard/               # Book creation wizard (steps, style selector, upload)
│   ├── constants/translations.tsx # Multi-language translations
│   ├── contexts/                 # React contexts (Auth, Language, Theme)
│   ├── data/                     # Sample book data
│   ├── lib/
│   │   ├── api/                  # Backend API client & hooks
│   │   ├── firebase/             # Firebase config, auth, firestore, storage
│   │   └── generatePdf.ts        # PDF generation logic
│   ├── pages/                    # Route pages (Home, Dashboard, BookPreview)
│   └── index.css                 # Global styles & Tailwind config
│
├── backend/                      # Python backend
│   ├── agents/                   # 11 specialized AI agents
│   ├── clients/                  # Gemini & external API clients
│   ├── models/                   # Pydantic data models
│   ├── pipeline/                 # Pipeline orchestration & validation
│   ├── prompts/                  # Master prompts & language utilities
│   ├── store/                    # Job store & file storage
│   ├── utils/                    # Config, logging, Firebase admin
│   ├── tests/                    # Unit & integration tests
│   ├── app.py                    # FastAPI application entry point
│   └── requirements.txt          # Python dependencies
│
├── public/                       # Static assets (favicons, manifest)
├── firebase.json                 # Firebase hosting & rules config
├── firestore.rules               # Firestore security rules
├── storage.rules                 # Storage security rules
└── package.json                  # Node.js dependencies & scripts
```

---

## Requirements

### Prerequisites
- **Node.js** 18+ and **npm** 9+
- **Python** 3.11+
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/apikey))
- **Firebase Project** with Authentication, Firestore, and Storage enabled

### Environment Variables

**Frontend** (`.env` in project root):
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=http://localhost:8000
```

**Backend** (`backend/.env`):
```env
GOOGLE_API_KEY=your_gemini_api_key
HOST=0.0.0.0
PORT=8000
DEBUG=false
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/juniortorres20/Memorybook.git
cd Memorybook
```

### 2. Set up the frontend

```bash
npm install
cp .env.example .env
# Edit .env with your Firebase credentials
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### 3. Set up the backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Gemini API key
python run_local.py
```

The API will be available at `http://localhost:8000` with docs at `http://localhost:8000/docs`.

### 4. Set up Firebase

Follow the instructions in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) to configure authentication, Firestore, and Storage rules.

### 5. Deploy

```bash
npm run build
npx firebase deploy --only hosting
```

---

## How It Works

```
User Input → Normalization → Narrative Planning ─┐
                                                  ├→ Prompt Writing → Prompt Review
Reference Photos → Visual Analysis ──────────────┘
                                                          │
                                                          ▼
                                                  Image Generation
                                                          │
                                                          ▼
                                                  Quality Validation
                                                     │         │
                                                  ✓ Pass    ✗ Fail → Fix & Retry (up to 3x)
                                                     │
                                                     ▼
                                              Design Review → Final Book Package
```

1. **Input** — User fills in memories across life phases and uploads reference photos.
2. **Normalization** — Raw input is structured and validated.
3. **Planning** — A narrative arc is created spanning childhood to later life.
4. **Visual Analysis** — Reference photos are analyzed to extract a visual fingerprint (facial features, body type, distinctive traits).
5. **Prompt Creation** — Detailed image generation prompts are crafted, embedding the visual fingerprint for character consistency.
6. **Review** — Prompts are reviewed and refined for quality.
7. **Generation** — Gemini 2.5 Flash Image generates each illustration.
8. **Validation** — Each image is validated; failed images are regenerated up to 3 times.
9. **Delivery** — The complete book is packaged and made available for viewing and PDF download.

---

## API Documentation

The backend provides a RESTful API. Full endpoint documentation is available at `/docs` when running the server.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/jobs` | Create a new book generation job |
| `GET` | `/jobs/{job_id}` | Get job status and progress |
| `GET` | `/jobs/{job_id}/result` | Get completed book data |
| `GET` | `/jobs/{job_id}/assets` | List all job assets |
| `GET` | `/assets/{job_id}/{folder}/{filename}` | Serve an asset file |
| `GET` | `/jobs` | List recent jobs |
| `DELETE` | `/jobs/{job_id}` | Delete a job and its assets |
| `GET` | `/languages` | Get supported languages |
| `GET` | `/health` | Health check |

See [backend/README.md](./backend/README.md) for detailed request/response examples.

---

## Scripts

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Backend
python run_local.py  # Start backend server
pytest               # Run tests
pytest -v --cov=.    # Run tests with coverage

# Firebase
npx firebase deploy --only hosting              # Deploy frontend
npm run firebase:deploy:rules                    # Deploy Firestore & Storage rules
npm run firebase:emulators                       # Start Firebase emulators
```

---

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

**Copyright (c) 2026 Junior Torres**
