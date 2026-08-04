"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TeacherHeader from "@/components/TeacherHeader";
import CreateAssignmentForm from "@/components/CreateAssignmentForm";
import { 
  PlusCircle, 
  Search, 
  FileText, 
  Users, 
  Clock, 
  ChevronRight, 
  ExternalLink,
  BookOpen,
  Calendar,
  Sparkles,
  Eye
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function TeacherHomePage() {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    const token = localStorage.getItem("globalassign_token");

    try {
      if (token) {
        const res = await fetch(`${API_BASE_URL}/api/assignments`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setAssignments(json.data);
            setLoading(false);
            return;
          }
        }
      }
    } catch (err) {
      console.error("Error fetching teacher assignments:", err);
    }

    setAssignments([]);
    setLoading(false);
  };

  const handleAssignmentCreated = (newAssignment) => {
    setIsCreateModalOpen(false);
    fetchAssignments();
  };

  // Filter assignments by search term (Title or 6-digit Code)
  const filteredAssignments = assignments.filter((item) => {
    const titleMatch = (item.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    const codeMatch = (item.code || item.assignmentCode || "").toString().includes(searchTerm.trim());
    return titleMatch || codeMatch;
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans relative selection:bg-white selection:text-black">
      <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />

      <TeacherHeader />

      <main className="relative flex-1 py-8 px-4 sm:px-6 mx-auto max-w-6xl w-full space-y-6 z-10">
        
        {/* COMPACT DASHBOARD HEADER (No FACULTY Command or Vercel Tags) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-white">Teacher Dashboard</h1>
            <p className="text-xs text-zinc-400">Manage class assignments, generate 6-digit codes, and view student turn-ins.</p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-black hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shrink-0"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Assignment</span>
          </button>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search assignments by title or 6-digit code..."
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pl-9 pr-4 py-2.5 text-xs font-mono text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
            />
          </div>

          <span className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-xl shrink-0">
            Total: {filteredAssignments.length}
          </span>
        </div>

        {/* ELEGANT ASSIGNMENT TABLE / GRID VIEW */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-8 text-center text-zinc-500 font-mono text-xs">
              Loading assignments...
            </div>
          ) : filteredAssignments.length > 0 ? (
            <>
              {/* MOBILE CARDS VIEW (< 640px) */}
              <div className="block sm:hidden divide-y divide-zinc-800">
                {filteredAssignments.map((item) => (
                  <div key={item.id || item._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{item.title}</h4>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                          {item.description || "No description provided"}
                        </p>
                      </div>
                      <span className="inline-block rounded-lg bg-zinc-900 border border-zinc-700 px-2 py-0.5 text-xs font-mono font-bold text-white tracking-widest shrink-0">
                        {item.code || item.assignmentCode}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                        <span>{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "No deadline"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-zinc-400" />
                        <span>{item.submissionsCount || item.submissions || 0} turn-ins</span>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/submission/${item.id || item._id}`)}
                      className="w-full py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View Submissions</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* TABLE VIEW (sm+ Screens) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-black text-zinc-400 uppercase border-b border-zinc-800 text-[11px]">
                    <tr>
                      <th scope="col" className="px-5 py-3.5 font-semibold">Assignment Title & Description</th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">Class Code</th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">Due Date</th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">Submissions</th>
                      <th scope="col" className="px-5 py-3.5 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredAssignments.map((item) => (
                      <tr key={item.id || item._id} className="hover:bg-zinc-900/40 transition-colors">
                        
                        {/* Title & Description */}
                        <td className="px-5 py-3.5 font-sans font-semibold text-white">
                          <div className="text-xs font-bold text-white">{item.title}</div>
                          <p className="text-[11px] font-normal text-zinc-400 truncate max-w-sm mt-0.5">
                            {item.description || "No description provided"}
                          </p>
                        </td>

                        {/* 6-Digit Class Code */}
                        <td className="px-5 py-3.5">
                          <span className="inline-block rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1 text-xs font-mono font-bold text-white tracking-widest">
                            {item.code || item.assignmentCode}
                          </span>
                        </td>

                        {/* Due Date */}
                        <td className="px-5 py-3.5 text-zinc-300">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Calendar className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                            <span>{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "No deadline"}</span>
                          </div>
                        </td>

                        {/* Submission Counts */}
                        <td className="px-5 py-3.5 text-zinc-300">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-zinc-400" />
                            <span>{item.submissionsCount || item.submissions || 0} turn-ins</span>
                          </div>
                        </td>

                        {/* Action: Redirect to View Page */}
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => router.push(`/submission/${item.id || item._id}`)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all active:scale-95"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View Submissions</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (

            <div className="p-10 text-center text-zinc-500 font-mono text-xs space-y-2">
              <BookOpen className="h-6 w-6 text-zinc-600 mx-auto" />
              <p className="text-white font-bold text-xs">No assignments found</p>
              <p className="text-zinc-500 text-[11px]">Click "Create Assignment" above to draft your first assignment.</p>
            </div>
          )}
        </div>

      </main>

      {/* CREATE ASSIGNMENT MODAL */}
      <CreateAssignmentForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAddAssignment={handleAssignmentCreated}
      />
    </div>
  );
}
