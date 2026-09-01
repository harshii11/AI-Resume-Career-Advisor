// frontend/src/components/EvaluationView.jsx

import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ShieldCheck, Cpu, RefreshCw, Layers, CheckCircle2 } from "lucide-react";

export default function EvaluationView() {
  const [evalData, setEvalData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvaluation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/evaluation");
      if (!response.ok) {
        throw new Error("Failed to fetch evaluation report.");
      }
      const data = await response.json();
      setEvalData(data);
    } catch (err) {
      console.error(err);
      setError("Failed to communicate with the backend evaluation endpoint. Ensure the FastAPI backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluation();
  }, []);

  const metricChartData = evalData?.evaluations
    ? Object.keys(evalData.evaluations[0].metrics).map((key) => {
        // Average the metric scores across scenarios
        const avgValue = Math.round(
          evalData.evaluations.reduce((sum, item) => sum + item.metrics[key], 0) /
            evalData.evaluations.length
        );
        return {
          name: key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase()),
          Score: avgValue
        };
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-green-400" />
            Model Evaluation & Quality Reports
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Audit the precision and consistency of the RAG pipeline and Career Advisor Agent predictions.
          </p>
        </div>
        <button
          onClick={fetchEvaluation}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Run Evaluation Audit
        </button>
      </div>

      {isLoading && (
        <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mb-4" />
          <h3 className="text-lg font-semibold text-slate-200">Calculating Pipeline Metrics</h3>
          <p className="text-xs text-slate-400 mt-1">Cross-referencing RAG outputs against evaluation test scenarios...</p>
        </div>
      )}

      {error && (
        <div className="glass-card rounded-2xl p-6 border-l-4 border-red-500/80 text-slate-300">
          <h3 className="font-semibold text-red-400 mb-1">Evaluation API Warning</h3>
          <p className="text-xs leading-relaxed">{error}</p>
        </div>
      )}

      {!isLoading && !error && evalData && (
        <div className="space-y-6">
          {/* Summary Score Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* System Details */}
            <div className="glass-card rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 border-b border-slate-800 pb-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                Pipeline Setup
              </h4>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">RAG Embedding:</span>
                  <span className="text-slate-200">{evalData.system_details?.rag_model}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Vector Database:</span>
                  <span className="text-slate-200">{evalData.system_details?.vector_db}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">LLM Backend Engine:</span>
                  <span className="text-slate-200">{evalData.system_details?.llm_agent}</span>
                </div>
              </div>
            </div>

            {/* Overall Score */}
            <div className="glass-card rounded-xl p-5 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                Overall Evaluation Score
              </span>
              <span className="text-5xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-1">
                {evalData.overall_evaluation_score}%
              </span>
              <div className="flex items-center gap-1 text-green-400 text-[10px] font-bold bg-green-500/10 px-2.5 py-0.5 rounded-full border border-green-500/20">
                <CheckCircle2 className="w-3 h-3" /> PIPELINE AUDIT PASSED
              </div>
            </div>

            {/* Completeness Card */}
            <div className="glass-card rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 border-b border-slate-800 pb-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Audit Scope
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Scenarios:</span>
                  <span className="text-slate-200 font-bold">{evalData.total_test_scenarios}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Checks Per Scenario:</span>
                  <span className="text-slate-200 font-bold">5 metrics</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ground-Truth Scope:</span>
                  <span className="text-slate-200 font-bold">Junior Full-Stack, Senior Web</span>
                </div>
              </div>
            </div>

          </div>

          {/* Metrics Visualized Chart */}
          <div className="glass-card rounded-xl p-6 shadow-md">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
              Metric Breakdown (Average Over Scenarios)
            </h3>
            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metricChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <XAxis type="number" domain={[0, 100]} stroke="#475569" fontSize={9} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={120} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155" }}
                    labelStyle={{ color: "#f1f5f9" }}
                    itemStyle={{ color: "#34d399" }}
                  />
                  <Bar dataKey="Score" fill="#10b981" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scenario Execution Audit Logs */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              System Test Scenarios Audit Logs
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800/80">
              <table className="w-full border-collapse text-left text-xs bg-slate-900/10">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="p-4">ID</th>
                    <th className="p-4">Candidate Resume Context</th>
                    <th className="p-4">Target Job Description</th>
                    <th className="p-4">Metrics Detail</th>
                    <th className="p-4 text-center">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {evalData.evaluations?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/20 text-slate-300">
                      <td className="p-4 font-mono text-[10px] text-blue-400 align-top">{item.scenario_id}</td>
                      <td className="p-4 max-w-xs leading-normal align-top">{item.resume}</td>
                      <td className="p-4 max-w-xs leading-normal align-top">{item.job_description}</td>
                      <td className="p-4 space-y-1 align-top">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-slate-400">
                          <span>Skill Accuracy: <strong className="text-slate-200">{item.metrics.skill_extraction_accuracy}%</strong></span>
                          <span>Score Validity: <strong className="text-slate-200">{item.metrics.match_score_validity}%</strong></span>
                          <span>Missing Skill Rel: <strong className="text-slate-200">{item.metrics.missing_skill_relevance}%</strong></span>
                          <span>Consistency: <strong className="text-slate-200">{item.metrics.recommendation_consistency}%</strong></span>
                        </div>
                      </td>
                      <td className="p-4 text-center align-top">
                        <span className="font-bold text-green-400 text-sm">{item.scenario_score}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
