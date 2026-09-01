# backend/main.py

import os
import shutil
import logging
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Explicitly load .env from backend directory with override
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_FILE = os.path.join(BACKEND_DIR, ".env")
if os.path.exists(ENV_FILE):
    load_dotenv(dotenv_path=ENV_FILE, override=True)
else:
    load_dotenv(override=True)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize RAG and Agent services
from backend.rag.rag_service import RAGService
from backend.agents.advisor_agent import CareerAdvisorAgent
from backend.services.evaluator import evaluate_pipeline
from backend.utils.demo_data import get_demo_analysis

app = FastAPI(title="AI Resume & Career Advisor API", version="1.0.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize global stateless services
try:
    rag_service = RAGService()
    agent = CareerAdvisorAgent()
except Exception as e:
    logger.critical(f"Critical services failed to initialize: {e}")
    class MockService:
        def reset(self): pass
        def extract_text_from_pdf(self, path): return "Mock PDF text content."
        def index_job_description(self, text): return True
        def retrieve_relevant_requirements(self, q, l=4): return [{"text": "Mock requirement chunk.", "score": 1.0}]
    rag_service = MockService()
    class MockAgent:
        provider = "mock"
        is_active = False
        def run_full_analysis(self, r, j, c): return {}
    agent = MockAgent()

# Directory to save uploaded files temporarily
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

class AnalyzeRequest(BaseModel):
    resume_text: str
    jd_text: str

@app.get("/")
def read_root():
    return {"message": "AI Resume & Career Advisor API is running successfully."}

@app.get("/api/status")
def get_status():
    """Returns AI engine status and provider info without exposing secret keys."""
    # Reload config to reflect latest .env changes
    if hasattr(agent, "reload_configuration"):
        agent.reload_configuration()
    return {
        "status": "online",
        "provider": agent.provider,
        "is_active": agent.is_active,
        "model": getattr(agent, "model_name", "gemini-1.5-flash" if agent.provider == "gemini" else None)
    }

@app.post("/api/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """Uploads a resume PDF, extracts text, cleans it, and returns the raw text."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    file_path = os.path.join(UPLOAD_DIR, f"resume_{file.filename}")
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Extract and clean text
        extracted_text = rag_service.extract_text_from_pdf(file_path)
        
        if not extracted_text or len(extracted_text.strip()) < 50:
            raise HTTPException(
                status_code=400, 
                detail="Could not extract sufficient text from the PDF. Ensure the file is not scanned, password-protected, or empty."
            )
            
        return {
            "filename": file.filename,
            "file_size_kb": round(os.path.getsize(file_path) / 1024, 1),
            "extracted_text": extracted_text
        }
    except Exception as e:
        logger.error(f"Error processing resume upload: {e}")
        raise HTTPException(status_code=500, detail=f"Error reading resume PDF: {str(e)}")
    finally:
        # Cleanup uploaded file
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass

@app.post("/api/upload-jd")
async def upload_jd(file: UploadFile = File(...)):
    """Uploads a job description PDF, extracts text, chunks it, and indexes in ChromaDB RAG store."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    file_path = os.path.join(UPLOAD_DIR, f"jd_{file.filename}")
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Extract and clean text
        extracted_text = rag_service.extract_text_from_pdf(file_path)
        
        if not extracted_text or len(extracted_text.strip()) < 50:
            raise HTTPException(
                status_code=400, 
                detail="Could not extract sufficient text from the job description PDF. Ensure the file is not a scanned image."
            )

        # Index the text chunks in ChromaDB / Fallback
        # Note: Indexing automatically calls RAGService.reset() to purge previous sessions
        indexed = rag_service.index_job_description(extracted_text)
        if not indexed:
            raise HTTPException(status_code=500, detail="Failed to parse and index the job description requirements.")
            
        return {
            "filename": file.filename,
            "file_size_kb": round(os.path.getsize(file_path) / 1024, 1),
            "extracted_text": extracted_text
        }
    except Exception as e:
        logger.error(f"Error processing JD upload: {e}")
        raise HTTPException(status_code=500, detail=f"Error reading job description PDF: {str(e)}")
    finally:
        # Cleanup uploaded file
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass

@app.post("/api/analyze")
async def analyze_documents(request: AnalyzeRequest):
    """
    RAG-powered analysis endpoint.
    Retrieves job requirements relevant to the candidate's resume context,
    then executes the Career Advisor Agent workflow to analyze matches.
    """
    if not request.resume_text or not request.jd_text:
        raise HTTPException(status_code=400, detail="Both resume text and job description text are required.")

    # Re-verify agent active status
    if hasattr(agent, "reload_configuration"):
        agent.reload_configuration()

    if not agent.is_active:
         raise HTTPException(
             status_code=400,
             detail="Neither GROQ_API_KEY nor GEMINI_API_KEY is configured in backend/.env. "
                    "Please get a free Groq API key at https://console.groq.com/keys and paste it in backend/.env to analyze custom resumes."
         )

    try:
        # Query RAG system based on resume context keywords
        search_query = request.resume_text[:600]
        retrieved_chunks = rag_service.retrieve_relevant_requirements(search_query, limit=5)
        
        # Run the Multi-task Career Advisor Agent
        analysis_report = agent.run_full_analysis(
            resume_text=request.resume_text,
            jd_text=request.jd_text,
            jd_context_list=retrieved_chunks
        )
        
        # Embed retrieved JD chunks inside response for RAG transparency inspection
        analysis_report["rag_insights"] = retrieved_chunks
        
        return analysis_report
        
    except ValueError as val_err:
        logger.warning(f"Validation error in analysis: {val_err}")
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        logger.error(f"Analysis pipeline crashed: {e}")
        raise HTTPException(status_code=500, detail=f"Internal agent workflow error: {str(e)}")

@app.post("/api/demo-analyze")
async def demo_analyze():
    """Returns the isolated pre-calculated Jane Doe demo analysis payload."""
    import asyncio
    await asyncio.sleep(1.0)
    
    demo_report = get_demo_analysis()
    # Add mockup RAG insights
    demo_report["rag_insights"] = [
        {
            "text": "Core Responsibilities include: Write clean, maintainable, and well-tested code across the frontend and backend. Build responsive UI components using React, Tailwind CSS, and TypeScript. Work closely using Git version control and participate in agile sprints.",
            "score": 0.92
        },
        {
            "text": "Required Technical Skills: Strong programming experience in Python or JavaScript/TypeScript. Experience building web applications using React. Solid understanding of relational databases, specifically PostgreSQL.",
            "score": 0.88
        },
        {
            "text": "Preferred Skills & Experience: Knowledge of containerization tools (Docker). Exposure to cloud computing services (AWS, Google Cloud). Experience with FastAPI (Python) or Express (Node.js).",
            "score": 0.81
        }
    ]
    return demo_report

@app.get("/api/evaluation")
async def get_evaluation():
    """Runs pipeline metrics evaluation checks."""
    report = evaluate_pipeline([])
    return report

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
