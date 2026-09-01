// frontend/src/components/Dashboard.jsx

import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { CheckCircle2, AlertTriangle, Lightbulb, Target, ArrowRight, Sparkles } from "lucide-react";

export default function Dashboard({ data, isDemo, onNavigate }) {
  const candidateName = data.candidate_name || "Candidate";
  const resumeScore = data.resume_score || 0;
  const matchScore = data.job_match_score || 0;
  const categoryScores = data.category_scores || {
    structure: 70,
    skills: 70,
    projects: 70,
    experience: 70,
    achievements: 70,
    clarity: 70
  };

  // Convert category scores for Recharts BarChart
  const barData = Object.keys(categoryScores).map((key) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    Score: categoryScores[key]
  }));

  // Define custom colors for the bar elements
  const barColors = ["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"];

  // Match status badge
  let matchStatus = "Moderate Match";
  let statusColor = "text-yellow-400";
  let statusBg = "bg-yellow-500/10 border-yellow-500/20";
  
  if (matchScore >= 80) {
    matchStatus = "Strong Match";
    statusColor = "text-green-400";
    statusBg = "bg-green-500/10 border-green-500/20";
  } else if (matchScore < 50) {
    matchStatus = "Weak Match";
    statusColor = "text-red-400";
    statusBg = "bg-red-500/10 border-red-500/20";
  }

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      {isDemo && (
        <div className="bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 border border-indigo-500/30 p-4 rounded-2xl flex items-center justify-between shadow-xl animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="text-xl">💡</span>
            <div>
              <h4 className="text-sm font-extrabold text-indigo-300 uppercase tracking-wider">Demo Mode Active</h4>
              <p className="text-xs text-slate-300">Displaying sample candidate Jane Doe vs. Junior Software Engineer job requirements.</p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30 tracking-widest uppercase">
            DEMO MODE — Using Sample Resume & Job Description
          </span>
        </div>
      )}

      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-100 flex items-center gap-2">
            Hi, {candidateName} 👋
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Welcome to your AI Career Advisor dashboard. Here is your profile alignment report.
          </p>
        </div>
        <div className={`px-4 py-1.5 rounded-full border font-semibold text-sm ${statusBg} ${statusColor}`}>
          {matchStatus}
        </div>
      </div>

      {/* Score Widgets Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Resume Quality Score */}
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg relative">
          <h3 className="text-slate-400 text-xs font-bold mb-4 tracking-wider uppercase flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Resume Score
          </h3>
          
          <div className="relative flex items-center justify-center w-36 h-36">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="56" className="stroke-slate-800" strokeWidth="8" fill="transparent" />
              <circle
                cx="72"
                cy="72"
                r="56"
                className="stroke-blue-500 transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray="351"
                strokeDashoffset={351 - (351 * resumeScore) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-100">{resumeScore}</span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Resume Quality</span>
            </div>
          </div>
          <span className="text-xs text-slate-400 mt-4 leading-snug">
            Measures structural clarity, achievements, and impact.
          </span>
        </div>

        {/* Job Match Score */}
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg relative">
          <h3 className="text-slate-400 text-xs font-bold mb-4 tracking-wider uppercase flex items-center gap-1.5">
            <Target className="w-4 h-4 text-purple-400" />
            Job Match Score
          </h3>
          
          <div className="relative flex items-center justify-center w-36 h-36">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="56" className="stroke-slate-800" strokeWidth="8" fill="transparent" />
              <circle
                cx="72"
                cy="72"
                r="56"
                className="stroke-purple-500 transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray="351"
                strokeDashoffset={351 - (351 * matchScore) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-100">{matchScore}</span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Job Matching</span>
            </div>
          </div>
          <span className="text-xs text-slate-400 mt-4 leading-snug">
            Measures alignment against job description requirements.
          </span>
        </div>

        {/* Recharts Bar Chart Breakdown */}
        <div className="glass-card rounded-2xl p-5 lg:col-span-1 shadow-lg flex flex-col">
          <h3 className="text-slate-400 text-xs font-bold mb-3 tracking-wider uppercase">
            Resume Area Audit
          </h3>
          <div className="flex-1 min-h-[160px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData} margin={{ left: -25, right: 10, top: 10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#475569" fontSize={8} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#475569" fontSize={8} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px" }}
                  labelStyle={{ color: "#f1f5f9", fontSize: "10px" }}
                  itemStyle={{ color: "#38bdf8", fontSize: "10px" }}
                />
                <Bar dataKey="Score" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Summary Box */}
      <div className="glass-card rounded-2xl p-6 shadow-md border-l-4 border-blue-500">
        <h3 className="text-slate-200 font-semibold mb-2 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-blue-400" />
          AI Resume Summary
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          {data.summary || "No summary text generated."}
        </p>
      </div>

      {/* Dashboard Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Strengths */}
        <div className="glass-card rounded-xl p-5 shadow-sm space-y-4">
          <h4 className="text-slate-300 text-sm font-bold flex items-center gap-2 uppercase tracking-wide border-b border-slate-800 pb-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            Key Strengths
          </h4>
          <ul className="space-y-3">
            {data.strengths?.slice(0, 3).map((strength, i) => (
              <li key={i} className="text-xs text-slate-300 leading-normal flex items-start gap-2">
                <span className="mt-1 text-green-500 font-bold">•</span>
                <span>{strength}</span>
              </li>
            )) || <li className="text-xs text-slate-500 italic">None analyzed</li>}
          </ul>
          {data.strengths?.length > 3 && (
            <button 
              onClick={() => onNavigate("resume")}
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold transition"
            >
              See all strengths <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Highest Priority Skill Gaps */}
        <div className="glass-card rounded-xl p-5 shadow-sm space-y-4">
          <h4 className="text-slate-300 text-sm font-bold flex items-center gap-2 uppercase tracking-wide border-b border-slate-800 pb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            Top Skill Gaps
          </h4>
          <ul className="space-y-3">
            {data.missing_skills?.slice(0, 2).map((skill, i) => (
              <li key={i} className="text-xs text-slate-300 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-200">{skill.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    skill.priority === "High" ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"
                  }`}>
                    {skill.priority} Priority
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-snug line-clamp-2">
                  {skill.why_matters}
                </p>
              </li>
            )) || <li className="text-xs text-slate-500 italic">No missing skills detected!</li>}
          </ul>
          {data.missing_skills?.length > 2 && (
            <button 
              onClick={() => onNavigate("skills")}
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold transition"
            >
              See all skill gaps <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-xl p-5 shadow-sm space-y-4">
          <h4 className="text-slate-300 text-sm font-bold flex items-center gap-2 uppercase tracking-wide border-b border-slate-800 pb-2">
            <Target className="w-4 h-4 text-blue-400" />
            Next Actions
          </h4>
          <div className="space-y-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col gap-1.5">
              <span className="font-semibold text-slate-200">1. Study Interview Stage 2</span>
              <p className="text-slate-400 text-[10px] leading-snug">
                Review specific Technical Prep questions in your domain.
              </p>
              <button 
                onClick={() => onNavigate("interview")}
                className="text-blue-400 hover:underline text-[10px] self-start mt-0.5 font-medium"
              >
                Go to Prep →
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col gap-1.5">
              <span className="font-semibold text-slate-200">2. Complete Month 1 Roadmap</span>
              <p className="text-slate-400 text-[10px] leading-snug">
                Follow dynamic study steps to bridge your critical tech gaps.
              </p>
              <button 
                onClick={() => onNavigate("roadmap")}
                className="text-blue-400 hover:underline text-[10px] self-start mt-0.5 font-medium"
              >
                Go to Roadmap →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
