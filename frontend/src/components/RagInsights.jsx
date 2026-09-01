// frontend/src/components/RagInsights.jsx

import React from "react";
import { Server, Search, FileSignature, CheckCircle, Database } from "lucide-react";

export default function RagInsights({ data }) {
  const insights = data.rag_insights || [];

  const flowSteps = [
    {
      title: "1. Document Parsing",
      desc: "Uploaded PDF documents (Resume and Job Description) parsed and extracted into plain text.",
      status: "COMPLETED"
    },
    {
      title: "2. Text Chunking",
      desc: "Job description split into overlapping semantic chunks of ~400 characters to preserve context.",
      status: "COMPLETED"
    },
    {
      title: "3. Embeddings Generation",
      desc: "Chunks converted into dense mathematical vectors using local Sentence-Transformers embeddings.",
      status: "COMPLETED"
    },
    {
      title: "4. ChromaDB Indexing",
      desc: "Vector representations loaded into local vector DB, building a cosine-space similarity index.",
      status: "COMPLETED"
    },
    {
      title: "5. Semantic Search Retrieval",
      desc: "Candidate resume keywords query the index to extract the top-matching job requirements.",
      status: "COMPLETED"
    },
    {
      title: "6. Agent Prompt Injecting",
      desc: "Retrieved requirement fragments injected directly into Gemini LLM context boundaries to generate advice.",
      status: "COMPLETED"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="border-b border-slate-800 pb-5">
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Database className="w-6 h-6 text-blue-400" />
          RAG Inspection & Transparency
        </h2>
        <p className="text-slate-400 text-sm mt-0.5">
          See exactly how the AI processes your files and retrieves context from the vector database.
        </p>
      </div>

      {/* Steps Flow Grid */}
      <div className="glass-card rounded-xl p-6 shadow-md">
        <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-blue-400" />
          RAG Pipeline Execution Trace
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {flowSteps.map((step, idx) => (
            <div 
              key={idx} 
              className="p-4 bg-slate-900/40 border border-slate-850 hover:border-slate-800 rounded-xl space-y-2 relative flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <h4 className="text-xs font-bold text-slate-200">{step.title}</h4>
                  <span className="text-[9px] font-extrabold bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20">
                    {step.status}
                  </span>
                </div>
                <p className="text-slate-400 text-[10px] leading-snug">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RAG Snippets retrieved */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <Search className="w-5 h-5 text-indigo-400" />
          Retrieved Job Description Context Snippets ({insights.length})
        </h3>
        
        {insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((chunk, index) => {
              const scorePercent = Math.round(chunk.score * 100);
              return (
                <div 
                  key={index}
                  className="glass-card rounded-xl p-5 shadow-sm border border-slate-800 relative space-y-3"
                >
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
                      <FileSignature className="w-3.5 h-3.5" />
                      Document Chunk #{index + 1}
                    </span>
                    <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                      RAG Similarity Score: {scorePercent}%
                    </span>
                  </div>
                  
                  <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-mono bg-slate-950/40 p-3 rounded-lg border border-slate-900">
                    "{chunk.text}"
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-6 text-center text-slate-500 italic text-sm">
            No RAG requirements fragments were indexed for search comparison. Try running demo mode or uploading custom PDFs.
          </div>
        )}
      </div>
    </div>
  );
}
