# backend/agents/advisor_agent.py

import os
import json
import logging
from typing import Dict, Any, List
from dotenv import load_dotenv

# Explicitly resolve path to backend/.env
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_FILE = os.path.join(BACKEND_DIR, ".env")
if os.path.exists(ENV_FILE):
    load_dotenv(dotenv_path=ENV_FILE, override=True)
else:
    load_dotenv(override=True)

from backend.prompts.prompts import (
    UNIFIED_ANALYSIS_PROMPT,
    RESUME_ANALYSIS_PROMPT,
    SKILL_GAP_PROMPT,
    CAREER_RECOMMENDATION_PROMPT,
    INTERVIEW_PREPARATION_PROMPT,
    LEARNING_PLAN_PROMPT
)

logger = logging.getLogger(__name__)

# Try Groq import
GROQ_AVAILABLE = False
try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    logger.warning("groq package not found.")

# Try Gemini import
GEMINI_AVAILABLE = False
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    logger.warning("google-generativeai package not found.")

PREFERRED_GROQ_MODELS = [
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-120b",
    "qwen/qwen3.6-27b",
    "groq/compound",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant"
]


class CareerAdvisorAgent:
    def __init__(self):
        self.reload_configuration()

    def reload_configuration(self):
        """Reloads .env variables and dynamically initializes active AI provider."""
        if os.path.exists(ENV_FILE):
            load_dotenv(dotenv_path=ENV_FILE, override=True)

        self.groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.provider = None  # "groq" or "gemini"
        self.is_active = False
        self.model_name = ""
        
        # Check Groq first (Preferred & Free API)
        if (
            GROQ_AVAILABLE and 
            self.groq_api_key and 
            self.groq_api_key.startswith("gsk_") and 
            not self.groq_api_key.startswith("gsk_your_actual")
        ):
            try:
                self.groq_client = Groq(api_key=self.groq_api_key)
                
                # Dynamically discover available models
                try:
                    remote_models = {m.id for m in self.groq_client.models.list().data}
                    selected = next((p for p in PREFERRED_GROQ_MODELS if p in remote_models), None)
                    if not selected and remote_models:
                        text_models = [m for m in remote_models if not m.startswith("whisper") and not m.startswith("meta-llama/llama-prompt-guard")]
                        selected = text_models[0] if text_models else list(remote_models)[0]
                    self.model_name = selected or "qwen/qwen3.8-27b"
                except Exception:
                    self.model_name = "qwen/qwen3.8-27b"

                self.provider = "groq"
                self.is_active = True
                logger.info(f"Groq AI API initialized successfully with model {self.model_name}.")
            except Exception as e:
                logger.error(f"Error configuring Groq API: {e}")

        # Fallback to Gemini if Groq not configured
        if not self.is_active and GEMINI_AVAILABLE and self.gemini_api_key:
            if (
                self.gemini_api_key != "YOUR_GEMINI_API_KEY_HERE" and 
                not self.gemini_api_key.startswith("AIzaSyYour")
            ):
                try:
                    genai.configure(api_key=self.gemini_api_key)
                    self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
                    self.provider = "gemini"
                    self.model_name = "gemini-1.5-flash"
                    self.is_active = True
                    logger.info("Gemini AI API initialized successfully with gemini-1.5-flash.")
                except Exception as e:
                    logger.error(f"Error configuring Gemini API: {e}")

        if not self.is_active:
            logger.warning("Neither GROQ_API_KEY nor GEMINI_API_KEY is configured with a valid key. Agent is in standby mode.")

    def _call_llm_json(self, prompt: str) -> Dict[str, Any]:
        """Calls the active LLM (Groq or Gemini) and expects a structured JSON response."""
        if not self.is_active:
            self.reload_configuration()

        if not self.is_active:
            raise ValueError(
                "Neither GROQ_API_KEY nor GEMINI_API_KEY is configured in backend/.env. "
                "Please configure a free Groq API Key (get one free at https://console.groq.com/keys) to analyze custom resumes."
            )
            
        try:
            text = ""
            if self.provider == "groq":
                response = self.groq_client.chat.completions.create(
                    model=self.model_name,
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are an expert AI Career Advisor Agent. You MUST return strictly valid JSON matching "
                                "the exact schema requested. Do not include markdown code block formatting or any text "
                                "outside the JSON object."
                            )
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.3,
                    max_tokens=4096
                )
                text = response.choices[0].message.content.strip()
            elif self.provider == "gemini":
                response = self.gemini_model.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json"}
                )
                text = response.text.strip()
            
            # Clean markdown code wrapping if present
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            
            return json.loads(text)
        except Exception as e:
            logger.error(f"LLM API call or JSON parsing failed ({self.provider}): {e}")
            raise RuntimeError(f"Error parsing structured response from {self.provider}: {str(e)}")

    def run_full_analysis(self, resume_text: str, jd_text: str, jd_context_list: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Orchestrates the entire agent analysis flow and compiles a single unified structured dashboard state."""
        if not self.is_active:
            self.reload_configuration()

        if not self.is_active:
            raise ValueError(
                "Neither GROQ_API_KEY nor GEMINI_API_KEY is configured in backend/.env. "
                "Please configure a free Groq API Key (get one free at https://console.groq.com/keys) to analyze custom resumes."
            )

        resume_text = resume_text.strip()
        jd_text = jd_text.strip()
        jd_context_str = "\n---\n".join([chunk["text"] for chunk in jd_context_list])
        
        logger.info(f"Executing Agent Workflow using provider '{self.provider}' model '{self.model_name}'...")
        
        # Try fast single-pass unified prompt
        try:
            unified_prompt = UNIFIED_ANALYSIS_PROMPT.format(resume_text=resume_text, jd_context=jd_context_str)
            result = self._call_llm_json(unified_prompt)
            
            candidate_name = result.get("candidate_name", "").strip() if isinstance(result, dict) else "Candidate"
            if not candidate_name or candidate_name.lower() in ["", "none", "unknown", "n/a", "candidate"]:
                candidate_name = "Candidate"

            unified_report = {
                "candidate_name": candidate_name,
                "resume_score": result.get("resume_score", 75),
                "job_match_score": result.get("job_match_score", 70),
                "category_scores": result.get("category_scores", {
                    "structure": 75, "skills": 70, "projects": 65, "experience": 60, "achievements": 55, "clarity": 80
                }),
                "summary": result.get("summary", ""),
                "matched_skills": result.get("matched_skills", []),
                "skills": result.get("skills", []),
                "technical_skills": result.get("technical_skills", []),
                "soft_skills": result.get("soft_skills", []),
                "education": result.get("education", []),
                "projects": result.get("projects", []),
                "experience": result.get("experience", []),
                "certifications": result.get("certifications", []),
                "strengths": result.get("strengths", []),
                "weaknesses": result.get("weaknesses", []),
                "improvements": result.get("improvements", []),
                "missing_skills": result.get("missing_skills", []),
                "partial_match_skills": result.get("partial_match_skills", []),
                "career_roles": result.get("career_roles", ["Software Engineer"]),
                "recommended_projects": result.get("recommended_projects", []),
                "general_career_advice": result.get("general_career_advice", ""),
                "interview_topics": result.get("interview_topics", {}),
                "three_month_plan": result.get("three_month_plan", {}),
                "ai_provider": self.provider,
                "ai_model": self.model_name
            }
            logger.info(f"Fast unified analysis completed successfully for {candidate_name} via {self.provider}.")
            return unified_report
            
        except Exception as e:
            logger.warning(f"Unified analysis failed ({e}), falling back to modular multi-step pipeline...")
            
            # Step 1: Base Analysis
            analysis = self._call_llm_json(RESUME_ANALYSIS_PROMPT.format(resume_text=resume_text, jd_context=jd_context_str))
            
            # Step 2: Skill Gaps
            gaps = self._call_llm_json(SKILL_GAP_PROMPT.format(resume_text=resume_text, jd_context=jd_context_str))
            missing_names = [item["name"] for item in gaps.get("missing_skills", []) if isinstance(item, dict) and "name" in item]
            partial_names = [item["name"] for item in gaps.get("partial_match_skills", []) if isinstance(item, dict) and "name" in item]
            gaps_summary = f"Missing: {', '.join(missing_names)}. Partially Matched: {', '.join(partial_names)}"
            
            # Step 3: Career Recommendations
            career = self._call_llm_json(CAREER_RECOMMENDATION_PROMPT.format(resume_text=resume_text, jd_context=jd_context_str, skill_gaps=gaps_summary))
            
            # Step 4: Interview Prep
            interview = self._call_llm_json(INTERVIEW_PREPARATION_PROMPT.format(resume_text=resume_text, jd_context=jd_context_str))
            
            # Step 5: Learning Plan
            plan = self._call_llm_json(LEARNING_PLAN_PROMPT.format(resume_text=resume_text, jd_context=jd_context_str, skill_gaps=gaps_summary))
            
            candidate_name = analysis.get("candidate_name", "").strip() if isinstance(analysis, dict) else "Candidate"
            if not candidate_name or candidate_name.lower() in ["", "none", "unknown", "n/a", "candidate"]:
                candidate_name = "Candidate"
                
            return {
                "candidate_name": candidate_name,
                "resume_score": analysis.get("resume_score", 70),
                "job_match_score": analysis.get("job_match_score", 65),
                "category_scores": analysis.get("category_scores", {
                    "structure": 75, "skills": 70, "projects": 65, "experience": 60, "achievements": 55, "clarity": 80
                }),
                "summary": analysis.get("summary", ""),
                "matched_skills": analysis.get("matched_skills", []),
                "skills": analysis.get("skills", []),
                "technical_skills": analysis.get("technical_skills", []),
                "soft_skills": analysis.get("soft_skills", []),
                "education": analysis.get("education", []),
                "projects": analysis.get("projects", []),
                "experience": analysis.get("experience", []),
                "certifications": analysis.get("certifications", []),
                "strengths": analysis.get("strengths", []),
                "weaknesses": analysis.get("weaknesses", []),
                "improvements": analysis.get("improvements", []),
                "missing_skills": gaps.get("missing_skills", []),
                "partial_match_skills": gaps.get("partial_match_skills", []),
                "career_roles": career.get("career_roles", ["Software Engineer"]),
                "recommended_projects": career.get("recommended_projects", []),
                "general_career_advice": career.get("general_career_advice", ""),
                "interview_topics": interview,
                "three_month_plan": plan,
                "ai_provider": self.provider,
                "ai_model": self.model_name
            }
