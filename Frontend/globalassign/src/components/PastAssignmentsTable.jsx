"use client";

import { useState } from "react";
import { Search, Eye, X, FileText, CheckCircle2, Sparkles, Copy, Check, ShieldCheck } from "lucide-react";

export default function PastAssignmentsTable({ assignments }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [activeTabInModal, setActiveTabInModal] = useState("submissions");
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  const filteredAssignments = assignments.filter((item) => {
    return item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (item.code && item.code.includes(searchTerm));
  });

  const handleCopyCodeRow = (e, code, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search assignment name or 6-digit code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 pl-9 pr-4 py-2 text-sm text-white focus:border-white focus:outline-none"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="bg-zinc-900/80 text-xs font-mono uppercase text-zinc-400 border-b border-zinc-800">
            <tr>
              <th scope="col" className="px-6 py-4">Assignment Name</th>
              <th scope="col" className="px-6 py-4">6-Digit Code</th>
              <th scope="col" className="px-6 py-4">Deadline</th>
              <th scope="col" className="px-6 py-4">Submissions</th>
              <th scope="col" className="px-6 py-4">Status</th>
              <th scope="col" className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredAssignments.length > 0 ? (
              filteredAssignments.map((item) => {
                const percent = item.totalStudents ? Math.round((item.submissions / item.totalStudents) * 100) : 0;
                const codeDisplay = item.code || "849201";
                return (
                  <tr key={item.id} className="hover:bg-zinc-900/50 transition-colors">
                    {/* Title */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-white leading-snug">{item.title}</p>
                        </div>
                      </div>
                    </td>

                    {/* 6-Digit Code Badge & Copy */}
                    <td className="px-6 py-4 font-mono text-xs">
                      <button
                        onClick={(e) => handleCopyCodeRow(e, codeDisplay, item.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-white font-bold hover:bg-white hover:text-black transition-colors"
                        title="Click to copy code"
                      >
                        {copiedCodeId === item.id ? (
                          <>
                            <Check className="h-3 w-3 text-green-400" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 text-zinc-400" /> {codeDisplay}
                          </>
                        )}
                      </button>
                    </td>

                    {/* Deadline */}
                    <td className="px-6 py-4 font-mono text-xs text-zinc-300">
                      {item.dueDate}
                    </td>

                    {/* Submissions Progress */}
                    <td className="px-6 py-4">
                      <div className="w-32 space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-white font-bold">{item.submissions} / {item.totalStudents || 45}</span>
                          <span className="text-zinc-400">{percent}%</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-white h-full transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full border ${
                        item.status === "Active"
                          ? "bg-zinc-900 text-white border-zinc-700"
                          : item.status === "Summarized"
                          ? "bg-white text-black border-white font-bold"
                          : "bg-zinc-900 text-zinc-400 border-zinc-800"
                      }`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {item.status || "Active"}
                      </span>
                    </td>

                    {/* View Button */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedAssignment(item);
                          setActiveTabInModal("submissions");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-white hover:text-black transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 font-mono text-xs">
                  No assignments found for your teacher account yet. Click "+ Create Assignment" above to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Assignment Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-zinc-800 p-6 bg-black">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-white bg-zinc-900 border border-zinc-700 px-2.5 py-0.5 rounded font-bold">
                    6-Digit Code: {selectedAssignment.code || "849201"}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">Due: {selectedAssignment.dueDate}</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">{selectedAssignment.title}</h3>
              </div>

              <button
                onClick={() => setSelectedAssignment(null)}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex border-b border-zinc-800 bg-zinc-900/50 px-6 gap-4 text-xs font-bold font-mono">
              <button
                onClick={() => setActiveTabInModal("submissions")}
                className={`py-3 border-b-2 transition-colors ${
                  activeTabInModal === "submissions"
                    ? "border-white text-white"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                Student Submissions ({selectedAssignment.submissions})
              </button>
              <button
                onClick={() => setActiveTabInModal("details")}
                className={`py-3 border-b-2 transition-colors ${
                  activeTabInModal === "details"
                    ? "border-white text-white"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                Description & 6-Digit Code
              </button>
              <button
                onClick={() => setActiveTabInModal("aisummary")}
                className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTabInModal === "aisummary"
                    ? "border-white text-white"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-white" /> AI Class Summary
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              
              {activeTabInModal === "submissions" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <span>STUDENT TURN-IN FILES ({selectedAssignment.submissions} TOTAL)</span>
                    <span className="flex items-center gap-1 text-white">
                      <ShieldCheck className="h-3.5 w-3.5 text-white" /> E2E Verified Vault
                    </span>
                  </div>

                  <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-black">
                    {selectedAssignment.submissions > 0 ? (
                      [
                        { name: "Alex Chen", file: "Quantum_Lab4_AlexChen.pdf", date: "Jul 22, 2026, 14:32", hash: "0x8F9A23", status: "Verified Safe" },
                        { name: "Sarah Jenkins", file: "Quantum_Lab4_SJenkins.zip", date: "Jul 22, 2026, 11:15", hash: "0x3B7C91", status: "Verified Safe" }
                      ].map((sub, i) => (
                        <div key={i} className="flex items-center justify-between p-4 text-xs font-mono">
                          <div className="space-y-1">
                            <p className="font-bold text-white text-sm">{sub.name}</p>
                            <p className="text-zinc-400 flex items-center gap-2">
                              <span>📄 {sub.file}</span>
                              <span>•</span>
                              <span className="text-zinc-500">{sub.date}</span>
                            </p>
                          </div>
                          <span className="flex items-center gap-1 text-white font-bold text-xs bg-zinc-900 px-2.5 py-1 rounded border border-zinc-700">
                            <CheckCircle2 className="h-3.5 w-3.5 text-white" /> {sub.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-zinc-500 font-mono text-xs">
                        No student turn-in files received yet for code: <span className="text-white font-bold">{selectedAssignment.code}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTabInModal === "details" && (
                <div className="space-y-4 text-sm text-zinc-300">
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <p className="text-xs font-mono text-zinc-400 uppercase">DESCRIPTION / INSTRUCTIONS</p>
                    <p className="leading-relaxed">{selectedAssignment.description || selectedAssignment.instructions || "No description provided."}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1 font-mono text-xs">
                      <p className="text-zinc-400">ASSIGNMENT 6-DIGIT CODE</p>
                      <p className="text-white font-bold text-xl tracking-widest">{selectedAssignment.code || "849201"}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1 font-mono text-xs">
                      <p className="text-zinc-400">DEADLINE / DUE DATE</p>
                      <p className="text-white font-bold text-sm">{selectedAssignment.dueDate}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTabInModal === "aisummary" && (
                <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-white">
                    <Sparkles className="h-4 w-4 text-white" />
                    <span>AI SYNTHESIZED CLASS BRIEFING</span>
                  </div>
                  <p className="text-xs text-zinc-300">Class submission performance synthesized successfully.</p>
                </div>
              )}

            </div>

            <div className="border-t border-zinc-800 p-4 bg-black flex justify-end">
              <button
                onClick={() => setSelectedAssignment(null)}
                className="rounded-lg bg-white px-5 py-2 text-xs font-bold text-black hover:bg-zinc-200"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
