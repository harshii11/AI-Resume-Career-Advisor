// frontend/src/components/SkillsAnalysis.jsx

import React from "react";
import { Check, AlertTriangle, AlertCircle, ArrowUpRight, CheckSquare, Layers, Award } from "lucide-react";

export default function SkillsAnalysis({ data }) {
  const matched = data.matched_skills || [];
  const missing = data.missing_skills || [];
  const partial = data.partial_match_skills || [];
  const technical = data.technical_skills || [];
  const soft = data.soft_skills || [];

  return (
    <div className="space-y-8">
      {/* Header Panel */}
      <div className="border-b border-slate-800 pb-5">
        <h2 className="text-2xl font-bold text-slate-100">Skills Detected & Gap Analysis</h2>
        <p className="text-slate-400 text-sm mt-0.5">
          Review technical and soft skills parsed from your resume compared against job description requirements.
        </p>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Technical Skills Detected */}
        <div className="glass-card rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2 border-b border-slate-850 pb-2">
            <Layers className="w-5 h-5 text-blue-400" />
            Technical Skills ({technical.length})
          </h3>
          {technical.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {technical.map((skill, index) => (
                <span 
                  key={index} 
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-900/60 text-slate-300 border border-slate-800 text-xs rounded-lg font-medium"
                >
                  <Check className="w-3.5 h-3.5 text-blue-400" />
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-xs italic">No technical skills detected or listed.</p>
          )}
        </div>

        {/* Soft Skills Detected */}
        <div className="glass-card rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2 border-b border-slate-850 pb-2">
            <Award className="w-5 h-5 text-purple-400" />
            Soft Skills & Methodologies ({soft.length})
          </h3>
          {soft.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {soft.map((skill, index) => (
                <span 
                  key={index} 
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-900/60 text-slate-300 border border-slate-800 text-xs rounded-lg font-medium"
                >
                  <Check className="w-3.5 h-3.5 text-purple-400" />
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-xs italic">No soft skills detected or listed.</p>
          )}
        </div>

      </div>

      {/* Matched Skills */}
      <div className="glass-card rounded-xl p-6 shadow-md">
        <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-green-400" />
          Job-Matched Skills ({matched.length})
        </h3>
        {matched.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            {matched.map((skill, index) => (
              <div 
                key={index}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/15 border border-green-500/20 hover:border-green-500/30 text-green-400 rounded-lg text-xs md:text-sm font-semibold transition cursor-default"
              >
                <Check className="w-4 h-4 stroke-[3px]" />
                {skill}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm italic">No matching skills detected in your resume relative to the JD requirements.</p>
        )}
      </div>

      {/* Skill Gaps Block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Missing Skills Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            Completely Missing Skills ({missing.length})
          </h3>
          
          {missing.length > 0 ? (
            <div className="space-y-4">
              {missing.map((skill, index) => {
                const priority = skill.priority || "Medium";
                let badgeColor = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
                if (priority === "High") badgeColor = "bg-red-500/10 text-red-400 border-red-500/20";
                else if (priority === "Low") badgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                
                return (
                  <div 
                    key={index}
                    className="glass-card rounded-xl p-5 border-l-4 border-l-red-500/80 shadow-md space-y-3"
                  >
                    <div className="flex justify-between items-center gap-4">
                      <h4 className="text-base font-bold text-slate-200">{skill.name}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${badgeColor}`}>
                        {priority} Priority
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-xs md:text-sm">
                      <p className="text-slate-400">
                        <strong className="text-slate-300 font-medium">Why it matters:</strong> {skill.why_matters}
                      </p>
                      <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 flex items-start gap-2">
                        <ArrowUpRight className="w-4.5 h-4.5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-slate-300 text-xs">
                          <strong className="text-blue-400 font-medium">Action:</strong> {skill.recommended_action}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card rounded-xl p-6 text-center text-slate-500 italic text-sm">
              Congratulations! No completely missing skills found.
            </div>
          )}
        </div>

        {/* Partially Matched Skills Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Partial Skill Gaps ({partial.length})
          </h3>

          {partial.length > 0 ? (
            <div className="space-y-4">
              {partial.map((skill, index) => (
                <div 
                  key={index}
                  className="glass-card rounded-xl p-5 border-l-4 border-l-yellow-500/80 shadow-md space-y-3"
                >
                  <h4 className="text-base font-bold text-slate-200">{skill.name}</h4>
                  
                  <div className="space-y-2 text-xs md:text-sm">
                    <p className="text-slate-400">
                      <strong className="text-slate-300 font-medium">Gap:</strong> {skill.gap_description}
                    </p>
                    <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 flex items-start gap-2">
                      <ArrowUpRight className="w-4.5 h-4.5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-slate-300 text-xs">
                        <strong className="text-blue-400 font-medium">Action:</strong> {skill.recommended_action}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-xl p-6 text-center text-slate-500 italic text-sm">
              No partial matches found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
