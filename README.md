# AI Resume & Career Advisor 🚀

AI Resume & Career Advisor is an advanced AI-powered full-stack application designed to help students and job seekers align their resumes with specific Job Descriptions (JD). The system extracts text from PDF documents, indexes the job description using a Retrieval-Augmented Generation (RAG) vector database pipeline, compares candidate qualifications, and runs a career advisor agent layer to generate suitability reports, identify skill gaps, provide interview preparation roadmaps, and build a personalized 3-month learning roadmap.

---

## 🏗️ System Architecture & Data Flow

Below is the architecture diagram showing how data flows from user input through the PDF parser, the RAG vector store, the Career Advisor Agent, and the Gemini LLM to the React dashboard.

```
       +--------------------------------------------------------+
       |                     User Interface                     |
       |  (React, Vite, Tailwind CSS, Recharts, Lucide Icons)   |
       +------------+-------------------------------+-----------+
                    |                               ^
        Upload Resume & JD PDFs              Render Analysis Report
                    |                               |
                    v                               |
       +------------+-------------------------------+-----------+
       |                     FastAPI Backend                    |
       |                   (main.py / Python)                   |
       +------------+-------------------------------+-----------+
                    |                               |
             PDF File Stream                 Structured JSON
                    |                               |
                    v                               |
       +------------+-------------+                 |
       |        PDF Parser        |                 |
       |         (PyPDF)          |                 v
       +------------+-------------+        +--------+----------+
                    |                      |  Career Advisor   |
              Cleaned Text                 |      Agent        |
                    |                      | (advisor_agent.py)|
                    v                      +--------+----------+
       +------------+-------------+                 |
       |   Text Chunking Engine   |                 | Orchestrate
       |   (Character Overlap)    |                 | Sub-prompts
       +------------+-------------+                 v
                    |                      +--------+----------+
              Text Chunks                  |    Gemini LLM     |
                    |                      | (gemini-1.5-flash)|
                    v                      +-------------------+
       +------------+-------------+
       |     Embedding Model      |
       |  (SentenceTransformers)  |
       +------------+-------------+
                    |
              Vector Embeddings
                    |
                    v
       +------------+-------------+
       |   ChromaDB Vector Store  |
       |     (Cosine Metric)      |
       +--------------------------+
```

---

## 🌟 Core Features

1. **Dual PDF Processing**: Extracts and cleans text from both Resume and Job Description PDFs.
2. **True RAG Retrieval**: Employs Sentence-Transformers (`all-MiniLM-L6-v2`) and ChromaDB to extract exact job requirements based on the resume skills context.
3. **Session Data Isolation**: Clears all previous session variables, uploads, and ChromaDB vector store collections on every new upload.
4. **Candidate Identity Safety**: Candidate details, projects, education, and name are derived **exclusively** from the uploaded Resume PDF. No cache values are retained between upload sessions.
5. **Dynamic Name Extraction**: Extracts the candidate's first and last name from the resume dynamically (defaults to "Candidate" if not found).
6. **Multi-Task Career Advisor Agent**: Runs separate modular tools for resume scoring, prioritized skill gap detection, project suggestion, stage-by-stage interview preparation, and timeline planning.
7. **Double Score System**: Displays both a general **Resume Quality Score (out of 100)** and a target **Job Match Score (out of 100)**, with area breakdowns.
8. **Interactive Dashboard**: Visualizes category scores (Structure, Skills, Projects, Experience, Achievements, Clarity) via Recharts BarCharts.
9. **RAG Inspection (Transparency)**: Features a dedicated "How AI Reached This Result" tab displaying the execution log and retrieved Job Description snippets with their relevance scores.
10. **Model Evaluation View**: Embeds a pipeline audit dashboard mapping Jaccard matching coefficients, completeness checks, and scenario test results.
11. **Isolated Demo Mode**: Includes a "Try Demo" feature to load pre-calculated data instantly, completely isolated from custom upload paths.

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Recharts, Lucide React
- **Backend**: Python 3.12, FastAPI, Uvicorn, Pydantic, PyPDF
- **Vector Indexing (RAG)**: ChromaDB, Sentence-Transformers (Fallback to in-memory cosine keyword search for systems without C++ compilation chains)
- **Generative AI**: Google Gemini 1.5 Flash API (official `google-generativeai` SDK)

---

## 📁 Directory Structure

```
Language Translation Tool/ (Workspace Root)
├── backend/
│   ├── agents/
│   │   └── advisor_agent.py      # Multi-task AI Agent orchestrator
│   ├── prompts/
│   │   └── prompts.py            # Isolated prompts for agent tasks
│   ├── rag/
│   │   └── rag_service.py        # PDF extraction, chunking, and ChromaDB
│   ├── services/
│   │   └── evaluator.py          # Evaluation metrics framework
│   ├── utils/
│   │   └── demo_data.py          # Pre-baked resumes and demo outputs
│   ├── uploads/                  # Temp storage for PDF processing
│   ├── .env                      # API keys storage (Git ignored)
│   ├── .env.example              # Sample environment configuration
│   ├── requirements.txt          # Backend package dependencies
│   └── main.py                   # FastAPI REST controllers
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx      # Match metrics, Recharts charts
│   │   │   ├── UploadSection.jsx  # Drag-and-drop file uploaders & progress
│   │   │   ├── SkillsAnalysis.jsx # Matched, partial, and missing gaps
│   │   │   ├── InterviewPrep.jsx  # 5-stage accordion prep stepper
│   │   │   ├── LearningPlan.jsx   # 3-month timeline progress board
│   │   │   ├── RagInsights.jsx    # Transparency trace logs & snippets
│   │   │   └── EvaluationView.jsx # Pipeline metrics audit dashboard
│   │   ├── App.jsx                # Global navigation and state management
│   │   ├── index.css              # Glassmorphic custom CSS styles
│   │   └── main.jsx               # React entry point
│   ├── package.json               # Node packages and Vite settings
│   ├── vite.config.js             # Vite building and proxy options
│   └── index.html                 # HTML shell
│
├── .gitignore                     # Git ignore guidelines
├── README.md                      # System documentation (This file)
└── REPORT.md                      # Academic project report outline
```

---

## 🚀 Installation & Local Execution

### 1. Prerequisites
- **Node.js**: Version 18+ (tested on `v24.11.0`)
- **Python**: Version 3.10+ (tested on `3.12.10`)
- **Google Gemini API Key**: Obtain a key from Google AI Studio.

---

### 2. Backend Setup
1. Open a terminal and navigate to the `backend` directory.
2. Create and configure your `.env` file:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your **GEMINI_API_KEY**:
   ```env
   GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   *Note: If ChromaDB fails to build on your Windows machine, the system will automatically fall back to an in-memory cosine keyword similarity store for local evaluations.*
4. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   The backend API will start on `http://127.0.0.1:8000`. You can view the Swagger docs at `http://127.0.0.1:8000/docs`.

---

### 3. Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory.
2. Install Node packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The application UI will run at `http://localhost:5173`. Open this URL in your web browser.

---

## 💡 Demo Instructions

### Option A: Uploading Custom Files
1. Save your resume as a PDF file.
2. Find a job posting online (e.g. on LinkedIn) and print or download its description as a PDF.
3. Open `http://localhost:5173` in your browser.
4. Drag and drop the Resume PDF in the left box, and the Job Description PDF in the right box.
5. Click **"🚀 Analyze Resume"**. The loader will animate through the text extraction, RAG indexing, and agent stages.
6. Explore the generated tabs: **Dashboard**, **Resume Analysis**, **Skill Gaps**, **Roadmap**, and **Interview Prep**.
7. Test with two different resumes (Resume A then Resume B) to verify that information resets instantly and matches the correct candidate names.

### Option B: Classroom Demo Mode (No files/keys required)
1. Open the page at `http://localhost:5173`.
2. Click **"Try Demo Mode (Instant Data Load)"** at the bottom of the upload frame.
3. This instantly loads our high-quality pre-baked analysis scenario representing junior developer Jane Doe's resume vs a junior software engineer job description, letting you present the interface immediately during a 3-5 minute demo presentation.
