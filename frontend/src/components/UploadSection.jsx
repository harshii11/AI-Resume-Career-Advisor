// frontend/src/components/UploadSection.jsx

import React, { useState, useEffect, useRef } from "react";
import { FileText, UploadCloud, X, CheckCircle, Play, ArrowRight, AlertTriangle, Sparkles } from "lucide-react";

export default function UploadSection({ 
  resumeFile, 
  setResumeFile, 
  jdFile, 
  setJdFile, 
  onAnalyze, 
  onTryDemo, 
  isAnalyzing 
}) {
  const [dragActive, setDragActive] = useState({ resume: false, jd: false });
  const [loadingStep, setLoadingStep] = useState(0);
  const [apiStatus, setApiStatus] = useState(null);

  const resumeInputRef = useRef(null);
  const jdInputRef = useRef(null);

  useEffect(() => {
    // Check backend AI engine status dynamically
    fetch("/api/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setApiStatus(data);
      })
      .catch(() => {});
  }, []);

  const handleDrag = (e, type, active) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: active }));
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        if (type === "resume") setResumeFile(file);
        else setJdFile(file);
      } else {
        alert("Please upload PDF files only.");
      }
    }
  };

  const handleFileChange = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        if (type === "resume") setResumeFile(file);
        else setJdFile(file);
      } else {
        alert("Please upload PDF files only.");
      }
    }
  };

  const removeFile = (type) => {
    if (type === "resume") {
      setResumeFile(null);
      if (resumeInputRef.current) resumeInputRef.current.value = "";
    } else {
      setJdFile(null);
      if (jdInputRef.current) jdInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile || !jdFile) return;

    onAnalyze(resumeFile, jdFile, (stepIndex) => {
      setLoadingStep(stepIndex);
    });
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = 1;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent mb-4">
          AI Resume & Career Advisor
        </h1>
        <p className="text-xl text-slate-300 font-medium mb-3">
          Turn your resume into a career strategy.
        </p>
        <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
          Analyze your resume against real job requirements, discover skill gaps, prepare for targeted interviews, and obtain a personalized 3-month learning roadmap.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6 text-xs md:text-sm text-slate-400">
          <span className="flex items-center gap-1 text-blue-400">✓ AI Resume Analysis</span>
          <span className="flex items-center gap-1 text-blue-400">✓ RAG-Powered Job Matching</span>
          <span className="flex items-center gap-1 text-blue-400">✓ Skill Gap Detection</span>
          <span className="flex items-center gap-1 text-blue-400">✓ Interview Preparation</span>
          <span className="flex items-center gap-1 text-blue-400">✓ 3-Month Learning Roadmap</span>
        </div>
      </div>

      {/* Main Upload Frame */}
      <div className="glass-card rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Loading Overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-navy-900/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-slate-700/50"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-purple-500 animate-spin"></div>
            </div>
            <h3 className="text-xl font-semibold text-slate-100 mb-2">Analyzing Documents</h3>
            <p className="text-sm text-blue-400 font-medium h-6 animate-pulse">
              {loadingStep === 0 && "Extracting text from PDF files..."}
              {loadingStep === 1 && "Cleaning text & chunking requirements..."}
              {loadingStep === 2 && "Indexing chunks into vector search store..."}
              {loadingStep === 3 && "Performing RAG similarity retrieval..."}
              {loadingStep === 4 && "Querying Groq AI LLM model..."}
              {loadingStep === 5 && "Synthesizing career advisor analysis..."}
            </p>
            <div className="w-64 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${((loadingStep + 1) / 6) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Upload Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Resume Upload Card */}
          <div 
            onDragOver={(e) => handleDrag(e, "resume", true)}
            onDragLeave={(e) => handleDrag(e, "resume", false)}
            onDrop={(e) => handleDrop(e, "resume")}
            className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all relative ${
              dragActive.resume ? "border-blue-400 bg-blue-500/5" : "border-slate-700 hover:border-slate-600 bg-slate-900/40"
            }`}
          >
            <input 
              type="file" 
              ref={resumeInputRef}
              onChange={(e) => handleFileChange(e, "resume")}
              accept=".pdf"
              className="hidden"
            />
            {resumeFile ? (
              <div className="flex flex-col items-center text-center w-full py-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-200 max-w-full truncate px-4">
                  {resumeFile.name}
                </h4>
                <p className="text-xs text-slate-400 mt-1">{formatSize(resumeFile.size)}</p>
                <div className="flex items-center gap-1 text-green-400 text-xs mt-3 bg-green-500/10 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" /> PDF Loaded
                </div>
                <button 
                  onClick={() => removeFile("resume")}
                  className="absolute top-3 right-3 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center py-6">
                <UploadCloud className="w-10 h-10 text-slate-500 mb-3" />
                <h4 className="text-sm font-semibold text-slate-200">📄 Upload Resume</h4>
                <p className="text-xs text-slate-400 mt-1">PDF format only</p>
                <button 
                  type="button"
                  onClick={() => resumeInputRef.current?.click()}
                  className="mt-4 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 border border-slate-700 transition"
                >
                  Browse Files
                </button>
                <p className="text-[10px] text-slate-500 mt-4">Drag and drop file here</p>
              </div>
            )}
          </div>

          {/* Job Description Upload Card */}
          <div 
            onDragOver={(e) => handleDrag(e, "jd", true)}
            onDragLeave={(e) => handleDrag(e, "jd", false)}
            onDrop={(e) => handleDrop(e, "jd")}
            className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all relative ${
              dragActive.jd ? "border-purple-400 bg-purple-500/5" : "border-slate-700 hover:border-slate-600 bg-slate-900/40"
            }`}
          >
            <input 
              type="file" 
              ref={jdInputRef}
              onChange={(e) => handleFileChange(e, "jd")}
              accept=".pdf"
              className="hidden"
            />
            {jdFile ? (
              <div className="flex flex-col items-center text-center w-full py-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400 mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-200 max-w-full truncate px-4">
                  {jdFile.name}
                </h4>
                <p className="text-xs text-slate-400 mt-1">{formatSize(jdFile.size)}</p>
                <div className="flex items-center gap-1 text-green-400 text-xs mt-3 bg-green-500/10 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" /> PDF Loaded
                </div>
                <button 
                  onClick={() => removeFile("jd")}
                  className="absolute top-3 right-3 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center py-6">
                <UploadCloud className="w-10 h-10 text-slate-500 mb-3" />
                <h4 className="text-sm font-semibold text-slate-200">💼 Upload Job Description</h4>
                <p className="text-xs text-slate-400 mt-1">PDF format only</p>
                <button 
                  type="button"
                  onClick={() => jdInputRef.current?.click()}
                  className="mt-4 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 border border-slate-700 transition"
                >
                  Browse Files
                </button>
                <p className="text-[10px] text-slate-500 mt-4">Drag and drop file here</p>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic API Status Banner */}
        {apiStatus?.is_active ? (
          <div className="p-3.5 bg-green-500/10 border border-green-500/20 text-green-300 text-xs rounded-xl flex gap-2.5 items-center mb-6">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-400" />
            <div>
              <strong className="font-semibold text-green-200">AI Engine Ready:</strong>{" "}
              Connected to <span className="font-bold text-green-300 uppercase">{apiStatus.provider}</span> ({apiStatus.model || "llama-3.3-70b-versatile"}). Custom PDF analysis is active!
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs rounded-xl flex gap-2.5 items-start mb-6">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-blue-400" />
            <div>
              <strong className="font-semibold block mb-0.5 text-blue-300">Custom Upload Notice:</strong>
              Analyzing custom PDF files uses Groq AI (<a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="underline font-bold text-blue-400 hover:text-blue-300">Free Groq API Key</a>) or Google Gemini. Configure <code className="bg-slate-800 px-1 py-0.5 rounded text-blue-200">GROQ_API_KEY</code> in <code className="bg-slate-800 px-1 py-0.5 rounded text-blue-200">backend/.env</code>. If you haven't added a key yet, click "Try Demo Mode" below to explore all features instantly.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-6 border-t border-slate-800/80 pt-6">
          {/* Demo Button */}
          <button 
            type="button"
            onClick={onTryDemo}
            className="flex items-center gap-2 text-slate-400 hover:text-blue-400 text-xs md:text-sm font-semibold transition py-2.5 px-4 border border-slate-800 hover:border-slate-700 bg-slate-950/20 rounded-xl hover:shadow-lg"
          >
            <Play className="w-4 h-4 fill-current text-blue-400" />
            Try Demo Mode (Instant Data Load)
          </button>

          {/* Analyze Button */}
          <button 
            onClick={handleSubmit}
            disabled={!resumeFile || !jdFile}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold transition-all ${
              resumeFile && jdFile 
                ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02]"
                : "bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed"
            }`}
          >
            <span>🚀 Analyze Resume</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
