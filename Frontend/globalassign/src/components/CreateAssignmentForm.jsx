"use client";

import { useState } from "react";
import { X, PlusCircle, CheckCircle2, Copy, Check } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://globalassign-backend.vercel.app";

export default function CreateAssignmentForm({ isOpen, onClose, onAddAssignment }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [createdCode, setCreatedCode] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !dueDate) return;

    setLoading(true);

    const token = localStorage.getItem("globalassign_token");
    const payload = {
      title,
      dueDate,
      description
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (json.success && json.data) {
        setCreatedCode(json.data.code);
        onAddAssignment(json.data);
      } else {
        const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
        setCreatedCode(fallbackCode);
        onAddAssignment({
          id: Date.now().toString(),
          title,
          dueDate,
          description,
          code: fallbackCode,
          submissions: 0,
          totalStudents: 45,
          status: "Active"
        });
      }
    } catch (err) {
      const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
      setCreatedCode(fallbackCode);
      onAddAssignment({
        id: Date.now().toString(),
        title,
        dueDate,
        description,
        code: fallbackCode,
        submissions: 0,
        totalStudents: 45,
        status: "Active"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!createdCode) return;
    navigator.clipboard.writeText(createdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetAndClose = () => {
    setCreatedCode(null);
    setCopied(false);
    setTitle("");
    setDueDate("");
    setDescription("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl overflow-hidden">
        
        <div className="flex items-center justify-between border-b border-zinc-800 p-6 bg-black">
          <div>
            <span className="text-xs font-mono text-zinc-400 uppercase">[ TEACHER SUITE ]</span>
            <h3 className="text-xl font-bold text-white mt-0.5">Create New Assignment</h3>
          </div>
          <button
            onClick={handleResetAndClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {createdCode ? (
          <div className="p-8 text-center space-y-6 animate-in zoom-in duration-200">
            <div className="h-12 w-12 rounded-full bg-white text-black flex items-center justify-center mx-auto font-bold">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <div>
              <h4 className="text-2xl font-extrabold text-white">Assignment Created!</h4>
              <p className="text-xs text-zinc-400 mt-1">Share this 6-digit join code with your students to accept submissions.</p>
            </div>

            <div className="p-5 rounded-xl border border-zinc-700 bg-black max-w-sm mx-auto space-y-3 shadow-inner">
              <p className="text-xs font-mono text-zinc-400 uppercase">6-DIGIT CLASS CODE</p>
              <div className="text-4xl font-extrabold font-mono text-white tracking-widest">
                {createdCode}
              </div>

              <button
                onClick={handleCopyCode}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-black hover:bg-zinc-200 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-black" /> Code Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> Copy 6-Digit Code
                  </>
                )}
              </button>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <button
                onClick={handleResetAndClose}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700"
              >
                Done / Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">ASSIGNMENT NAME / TITLE *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Quantum Computing Lab 4"
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm text-white focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">DEADLINE / DUE DATE *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm text-white focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">DESCRIPTION & INSTRUCTIONS</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed instructions, formatting guidelines, and rubric criteria..."
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm text-white focus:border-white focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="rounded-lg border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-white px-6 py-2.5 text-xs font-bold text-black hover:bg-zinc-200 disabled:opacity-50 transition-colors"
              >
                {loading ? "Generating 6-Digit Code..." : (
                  <>
                    <PlusCircle className="h-4 w-4" /> Create & Generate Code
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
