"use client";

import { useState, useEffect } from "react";
import TeacherHeader from "@/components/TeacherHeader";
import PastAssignmentsTable from "@/components/PastAssignmentsTable";
import CreateAssignmentForm from "@/components/CreateAssignmentForm";
import { Plus, BookOpen, Users, Sparkles } from "lucide-react";

export default function TeacherHomePage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState("Loading History...");

  // History state: persistently maintained
  const [assignments, setAssignments] = useState([]);

  // Load Assignment History from MongoDB & Local Storage
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
          // Sync local backup
          localStorage.setItem(teacherKey, JSON.stringify(json.data));
          setDbStatus("MongoDB Atlas Database Connected");
          return;
        }
      }
    } catch (err) {
      // Backend offline fallback
    }

    // Load persistent local history backup
    const localBackup = localStorage.getItem(teacherKey);
    if (localBackup) {
      try {
        const parsed = JSON.parse(localBackup);
        setAssignments(parsed);
        setDbStatus(`Persistent History Mode (${parsed.length} saved)`);
        return;
      } catch (e) {}
    }

    setAssignments([]);
    setDbStatus("No History Records Yet");
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

    // Refresh from DB
    setTimeout(() => {
      fetchAssignments();
    }, 500);
  };

  const activeCount = assignments.filter(a => a.status === "Active" || !a.status).length;
  const totalSubmissionsCount = assignments.reduce((acc, curr) => acc + (curr.submissions || 0), 0);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black flex flex-col font-sans">
      <TeacherHeader onOpenCreateModal={() => setIsCreateModalOpen(true)} />

      <main className="flex-1 py-10 px-6 mx-auto max-w-7xl w-full space-y-8">
        
        {/* Page Hero Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs font-mono text-zinc-400">
                FACULTY DASHBOARD
              </span>
              <span className="inline-block rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs font-mono text-zinc-300">
                {dbStatus}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Teacher Assignment History
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base mt-1">
              Create new assignments and manage your stored assignment history with view and 6-digit code access.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-black hover:bg-zinc-200 transition-colors shadow-lg"
          >
            <Plus className="h-5 w-5 stroke-[3]" />
            <span>Create New Assignment</span>
          </button>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white shrink-0">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white font-mono">{assignments.length}</p>
              <p className="text-xs text-zinc-400 uppercase font-mono">Assignments Saved in History</p>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white font-mono">{totalSubmissionsCount}</p>
              <p className="text-xs text-zinc-400 uppercase font-mono">Turned-in Student Files</p>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white shrink-0">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white font-mono">{activeCount} Active</p>
              <p className="text-xs text-zinc-400 uppercase font-mono">Accepting Submissions</p>
            </div>
          </div>
        </div>

        {/* Persistent History Table Section */}
        <div className="space-y-4 pt-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Assignment History ({assignments.length})</h2>
            <p className="text-xs text-zinc-400">All assignments created by your account are saved in MongoDB database history. Click "View" to inspect submissions or view instructions.</p>
          </div>

          <PastAssignmentsTable assignments={assignments} />
        </div>

      </main>

      <CreateAssignmentForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAddAssignment={handleAddAssignment}
      />

      <footer className="border-t border-zinc-800 py-6 text-center text-xs font-mono text-zinc-500">
        GlobalAssign Teacher Interface • Database History Connected
      </footer>
    </div>
  );
}
