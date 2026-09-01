// frontend/src/components/InterviewPrep.jsx

import React, { useState } from "react";
import { BookOpen, Code2, Users, FileText, Video, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";

export default function InterviewPrep({ data }) {
  const [activeStage, setActiveStage] = useState(0);
  const interviewData = data.interview_topics || {};

  const stages = [
    {
      id: 0,
      key: "stage_1",
      title: "Stage 1 — Resume & Fundamentals",
      icon: FileText,
      color: "border-blue-500 text-blue-400 bg-blue-500/10",
      description: "Review resume claims, projects overview, and core CS/industry concepts."
    },
    {
      id: 1,
      key: "stage_2",
      title: "Stage 2 — Technical Preparation",
      icon: Code2,
      color: "border-purple-500 text-purple-400 bg-purple-500/10",
      description: "Dive deep into coding questions, data structures, algorithms, and system design."
    },
    {
      id: 2,
      key: "stage_3",
      title: "Stage 3 — Project Discussion",
      icon: BookOpen,
      color: "border-cyan-500 text-cyan-400 bg-cyan-500/10",
      description: "Prepare to talk in depth about architecture, trade-offs, and design choices."
    },
    {
      id: 3,
      key: "stage_4",
      title: "Stage 4 — Behavioral Questions",
      icon: Users,
      color: "border-yellow-500 text-yellow-400 bg-yellow-500/10",
      description: "Formulate behavioral stories using the STAR method (Situation, Task, Action, Result)."
    },
    {
      id: 4,
      key: "stage_5",
      title: "Stage 5 — Mock Interview",
      icon: Video,
      color: "border-pink-500 text-pink-400 bg-pink-500/10",
      description: "Perform simulated practice under pressure using strict timing guidelines."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="border-b border-slate-800 pb-5">
        <h2 className="text-2xl font-bold text-slate-100">Interview Preparation Roadmap</h2>
        <p className="text-slate-400 text-sm mt-0.5">
          Follow a structured 5-stage plan to prepare for technical, behavioral, and architectural rounds.
        </p>
      </div>

      {/* Stepper Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Stepper Navigation */}
        <div className="space-y-3 lg:col-span-1">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const isActive = activeStage === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                  isActive
                    ? "bg-slate-800/80 border-slate-700 shadow-md translate-x-1"
                    : "bg-slate-900/30 border-slate-900/60 hover:bg-slate-800/40 hover:border-slate-800"
                }`}
              >
                <div className={`p-2 rounded-lg border-2 ${stage.color} flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className={`text-sm font-semibold transition ${isActive ? "text-slate-100" : "text-slate-400"}`}>
                    {stage.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                    {stage.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail Panel */}
        <div className="lg:col-span-2">
          {stages.map((stage) => {
            if (activeStage !== stage.id) return null;
            
            const Icon = stage.icon;
            const content = interviewData[stage.key] || {
              topics: ["General review"],
              questions: ["Explain your technical background."],
              practice_areas: ["Prepare standard responses."]
            };

            return (
              <div 
                key={stage.id}
                className="glass-card rounded-2xl p-6 md:p-8 shadow-xl space-y-6 animate-fadeIn"
              >
                {/* Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                  <div className={`p-2.5 rounded-lg border-2 ${stage.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">{stage.title}</h3>
                    <p className="text-xs text-slate-400">Targeted study topics and mock practice guidelines.</p>
                  </div>
                </div>

                {/* Topics to Study */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                    Topics to Focus On
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {content.topics?.map((topic, i) => (
                      <div 
                        key={i} 
                        className="flex items-center gap-2.5 p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs text-slate-200"
                      >
                        <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Practice Questions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                    Sample Practice Questions
                  </h4>
                  <div className="space-y-3">
                    {content.questions?.map((question, i) => (
                      <div 
                        key={i}
                        className="p-4 bg-slate-900/20 rounded-xl border border-slate-800/40 relative flex gap-3 text-xs md:text-sm text-slate-300 leading-relaxed"
                      >
                        <span className="font-bold text-indigo-500 text-base leading-none">Q{i + 1}.</span>
                        <span>{question}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Practice Guidelines */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                    Preparation Strategy & Tips
                  </h4>
                  <div className="p-4 bg-indigo-950/10 border border-indigo-500/10 rounded-xl text-slate-300 text-xs leading-relaxed space-y-2">
                    {content.practice_areas?.map((area, i) => (
                      <p key={i} className="flex gap-2">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{area}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
