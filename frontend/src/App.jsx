// frontend/src/App.jsx

import React, { useState } from "react";
import { 
  LayoutDashboard, FileCheck, ShieldAlert, FileSearch, 
  HelpCircle, UserCheck, CalendarDays, BarChart4, Settings, Menu, X 
} from "lucide-react";

// Components
import UploadSection from "./components/UploadSection";
import Dashboard from "./components/Dashboard";
import SkillsAnalysis from "./components/SkillsAnalysis";
import InterviewPrep from "./components/InterviewPrep";
import LearningPlan from "./components/LearningPlan";
import RagInsights from "./components/RagInsights";
import EvaluationView from "./components/EvaluationView";

export default function App() {
  const [activeTab, setActiveTab] = useState("upload");
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Lift file state to parent level to enable complete session purge
  const [resumeFile, setResumeFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);

  // File analysis workflow
  const handleAnalyze = async (resume, jd, onProgress) => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    setIsDemoMode(false); // Real upload always turns off Demo Mode
    
    try {
      // Step 1: Upload Resume
      onProgress(0);
      const resumeFormData = new FormData();
      resumeFormData.append("file", resume);
      
      const resumeResponse = await fetch("/api/upload-resume", {
        method: "POST",
        body: resumeFormData,
      });
      
      if (!resumeResponse.ok) {
        const errorData = await resumeResponse.json();
        throw new Error(errorData.detail || "Failed to extract text from Resume PDF.");
      }
      
      const resumeResult = await resumeResponse.json();
      const resumeText = resumeResult.extracted_text;
      
      // Step 2: Upload JD & index RAG
      onProgress(2);
      const jdFormData = new FormData();
      jdFormData.append("file", jd);
      
      const jdResponse = await fetch("/api/upload-jd", {
        method: "POST",
        body: jdFormData,
      });
      
      if (!jdResponse.ok) {
        const errorData = await jdResponse.json();
        throw new Error(errorData.detail || "Failed to parse and index Job Description PDF.");
      }
      
      const jdResult = await jdResponse.json();
      const jdText = jdResult.extracted_text;
      
      // Step 3: Run Full Analysis Agent
      onProgress(4);
      const analyzeResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: resumeText,
          jd_text: jdText
        })
      });
      
      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json();
        throw new Error(errorData.detail || "Career Advisor Agent failed to analyze inputs.");
      }
      
      onProgress(5);
      const finalReport = await analyzeResponse.json();
      
      setAnalysisData(finalReport);
      setActiveTab("dashboard");
      
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred during document parsing.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTryDemo = async () => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    setIsDemoMode(true);
    
    // Purge any custom loaded files to prevent mixing
    setResumeFile(null);
    setJdFile(null);
    
    try {
      const response = await fetch("/api/demo-analyze", { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to load pre-calculated demo data.");
      }
      const data = await response.json();
      setAnalysisData(data);
      setActiveTab("dashboard");
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to retrieve demo data.");
      setIsDemoMode(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    // Purge all states completely to prevent data leaks between uploads
    setAnalysisData(null);
    setResumeFile(null);
    setJdFile(null);
    setIsDemoMode(false);
    setErrorMsg(null);
    setActiveTab("upload");
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "resume", label: "Resume Analysis", icon: FileCheck },
    { id: "skills", label: "Skill Gap", icon: ShieldAlert },
    { id: "roadmap", label: "3-Month Roadmap", icon: CalendarDays },
    { id: "interview", label: "Interview Prep", icon: UserCheck },
    { id: "rag", label: "RAG Insights", icon: FileSearch },
    { id: "evaluation", label: "Model Evaluation", icon: BarChart4 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Sidebar Toggle Overlay */}
      {analysisData && activeTab !== "upload" && (
        <div className="md:hidden fixed top-4 left-4 z-50">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 rounded-lg shadow-lg"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      )}

      {/* Sidebar Navigation Panel */}
      {analysisData && activeTab !== "upload" && (
        <aside className={`fixed md:relative inset-y-0 left-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-40 w-64 bg-navy-950 border-r border-slate-800/80 flex flex-col justify-between`}>
          <div className="p-5 space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
              <span className="text-xl">🚀</span>
              <div>
                <h2 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">Career Advisor</h2>
                <p className="text-[10px] text-slate-500 font-semibold">AI RAG & Agent Studio</p>
              </div>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 py-2.5 px-3.5 rounded-lg text-xs md:text-sm font-semibold transition ${
                      isActive 
                        ? "bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border-l-4 border-l-blue-500 text-blue-400 bg-slate-800/20"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/35"
                    }`}
                  >
                    <Icon className="w-4 h-4 md:w-4.5 md:h-4.5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-850">
            <button 
              onClick={resetAnalysis}
              className="w-full py-2 bg-slate-900 border border-slate-800 hover:bg-red-500/10 hover:border-red-500/20 text-slate-400 hover:text-red-400 text-xs font-semibold rounded-lg transition"
            >
              Upload New Resume
            </button>
          </div>
        </aside>
      )}

      {/* Main Panel Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 mt-12 md:mt-0">
        
        {/* Error Boundary Panel */}
        {errorMsg && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/20 text-slate-300 rounded-xl flex items-start gap-3 animate-fadeIn">
            <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1.5 w-full">
              <h4 className="text-sm font-bold text-red-400">Analysis Error Encountered</h4>
              <p className="text-xs leading-normal">{errorMsg}</p>
              <div className="flex gap-4 pt-1">
                <button 
                  onClick={handleTryDemo}
                  className="text-xs text-blue-400 hover:underline font-semibold"
                >
                  Load Simulated Demo instead (No API Key Required)
                </button>
                <button 
                  onClick={() => setErrorMsg(null)}
                  className="text-xs text-slate-400 hover:underline font-semibold"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Pages */}
        {activeTab === "upload" && !analysisData && (
          <UploadSection 
            resumeFile={resumeFile}
            setResumeFile={(file) => {
              setResumeFile(file);
              setIsDemoMode(false); // Reset Demo Mode on file upload
            }}
            jdFile={jdFile}
            setJdFile={(file) => {
              setJdFile(file);
              setIsDemoMode(false); // Reset Demo Mode on file upload
            }}
            onAnalyze={handleAnalyze} 
            onTryDemo={handleTryDemo}
            isAnalyzing={isAnalyzing}
          />
        )}

        {analysisData && (
          <div className="max-w-5xl mx-auto">
            {activeTab === "dashboard" && (
              <Dashboard 
                data={analysisData} 
                isDemo={isDemoMode}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === "resume" && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-5">
                  <h2 className="text-2xl font-bold text-slate-100">Resume Detail & Suitability</h2>
                  <p className="text-slate-400 text-sm mt-0.5">Parsed resume parameters, education, and career experience validation.</p>
                </div>
                
                {/* Score Summary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-card rounded-xl p-6 space-y-3">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Experience presentation</h3>
                    <div className="text-slate-300 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
                      {analysisData.experience && analysisData.experience.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-2">
                          {analysisData.experience.map((exp, i) => (
                            <li key={i}>{exp}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="italic text-slate-500">Not mentioned in resume</p>
                      )}
                    </div>
                  </div>
                  <div className="glass-card rounded-xl p-6 space-y-3">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Education Presentation</h3>
                    <div className="text-slate-300 text-xs md:text-sm leading-relaxed">
                      {analysisData.education && analysisData.education.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-2">
                          {analysisData.education.map((edu, i) => (
                            <li key={i}>{edu}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="italic text-slate-500">Not mentioned in resume</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Projects & Certifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-card rounded-xl p-6 space-y-3">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Projects Detected</h3>
                    <div className="text-slate-300 text-xs md:text-sm leading-relaxed">
                      {analysisData.projects && analysisData.projects.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-2">
                          {analysisData.projects.map((proj, i) => (
                            <li key={i}>{proj}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="italic text-slate-500">Not mentioned in resume</p>
                      )}
                    </div>
                  </div>
                  <div className="glass-card rounded-xl p-6 space-y-3">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Certifications</h3>
                    <div className="text-slate-300 text-xs md:text-sm leading-relaxed">
                      {analysisData.certifications && analysisData.certifications.length > 0 && analysisData.certifications[0].toLowerCase() !== "not mentioned in resume" ? (
                        <ul className="list-disc pl-4 space-y-2">
                          {analysisData.certifications.map((cert, i) => (
                            <li key={i}>{cert}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="italic text-slate-500">Not mentioned in resume</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-card rounded-xl p-6 space-y-4 border-t-2 border-t-green-500">
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Detailed Strengths</h3>
                    <ul className="space-y-2.5 text-xs md:text-sm">
                      {analysisData.strengths?.map((item, i) => (
                        <li key={i} className="flex gap-2 text-slate-300 leading-normal">
                          <span className="text-green-500 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass-card rounded-xl p-6 space-y-4 border-t-2 border-t-red-500/80">
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Resume Weaknesses</h3>
                    <ul className="space-y-2.5 text-xs md:text-sm">
                      {analysisData.weaknesses?.map((item, i) => (
                        <li key={i} className="flex gap-2 text-slate-300 leading-normal">
                          <span className="text-red-400 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Resume Improvement suggestions */}
                <div className="glass-card rounded-xl p-6 space-y-3">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Resume Formatting & Detail Improvements</h3>
                  <ul className="space-y-2.5 text-xs md:text-sm">
                    {analysisData.improvements?.map((item, i) => (
                      <li key={i} className="flex gap-2 text-slate-300 leading-normal">
                        <span className="text-yellow-500 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "skills" && (
              <SkillsAnalysis data={analysisData} />
            )}

            {activeTab === "roadmap" && (
              <LearningPlan data={analysisData} />
            )}

            {activeTab === "interview" && (
              <InterviewPrep data={analysisData} />
            )}

            {activeTab === "rag" && (
              <RagInsights data={analysisData} />
            )}

            {activeTab === "evaluation" && (
              <EvaluationView />
            )}

            {activeTab === "settings" && (
              <div className="space-y-6 max-w-xl">
                <div className="border-b border-slate-800 pb-5">
                  <h2 className="text-2xl font-bold text-slate-100">Application Settings</h2>
                  <p className="text-slate-400 text-sm mt-0.5">Review local API keys and server configuration mappings.</p>
                </div>
                
                <div className="glass-card rounded-xl p-6 space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">AI Provider & API Key</label>
                    <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-slate-300 text-xs font-mono truncate">
                      {isDemoMode ? "SIMULATED / DEMO MODE KEY" : "Groq AI (Free Llama 3.3 70B) or Gemini in backend/.env"}
                    </div>
                    <span className="text-[10px] text-slate-500 block leading-snug">
                      Keys are safely stored in <code className="text-slate-400">backend/.env</code> and never exposed to the client. Calls are proxied securely through FastAPI.
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Backend Endpoint Url</label>
                    <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-slate-300 text-xs font-mono">
                      http://127.0.0.1:8000
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">RAG Mode Status</label>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                      <span>Active (ChromaDB + Local fallback indexes)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
