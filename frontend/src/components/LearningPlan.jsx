// frontend/src/components/LearningPlan.jsx

import React from "react";
import { Calendar, Target, BookOpen, CheckSquare, Award, Hammer } from "lucide-react";

export default function LearningPlan({ data }) {
  const plan = data.three_month_plan || {};

  const months = [
    {
      id: 1,
      key: "month_1",
      title: "Month 1 — Foundation & Skill Gaps",
      badge: "Focus: Skill Acquisition",
      color: "bg-blue-500",
      textColor: "text-blue-400"
    },
    {
      id: 2,
      key: "month_2",
      title: "Month 2 — Projects & Practical Application",
      badge: "Focus: Portfolio Building",
      color: "bg-indigo-500",
      textColor: "text-indigo-400"
    },
    {
      id: 3,
      key: "month_3",
      title: "Month 3 — Interview Prep & Job Search",
      badge: "Focus: Career Readiness",
      color: "bg-purple-500",
      textColor: "text-purple-400"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="border-b border-slate-800 pb-5">
        <h2 className="text-2xl font-bold text-slate-100">Personalized 3-Month Roadmap</h2>
        <p className="text-slate-400 text-sm mt-0.5">
          Follow a dynamic month-by-month study and execution plan tailored to your profile gaps.
        </p>
      </div>

      {/* Recommended Projects Box */}
      {data.recommended_projects && data.recommended_projects.length > 0 && (
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Hammer className="w-5 h-5 text-indigo-400" />
            Recommended Hands-on Projects
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.recommended_projects.map((project, idx) => (
              <div key={idx} className="glass-card rounded-xl p-5 shadow-md flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-100 mb-2">{project.title}</h4>
                  <p className="text-slate-400 text-[11px] leading-snug mb-3">{project.description}</p>
                </div>
                <div className="space-y-2 mt-2 pt-3 border-t border-slate-800/80">
                  <div className="flex flex-wrap gap-1">
                    {project.tech_stack?.map((tech, i) => (
                      <span key={i} className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    <strong className="text-slate-400 font-medium">Outcome:</strong> {project.learning_outcome}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Month Timeline Section */}
      <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800/80">
        {months.map((m) => {
          const content = plan[m.key] || {
            goals: ["Prerequisites review"],
            topics: ["Core concepts"],
            tasks: ["Read literature"],
            practice_project: "Test run sample",
            expected_outcome: "Competency"
          };

          return (
            <div key={m.id} className="relative pl-10 md:pl-12 group animate-fadeIn">
              {/* Chronological Circle Node */}
              <div className={`absolute left-2.5 top-1.5 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-navy-900 ${m.color} z-10 shadow-lg`}></div>
              
              {/* Monthly Block */}
              <div className="glass-card rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
                
                {/* Title */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Calendar className={`w-5 h-5 ${m.textColor}`} />
                    <h3 className="text-base md:text-lg font-bold text-slate-100">{m.title}</h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full border border-slate-700">
                    {m.badge}
                  </span>
                </div>

                {/* Subgrid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column: Goals & Topics */}
                  <div className="space-y-5">
                    {/* Goals */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <Target className="w-4 h-4 text-blue-400" />
                        Monthly Goals
                      </h4>
                      <ul className="space-y-2">
                        {content.goals?.map((goal, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${m.color}`}></span>
                            <span>{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Topics */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                        Key Topics
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {content.topics?.map((topic, i) => (
                          <span 
                            key={i} 
                            className="text-[11px] bg-slate-900/80 border border-slate-850 text-slate-300 px-2 py-1 rounded-lg"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Tasks Checklist */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <CheckSquare className="w-4 h-4 text-green-400" />
                      Actions checklist
                    </h4>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {content.tasks?.map((task, i) => (
                        <div 
                          key={i}
                          className="flex items-start gap-2.5 p-2.5 bg-slate-900/40 hover:bg-slate-900/60 border border-slate-850 hover:border-slate-800 rounded-lg text-xs text-slate-300 transition"
                        >
                          <input 
                            type="checkbox" 
                            className="mt-0.5 rounded border-slate-800 text-blue-600 focus:ring-0 bg-slate-950 flex-shrink-0"
                          />
                          <span>{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Footnotes Block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80 text-xs">
                  {/* Suggested practice project */}
                  <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-800/55">
                    <span className="font-semibold text-slate-400 block mb-1">Target Project / Practical Practice:</span>
                    <span className="text-slate-300 leading-normal">{content.practice_project}</span>
                  </div>
                  {/* Expected Outcome */}
                  <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-800/55 flex flex-col justify-between">
                    <div>
                      <span className="font-semibold text-slate-400 flex items-center gap-1 mb-1">
                        <Award className="w-4 h-4 text-yellow-500" />
                        Expected Milestone Outcome:
                      </span>
                      <span className="text-slate-300 leading-normal">{content.expected_outcome}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
