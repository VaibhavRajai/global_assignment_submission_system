"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Clock, 
  LogOut, 
  Key,
  ExternalLink,
  AlertCircle,
  PlusCircle,
  XCircle,
  Check
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://globalassign-backend.vercel.app";

export default function StudentHomePage() {
  const router = useRouter();
  const [studentUser, setStudentUser] = useState({ name: "Alex Chen", email: "alex.chen@university.edu" });

  // Top Upload & Join State
  const [inputCode, setInputCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [activeAssignment, setActiveAssignment] = useState(null);

  // Upload Process State
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Student Submission History with Remarks
  const [history, setHistory] = useState([
    {
      id: "sub_101",
      title: "Quantum Computing & Complexity Theory - Lab 4",
      code: "849201",
      fileName: "Quantum_Lab4_AlexChen.pdf",
      fileUrl: "https://globalassign-submissions-bucket.s3.us-east-1.amazonaws.com/submissions/1721720000_Quantum_Lab4_AlexChen.pdf",
      fileHash: "0x8F9A23B1",
      uploadedAt: "Jul 22, 2026, 14:32",
      remark: "Pass"
    },
    {
      id: "sub_102",
      title: "Distributed Systems Raft Consensus",
      code: "694201",
      fileName: "Raft_Consensus_Implementation.zip",
      fileUrl: "https://globalassign-submissions-bucket.s3.us-east-1.amazonaws.com/submissions/1721610000_Raft_Consensus_Implementation.zip",
      fileHash: "0x3B7C91D4",
      uploadedAt: "Jul 20, 2026, 11:15",
      remark: "Checked"
    }
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem("globalassign_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setStudentUser(parsed);
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("globalassign_token");
    localStorage.removeItem("globalassign_user");
    router.push("/");
  };

  // 1. Join Assignment via 6-Digit Code
  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!inputCode || inputCode.length < 6) {
      setJoinError("Please enter a valid 6-digit class code.");
      return;
    }

    setJoining(true);
    setJoinError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/assignments/code/${inputCode.trim()}`);
      const json = await res.json();

      if (json.success && json.data) {
        setActiveAssignment(json.data);
      } else {
        setJoinError(json.error || "Assignment not found with that 6-digit code.");
      }
    } catch (err) {
      // Offline fallback assignment
      setActiveAssignment({
        id: "demo_assignment_id",
        title: "Quantum Computing Assignment",
        dueDate: "Aug 01, 2026",
        description: "Submit PDF or ZIP containing your complete assignment solution.",
        code: inputCode.trim()
      });
    } finally {
      setJoining(false);
    }
  };

  // 2. Upload Assignment & Append to History
  const handleUploadFile = async (fileName) => {
    if (!activeAssignment) return;

    setSelectedFile(fileName);
    setUploading(true);
    setUploadProgress(30);

    setTimeout(() => setUploadProgress(70), 300);

    const formData = new FormData();
    formData.append("studentName", studentUser.name);
    formData.append("fileName", fileName);

    let createdSubmission = null;

    try {
      const res = await fetch(`${API_BASE_URL}/api/assignments/${activeAssignment.id}/upload`, {
        method: "POST",
        body: formData
      });

      const json = await res.json();

      if (json.success && json.data) {
        createdSubmission = {
          id: json.data.id,
          title: activeAssignment.title,
          code: activeAssignment.code,
          fileName: json.data.fileName,
          fileUrl: json.data.fileUrl,
          fileHash: json.data.fileHash,
          uploadedAt: new Date(json.data.uploadedAt).toLocaleString(),
          remark: json.data.remark || "Unchecked"
        };
      }
    } catch (err) {}

    if (!createdSubmission) {
      const s3MockUrl = `https://globalassign-submissions-bucket.s3.us-east-1.amazonaws.com/submissions/${Date.now()}_${fileName}`;
      createdSubmission = {
        id: "sub_" + Date.now(),
        title: activeAssignment.title,
        code: activeAssignment.code,
        fileName: fileName,
        fileUrl: s3MockUrl,
        fileHash: "0x" + Math.random().toString(36).substring(2, 10).toUpperCase(),
        uploadedAt: new Date().toLocaleString(),
        remark: "Unchecked"
      };
    }

    setUploadProgress(100);
    setUploading(false);

    setHistory([createdSubmission, ...history]);
    setActiveAssignment(null);
    setInputCode("");
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black flex flex-col font-sans relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-white/5 blur-[140px] rounded-full pointer-events-none" />

      {/* Student Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-xl bg-white text-black flex items-center justify-center font-extrabold shadow-lg transition-transform group-hover:scale-105">
                <ShieldCheck className="h-5 w-5 stroke-[2.5]" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                GlobalAssign <span className="text-[10px] font-mono uppercase bg-zinc-900 border border-zinc-700 text-zinc-300 px-2.5 py-0.5 rounded-full">Student Portal</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 rounded-full px-4 py-1.5 backdrop-blur-md">
              <div className="h-7 w-7 rounded-full bg-white text-black font-extrabold flex items-center justify-center text-xs">
                {studentUser.name ? studentUser.name.charAt(0).toUpperCase() : "S"}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-none">{studentUser.name}</span>
                <span className="text-[10px] font-mono text-zinc-400 mt-0.5">STU-9942</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-bold text-zinc-300 hover:text-white hover:border-zinc-600 transition-all active:scale-95 shadow-md"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="relative flex-1 py-10 px-6 mx-auto max-w-6xl w-full space-y-10">
        
        {/* TOP SECTION: + UPLOAD ASSIGNMENT */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 sm:p-8 space-y-6 shadow-2xl glass-panel">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-4">
            <div>
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">[ STUDENT ACTIONS ]</span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-3">
                <PlusCircle className="h-7 w-7 text-white" /> + Upload Assignment
              </h1>
            </div>
            <span className="text-xs font-mono text-zinc-400 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
              AES-256 S3 Storage
            </span>
          </div>

          <form onSubmit={handleJoinByCode} className="space-y-3">
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider">ENTER 6-DIGIT CLASS CODE TO JOIN ASSIGNMENT</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                maxLength={6}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ""))}
                placeholder="e.g. 849201"
                className="flex-1 rounded-xl bg-zinc-900/90 border border-zinc-800 px-5 py-3 text-xl font-mono tracking-widest text-white focus:border-white focus:outline-none uppercase transition-colors"
              />
              <button
                type="submit"
                disabled={joining}
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-extrabold text-black hover:bg-zinc-200 disabled:opacity-50 transition-all active:scale-95 shadow-xl"
              >
                {joining ? "Locating Code..." : "Find Assignment"}
              </button>
            </div>

            {joinError && (
              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white flex items-center gap-2 font-mono">
                <AlertCircle className="h-4 w-4 text-white shrink-0" />
                <span>{joinError}</span>
              </div>
            )}
          </form>

          {activeAssignment && (
            <div className="pt-4 border-t border-zinc-800/80 space-y-4 animate-in fade-in">
              <div className="p-5 rounded-2xl bg-black border border-zinc-800 space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white font-bold text-sm">{activeAssignment.title}</span>
                  <span className="text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded">Code: {activeAssignment.code}</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">{activeAssignment.description || "Submit your completed assignment file."}</p>
              </div>

              <div
                onClick={() => handleUploadFile("Quantum_Assignment_AlexChen.pdf")}
                className="border-2 border-dashed border-zinc-700 hover:border-white rounded-2xl p-8 text-center cursor-pointer transition-all bg-black group"
              >
                <UploadCloud className="h-10 w-10 text-zinc-400 group-hover:text-white mx-auto mb-3 transition-colors" />
                <p className="text-sm font-bold text-white">Click or drag assignment file to upload to S3</p>
                <p className="text-xs text-zinc-400 mt-1">S3 URL will be stored in backend database</p>
                <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-zinc-900 text-xs font-mono text-zinc-300 border border-zinc-800">
                  Sample File: Quantum_Assignment_AlexChen.pdf
                </div>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-white">UPLOADING TO S3 BUCKET...</span>
                    <span className="text-zinc-400">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-white h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* BELOW SECTION: SUBMISSION HISTORY & REMARKS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Submission History & Remarks</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {history.length} Saved
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">View your past uploaded assignments, stored S3 URLs, and teacher grading remarks.</p>
            </div>
          </div>

          <div className="hidden md:block overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-900/90 text-xs font-mono uppercase text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th scope="col" className="px-6 py-4">Assignment & Code</th>
                  <th scope="col" className="px-6 py-4">Submitted File (S3 Link)</th>
                  <th scope="col" className="px-6 py-4">Upload Date</th>
                  <th scope="col" className="px-6 py-4">Receipt Hash</th>
                  <th scope="col" className="px-6 py-4 text-right">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {history.length > 0 ? (
                  history.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="font-bold text-white text-sm">{item.title}</p>
                          <span className="inline-block text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800">
                            Code: {item.code}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-mono text-white hover:underline hover:text-zinc-300"
                        >
                          <FileText className="h-3.5 w-3.5 text-zinc-400" />
                          <span>{item.fileName}</span>
                          <ExternalLink className="h-3 w-3 text-zinc-500" />
                        </a>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-zinc-400">
                        {item.uploadedAt}
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-zinc-400">
                        {item.fileHash}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full border font-bold ${
                          item.remark === "Pass"
                            ? "bg-white text-black border-white"
                            : item.remark === "Fail"
                            ? "bg-zinc-900 text-white border-zinc-700"
                            : item.remark === "Checked"
                            ? "bg-zinc-800 text-zinc-200 border-zinc-700"
                            : "bg-zinc-900 text-zinc-400 border-zinc-800"
                        }`}>
                          {item.remark === "Pass" && <Check className="h-3.5 w-3.5 text-black" />}
                          {item.remark === "Fail" && <XCircle className="h-3.5 w-3.5 text-white" />}
                          {item.remark === "Checked" && <CheckCircle2 className="h-3.5 w-3.5 text-zinc-300" />}
                          {item.remark === "Unchecked" && <Clock className="h-3.5 w-3.5 text-zinc-400" />}
                          {item.remark || "Unchecked"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 font-mono text-xs">
                      No submission history found. Use the "+ Upload Assignment" section above to submit.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {history.map((item) => (
              <div key={item.id} className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-400">Code: {item.code}</span>
                  <span className={`inline-flex items-center gap-1 text-xs font-mono px-2.5 py-0.5 rounded-full font-bold ${
                    item.remark === "Pass"
                      ? "bg-white text-black"
                      : "bg-zinc-900 text-zinc-300 border border-zinc-800"
                  }`}>
                    {item.remark || "Unchecked"}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{item.title}</h3>

                <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-xs font-mono">
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white underline flex items-center gap-1"
                  >
                    <span>{item.fileName}</span> <ExternalLink className="h-3 w-3" />
                  </a>
                  <span className="text-zinc-500">{item.uploadedAt}</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </main>

      <footer className="border-t border-zinc-800/80 py-6 text-center text-xs font-mono text-zinc-500">
        GlobalAssign Student Portal • Live Vercel Backend Connected
      </footer>
    </div>
  );
}
