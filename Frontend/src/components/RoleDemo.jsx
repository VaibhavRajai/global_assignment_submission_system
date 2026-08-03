"use client";

import { useState } from "react";
import { 
  PlusCircle, 
  FileText, 
  Sparkles, 
  UploadCloud, 
  ShieldCheck, 
  CheckCircle, 
  BarChart3, 
  Clock, 
  UserCheck, 
  FileCheck,
  AlertCircle,
  RefreshCw,
  Search,
  ChevronRight,
  Lock,
  Download
} from "lucide-react";

export default function RoleDemo() {
  const [activeRole, setActiveRole] = useState("teacher"); // "teacher" | "student"
  const [teacherTab, setTeacherTab] = useState("create"); // "create" | "view" | "summarize"

  // Teacher Form State
  const [assignmentTitle, setAssignmentTitle] = useState("Quantum Computing & Complexity Theory - Lab 4");
  const [courseCode, setCourseCode] = useState("CS-402");
  const [dueDate, setDueDate] = useState("2026-08-01T23:59");
  const [instructions, setInstructions] = useState("Submit your solution in PDF format with complete mathematical proofs and Python codebase snippets.");
  const [enableAISummary, setEnableAISummary] = useState(true);
  const [published, setPublished] = useState(false);

  // Dynamic Assignments List
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: "Quantum Computing & Complexity Theory - Lab 4",
      course: "CS-402",
      dueDate: "Aug 01, 2026",
      submissions: 42,
      totalStudents: 45,
      status: "Active",
      avgGrade: "B+"
    },
    {
      id: 2,
      title: "Distributed Systems & Raft Consensus Architecture",
      course: "CS-501",
      dueDate: "Jul 20, 2026",
      submissions: 38,
      totalStudents: 38,
      status: "Completed",
      avgGrade: "A-"
    },
    {
      id: 3,
      title: "Neural Network Backpropagation & Calculus Derivation",
      course: "AI-301",
      dueDate: "Jul 15, 2026",
      submissions: 50,
      totalStudents: 50,
      status: "Summarized",
      avgGrade: "A"
    }
  ]);

  // AI Summarizer State
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(1);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryResult, setSummaryResult] = useState(null);

  // Student Safe Upload State
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [securityChecks, setSecurityChecks] = useState({
    encryption: false,
    malware: false,
    plagiarism: false,
    timestamp: false
  });
  const [uploadReceipt, setUploadReceipt] = useState(null);

  // Handler: Create Assignment
  const handlePublishAssignment = (e) => {
    e.preventDefault();
    if (!assignmentTitle) return;

    const newObj = {
      id: Date.now(),
      title: assignmentTitle,
      course: courseCode,
      dueDate: dueDate ? new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "Aug 10, 2026",
      submissions: 0,
      totalStudents: 45,
      status: "Active",
      avgGrade: "Pending"
    };

    setAssignments([newObj, ...assignments]);
    setPublished(true);
    setTimeout(() => setPublished(false), 3000);
  };

  // Handler: AI Summarizer
  const handleRunAISummary = () => {
    setIsSummarizing(true);
    setSummaryResult(null);

    setTimeout(() => {
      setIsSummarizing(false);
      const target = assignments.find(a => a.id === Number(selectedAssignmentId)) || assignments[0];
      setSummaryResult({
        title: target.title,
        course: target.course,
        totalSubmissions: target.submissions,
        submissionRate: "93.3%",
        commonStrengths: [
          "92% of students correctly implemented quantum gate matrices in Qiskit.",
          "Strong understanding of Dirac notation and superpositions."
        ],
        areasForImprovement: [
          "15% of students struggled with decoherence error mitigation calculations.",
          "Slight confusion regarding Grover search iteration bounds."
        ],
        gradeBreakdown: { A: "45%", B: "35%", C: "15%", D: "5%" },
        aiRecommendation: "Recommend reviewing Grover's Algorithm step 3 in next lecture."
      });
    }, 1200);
  };

  // Handler: Student Upload Simulator
  const handleFileDrop = (file) => {
    setUploadedFile(file);
    setIsScanning(true);
    setUploadProgress(10);
    setSecurityChecks({ encryption: false, malware: false, plagiarism: false, timestamp: false });
    setUploadReceipt(null);

    setTimeout(() => {
      setUploadProgress(35);
      setSecurityChecks(prev => ({ ...prev, encryption: true }));
    }, 600);

    setTimeout(() => {
      setUploadProgress(70);
      setSecurityChecks(prev => ({ ...prev, malware: true, plagiarism: true }));
    }, 1200);

    setTimeout(() => {
      setUploadProgress(100);
      setSecurityChecks(prev => ({ ...prev, timestamp: true }));
      setIsScanning(false);
      setUploadReceipt({
        hash: "0x8F9A..." + Math.random().toString(36).substring(2, 8).toUpperCase(),
        timestamp: new Date().toLocaleString(),
        status: "VERIFIED_SAFE_E2E"
      });
    }, 1800);
  };

  return (
    <section id="interactive-demo" className="py-20 bg-zinc-950 border-b border-zinc-800 relative">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-white" />
            <span>Interactive Live Sandbox</span>
          </div>
          <h2 className="text-3xl font-extrabold sm:text-5xl tracking-tight text-white">
            Experience both perspectives in real-time.
          </h2>
          <p className="mt-4 text-zinc-400 text-base sm:text-lg">
            Switch between the Educator Dashboard to create, view, and summarize assignments, or the Student Portal for safe, verified uploads.
          </p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-xl bg-zinc-900 border border-zinc-800">
            <button
              onClick={() => setActiveRole("teacher")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeRole === "teacher"
                  ? "bg-white text-black shadow-lg"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <UserCheck className="h-4 w-4" />
              Teacher View
            </button>
            <button
              onClick={() => setActiveRole("student")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeRole === "student"
                  ? "bg-white text-black shadow-lg"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Student View (Safe Upload)
            </button>
          </div>
        </div>

        {/* Dynamic Sandbox Container */}
        <div className="rounded-2xl border border-zinc-800 bg-black p-6 sm:p-8 shadow-2xl relative">

          {/* ================= TEACHER ROLE ================= */}
          {activeRole === "teacher" && (
            <div className="space-y-6">
              {/* Teacher Sub Navigation */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setTeacherTab("create")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                      teacherTab === "create"
                        ? "bg-zinc-800 text-white border border-zinc-700"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <PlusCircle className="h-4 w-4" /> Create Assignment
                  </button>
                  <button
                    onClick={() => setTeacherTab("view")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                      teacherTab === "view"
                        ? "bg-zinc-800 text-white border border-zinc-700"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <FileText className="h-4 w-4" /> View Submissions ({assignments.length})
                  </button>
                  <button
                    onClick={() => setTeacherTab("summarize")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                      teacherTab === "summarize"
                        ? "bg-zinc-800 text-white border border-zinc-700"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Sparkles className="h-4 w-4 text-white" /> AI Summarizer
                  </button>
                </div>

                <div className="text-xs font-mono text-zinc-500 hidden sm:block">
                  Educator Mode: Active
                </div>
              </div>

              {/* Sub-tab 1: Create Assignment Form */}
              {teacherTab === "create" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <form onSubmit={handlePublishAssignment} className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-mono text-zinc-400 mb-1">ASSIGNMENT TITLE</label>
                        <input
                          type="text"
                          value={assignmentTitle}
                          onChange={(e) => setAssignmentTitle(e.target.value)}
                          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm text-white focus:border-white focus:outline-none"
                          placeholder="e.g. Data Structures & Algorithms - Assignment 2"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-zinc-400 mb-1">COURSE CODE</label>
                        <input
                          type="text"
                          value={courseCode}
                          onChange={(e) => setCourseCode(e.target.value)}
                          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm text-white focus:border-white focus:outline-none"
                          placeholder="CS-101"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-zinc-400 mb-1">DUE DATE & TIME</label>
                        <input
                          type="datetime-local"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm text-white focus:border-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-zinc-400 mb-1">SUBMISSION FORMAT</label>
                        <select className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm text-white focus:border-white focus:outline-none">
                          <option>PDF / Zip Document (.pdf, .zip)</option>
                          <option>Jupyter Notebook (.ipynb)</option>
                          <option>Source Code (.py, .cpp, .java)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-zinc-400 mb-1">INSTRUCTIONS & RUBRIC</label>
                      <textarea
                        rows={3}
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm text-white focus:border-white focus:outline-none"
                        placeholder="Detail grading criteria, format specifications..."
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-white" />
                        <div>
                          <p className="text-xs font-bold text-white">Enable Auto AI Submission Analytics</p>
                          <p className="text-[11px] text-zinc-400">Summarizes submissions into key insights automatically upon deadline.</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableAISummary}
                        onChange={(e) => setEnableAISummary(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 accent-white cursor-pointer"
                      />
                    </div>

                    <div className="pt-2 flex items-center gap-4">
                      <button
                        type="submit"
                        className="flex items-center gap-2 rounded-lg bg-white px-6 py-2.5 text-sm font-bold text-black hover:bg-zinc-200 transition-colors"
                      >
                        <PlusCircle className="h-4 w-4" /> Publish Assignment
                      </button>

                      {published && (
                        <span className="flex items-center gap-1.5 text-xs text-white bg-zinc-800 px-3 py-1.5 rounded-md border border-zinc-700 animate-in fade-in">
                          <CheckCircle className="h-4 w-4 text-white" /> Published Successfully!
                        </span>
                      )}
                    </div>
                  </form>

                  {/* Live Preview Card */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-zinc-500 font-mono mb-2">
                        <span>LIVE STUDENT PREVIEW</span>
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-white font-mono">{courseCode || "CS-101"}</span>
                      </div>
                      <h4 className="text-lg font-bold text-white leading-tight">{assignmentTitle || "Untitled Assignment"}</h4>
                      <p className="text-xs text-zinc-400 mt-2 line-clamp-3">{instructions || "No instructions provided."}</p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-zinc-800">
                      <div className="flex justify-between text-xs text-zinc-400 font-mono">
                        <span>DUE DATE:</span>
                        <span className="text-white">{dueDate ? new Date(dueDate).toLocaleDateString() : "TBD"}</span>
                      </div>
                      <div className="flex justify-between text-xs text-zinc-400 font-mono">
                        <span>SECURITY MODE:</span>
                        <span className="text-white flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-white" /> Encrypted Vault
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-zinc-400 font-mono">
                        <span>AI ANALYTICS:</span>
                        <span className="text-white">{enableAISummary ? "Enabled" : "Disabled"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 2: View Assignments List */}
              {teacherTab === "view" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-400 font-mono">ALL ACTIVE CLASS ASSIGNMENTS</p>
                    <button 
                      onClick={() => setTeacherTab("create")} 
                      className="text-xs font-semibold text-white underline hover:text-zinc-300"
                    >
                      + Create New
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {assignments.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                              {item.course}
                            </span>
                            <span className="text-xs font-mono text-zinc-400">Due: {item.dueDate}</span>
                          </div>
                          <h4 className="text-base font-bold text-white">{item.title}</h4>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm font-bold text-white font-mono">
                              {item.submissions} / {item.totalStudents}
                            </p>
                            <p className="text-[11px] text-zinc-400">Submissions</p>
                          </div>

                          <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-white font-mono">{item.avgGrade}</p>
                            <p className="text-[11px] text-zinc-400">Avg Performance</p>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedAssignmentId(item.id);
                              setTeacherTab("summarize");
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-xs font-bold text-white hover:bg-white hover:text-black transition-colors"
                          >
                            <Sparkles className="h-3.5 w-3.5" /> AI Summary
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-tab 3: AI Summarizer */}
              {teacherTab === "summarize" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
                    <div className="space-y-1">
                      <label className="block text-xs font-mono text-zinc-400">SELECT ASSIGNMENT TO SUMMARIZE</label>
                      <select
                        value={selectedAssignmentId}
                        onChange={(e) => setSelectedAssignmentId(Number(e.target.value))}
                        className="rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none"
                      >
                        {assignments.map((a) => (
                          <option key={a.id} value={a.id}>
                            [{a.course}] {a.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleRunAISummary}
                      disabled={isSummarizing}
                      className="flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-black hover:bg-zinc-200 disabled:opacity-50 transition-colors"
                    >
                      {isSummarizing ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" /> Synthesizing AI Insights...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" /> Generate Class AI Summary
                        </>
                      )}
                    </button>
                  </div>

                  {/* Summary Output */}
                  {summaryResult ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                      {/* Left Column: Key Stats & Grade Distribution */}
                      <div className="space-y-4">
                        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/60">
                          <p className="text-xs font-mono text-zinc-400 uppercase">Submission Rate</p>
                          <p className="text-3xl font-extrabold text-white mt-1 font-mono">{summaryResult.submissionRate}</p>
                          <p className="text-xs text-zinc-400 mt-1">{summaryResult.totalSubmissions} Student Uploads Verified</p>
                        </div>

                        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-3">
                          <p className="text-xs font-mono text-zinc-400 uppercase">Grade Distribution</p>
                          <div className="grid grid-cols-4 gap-2 text-center font-mono">
                            {Object.entries(summaryResult.gradeBreakdown).map(([grade, val]) => (
                              <div key={grade} className="p-2 rounded bg-zinc-800 border border-zinc-700">
                                <p className="text-xs text-zinc-400">{grade}</p>
                                <p className="text-sm font-bold text-white">{val}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Column: AI Analysis Bulletins */}
                      <div className="lg:col-span-2 space-y-4">
                        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/80 space-y-4">
                          <div className="flex items-center gap-2 text-xs font-mono text-white">
                            <Sparkles className="h-4 w-4 text-white" />
                            <span>AI INSIGHTS & SUBMISSION PATTERNS</span>
                          </div>

                          <div>
                            <h5 className="text-xs font-mono text-zinc-400 mb-2 uppercase">Key Class Strengths</h5>
                            <ul className="space-y-1.5">
                              {summaryResult.commonStrengths.map((str, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-200">
                                  <CheckCircle className="h-4 w-4 text-white shrink-0 mt-0.5" />
                                  <span>{str}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h5 className="text-xs font-mono text-zinc-400 mb-2 uppercase">Common Misconceptions</h5>
                            <ul className="space-y-1.5">
                              {summaryResult.areasForImprovement.map((area, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-300">
                                  <AlertCircle className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                                  <span>{area}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="pt-3 border-t border-zinc-800">
                            <p className="text-xs font-mono text-zinc-400 mb-1">SUGGESTED TEACHER ACTION</p>
                            <p className="text-xs sm:text-sm text-white font-medium bg-zinc-800 p-3 rounded-lg border border-zinc-700">
                              💡 {summaryResult.aiRecommendation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950">
                      <Sparkles className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
                      <p className="text-sm text-zinc-400">Click "Generate Class AI Summary" to run instant natural language synthesis of student submissions.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================= STUDENT ROLE ================= */}
          {activeRole === "student" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-white" /> Student Safe Submission Vault
                  </h3>
                  <p className="text-xs text-zinc-400">All uploads undergo end-to-end encryption, malware isolation, and timestamp hashing.</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-3 py-1 rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300">
                    AES-256 Protocol
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Box */}
                <div className="space-y-4">
                  <label className="block text-xs font-mono text-zinc-400">SELECT & UPLOAD ASSIGNMENT FILE</label>

                  <div
                    onClick={() => handleFileDrop("Quantum_Computing_Lab4_Submission.pdf")}
                    className="border-2 border-dashed border-zinc-700 hover:border-white rounded-xl p-8 text-center cursor-pointer transition-colors bg-zinc-900/40 group"
                  >
                    <UploadCloud className="h-10 w-10 text-zinc-400 group-hover:text-white mx-auto mb-3 transition-colors" />
                    <p className="text-sm font-semibold text-white">Click or drag file to upload safely</p>
                    <p className="text-xs text-zinc-400 mt-1">Supports PDF, DOCX, ZIP, IPYNB (Max 50MB)</p>
                    
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-800 text-xs font-mono text-zinc-300 border border-zinc-700">
                      Sample: Quantum_Computing_Lab4_Submission.pdf
                    </div>
                  </div>

                  {/* Sample File Triggers */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFileDrop("Raft_Consensus_Implementation.zip")}
                      className="text-xs font-mono text-zinc-400 hover:text-white underline"
                    >
                      Test with .zip sample
                    </button>
                    <span className="text-zinc-700">•</span>
                    <button
                      onClick={() => handleFileDrop("Neural_Net_Proof.ipynb")}
                      className="text-xs font-mono text-zinc-400 hover:text-white underline"
                    >
                      Test with .ipynb sample
                    </button>
                  </div>
                </div>

                {/* Live Scanning & Receipt Status */}
                <div className="space-y-4">
                  <label className="block text-xs font-mono text-zinc-400">SECURITY AUDIT & TIMESTAMP RECEIPT</label>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
                    {uploadedFile ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-white" />
                            <span className="text-sm font-bold text-white">{uploadedFile}</span>
                          </div>
                          <span className="text-xs font-mono text-zinc-400">{uploadProgress}%</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-white h-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>

                        {/* Security Check List */}
                        <div className="space-y-2 pt-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-400 flex items-center gap-1.5">
                              <Lock className="h-3.5 w-3.5 text-zinc-400" /> End-to-End AES-256 Encryption
                            </span>
                            <span className="font-mono text-white">
                              {securityChecks.encryption ? "PASSED" : "CHECKING..."}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-400 flex items-center gap-1.5">
                              <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" /> Malware & Virus Zero-Day Isolation
                            </span>
                            <span className="font-mono text-white">
                              {securityChecks.malware ? "PASSED" : "PENDING..."}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-400 flex items-center gap-1.5">
                              <FileCheck className="h-3.5 w-3.5 text-zinc-400" /> Anti-Plagiarism Similarity Check
                            </span>
                            <span className="font-mono text-white">
                              {securityChecks.plagiarism ? "PASSED (0.4% MATCH)" : "PENDING..."}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-400 flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-zinc-400" /> Cryptographic Timestamp Receipt
                            </span>
                            <span className="font-mono text-white">
                              {securityChecks.timestamp ? "GENERATE RECEIPT" : "WAITING..."}
                            </span>
                          </div>
                        </div>

                        {/* Final Receipt */}
                        {uploadReceipt && (
                          <div className="mt-4 p-4 rounded-lg bg-black border border-zinc-700 space-y-2 animate-in fade-in">
                            <div className="flex items-center justify-between text-xs font-mono text-white border-b border-zinc-800 pb-2">
                              <span className="flex items-center gap-1.5 font-bold">
                                <CheckCircle className="h-4 w-4 text-white" /> SUBMISSION VERIFIED
                              </span>
                              <span>{uploadReceipt.status}</span>
                            </div>
                            <div className="text-[11px] font-mono text-zinc-400 space-y-1 pt-1">
                              <p>RECEIPT HASH: <span className="text-zinc-200">{uploadReceipt.hash}</span></p>
                              <p>TIMESTAMP: <span className="text-zinc-200">{uploadReceipt.timestamp}</span></p>
                              <p>CONFIRMATION: <span className="text-white">Tamper-Proof Receipt Saved to Student Vault</span></p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="py-8 text-center text-zinc-500">
                        <Lock className="h-6 w-6 text-zinc-700 mx-auto mb-2" />
                        <p className="text-xs">No file selected yet. Click the upload area to test the security pipeline.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
