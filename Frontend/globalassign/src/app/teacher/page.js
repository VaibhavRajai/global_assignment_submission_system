"use client";

import { useState, useEffect } from "react";
import TeacherHeader from "@/components/TeacherHeader";
import PastAssignmentsTable from "@/components/PastAssignmentsTable";
import CreateAssignmentForm from "@/components/CreateAssignmentForm";
import { Plus, BookOpen, Users, Sparkles, CheckCircle2 } from "lucide-react";

export default function TeacherHomePage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState("Loading History...");
  const [assignments, setAssignments] = useState([]);

  // Fetch Account Specific Assignments from Backend API
  const fetchAssignments = async () => {
    const token = localStorage.getItem("globalassign_token");
    const storedUser = localStorage.getItem("globalassign_user");
    let teacherKey = "globalassign_history_default";

    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.id || u.email) teacherKey = `globalassign_history_${u.id || u.email}`;
      } catch (e) {}
    }

    try {
      const res = await fetch("http://localhost:5000/api/assignments", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setAssignments(json.data);
          localStorage.setItem(teacherKey, JSON.stringify(json.data));
          setDbStatus("MongoDB Database Connected");
          return;
        }
      }
    } catch (err) {}

    // Persistent Local Backup
    const localBackup = localStorage.getItem(teacherKey);
    if (localBackup) {
      try {
        const parsed = JSON.parse(localBackup);
        setAssignments(parsed);
        setDbStatus(`Saved History (${parsed.length} items)`);
        return;
      } catch (e) {}
    }

    setAssignments([]);
    setDbStatus("Ready to create assignments");
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleAddAssignment = async (newAssignment) => {
    const storedUser = localStorage.getItem("globalassign_user");
    let teacherKey = "globalassign_history_default";

    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.id || u.email) teacherKey = `globalassign_history_${u.id || u.email}`;
      } catch (e) {}
    }

    const updated = [newAssignment, ...assignments];
    setAssignments(updated);
    localStorage.setItem(teacherKey, JSON.stringify(updated));

    setTimeout(() => {
      fetchAssignments();
    }, 500);
  };

  const activeCount = assignments.filter(a => a.status === "Active" || !a.status).length;
  const totalSubmissionsCount = assignments.reduce((acc, curr) => acc + (curr.submissions || 0), 0);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black flex flex-col font-sans relative">
      {/* Background Radial Glow & Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-white/5 blur-[140px] rounded-full pointer-events-none" />

      <TeacherHeader />

      <main className="relative flex-1 py-10 px-6 mx-auto max-w-7xl w-full space-y-8">
        
        {/* Modern Hero Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-800/80">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs font-mono text-zinc-300">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                FACULTY COMMAND CENTER
              </span>
              <span className="inline-block rounded-full bg-zinc-900/90 border border-zinc-800 px-3 py-1 text-xs font-mono text-zinc-400">
                {dbStatus}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-5xl">
              Educator Dashboard
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base max-w-2xl">
              Create assignments with instant 6-digit class codes, monitor student turn-ins, and view AI-synthesized class summaries.
            </p>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-extrabold text-black transition-all hover:bg-zinc-200 active:scale-95 shadow-2xl overflow-hidden"
          >
            <Plus className="h-5 w-5 stroke-[3] transition-transform group-hover:rotate-90" />
            <span>Create New Assignment</span>
          </button>
        </div>

        {/* Modern Stat Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 glass-card-hover space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">SAVED ASSIGNMENTS</span>
              <div className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white font-mono">{assignments.length}</p>
            <p className="text-xs text-zinc-400">Total Created History</p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 glass-card-hover space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">TURNED-IN FILES</span>
              <div className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white font-mono">{totalSubmissionsCount}</p>
            <p className="text-xs text-zinc-400">Student Uploads Stored</p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 glass-card-hover space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">ACTIVE STATUS</span>
              <div className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white font-mono">{activeCount} Active</p>
            <p className="text-xs text-zinc-400">Ready for Submissions</p>
          </div>

        </div>

        {/* History Table Section */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Assignment History</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {assignments.length} Total
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">Click "View" on any row to inspect student submissions and 6-digit class join codes.</p>
            </div>
          </div>

          <PastAssignmentsTable assignments={assignments} />
        </div>

      </main>

      <CreateAssignmentForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAddAssignment={handleAddAssignment}
      />

      <footer className="border-t border-zinc-800/80 py-6 text-center text-xs font-mono text-zinc-500">
        GlobalAssign Educator Suite • Black & White Modern Edition
      </footer>
    </div>
  );
}
