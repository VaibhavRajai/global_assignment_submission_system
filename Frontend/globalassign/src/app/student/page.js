"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Lock, 
  Clock, 
  LogOut, 
  Key,
  ExternalLink,
  AlertCircle,
  PlusCircle,
  XCircle,
  Check
} from "lucide-react";

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

  // Student Submission History with Remarks (Unchecked, Checked, Pass, Fail)
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
    },
    {
      id: "sub_103",
      title: "Neural Network Calculus Derivations",
      code: "312908",
      fileName: "Neural_Net_Proof.ipynb",
      fileUrl: "https://globalassign-submissions-bucket.s3.us-east-1.amazonaws.com/submissions/1721400000_Neural_Net_Proof.ipynb",
      fileHash: "0xE1D4A8C9",
      uploadedAt: "Jul 15, 2026, 18:40",
      remark: "Unchecked"
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
      const res = await fetch(`http://localhost:5000/api/assignments/code/${inputCode.trim()}`);
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

  // 2. Upload Assignment & Append to History with "Unchecked" Remark
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
      const res = await fetch(`http://localhost:5000/api/assignments/${activeAssignment.id}/upload`, {
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

    // Add newly uploaded assignment to student history below!
    setHistory([createdSubmission, ...history]);
    setActiveAssignment(null);
    setInputCode("");
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black flex flex-col font-sans">
      
      {/* Student Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-white flex items-center justify-center font-extrabold text-black text-sm">
                GA
              </div>
              <span className="text-base font-bold text-white">GlobalAssign</span>
            </Link>
            <span className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-full border border-zinc-700">
              Student Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-white">{studentUser.name}</span>
              <span className="text-[11px] font-mono text-zinc-400">STU-9942</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-10 px-6 mx-auto max-w-6xl w-full space-y-12">
        
        {/* ================= TOP SECTION: + UPLOAD & JOIN ================= */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 space-y-6 shadow-2xl">
          
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <span className="text-xs font-mono text-zinc-400 uppercase">[ STUDENT ACTIONS ]</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5 flex items-center gap-2">
                <PlusCircle className="h-6 w-6 text-white" /> + Upload Assignment
              </h1>
            </div>
            <span className="text-xs font-mono text-zinc-400 hidden sm:inline">AES-256 S3 Storage</span>
          </div>

          {/* Join via Code Input Bar */}
          <form onSubmit={handleJoinByCode} className="space-y-3">
            <label className="block text-xs font-mono text-zinc-400">ENTER 6-DIGIT CLASS CODE TO JOIN ASSIGNMENT</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                maxLength={6}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ""))}
                placeholder="e.g. 849201"
                className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-5 py-3 text-lg font-mono tracking-widest text-white focus:border-white focus:outline-none uppercase"
              />
              <button
                type="submit"
                disabled={joining}
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3 text-sm font-bold text-black hover:bg-zinc-200 disabled:opacity-50 transition-colors shadow-lg"
              >
                {joining ? "Finding..." : "Find Assignment"}
              </button>
            </div>

            {joinError && (
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-white shrink-0" />
                <span>{joinError}</span>
              </div>
            )}
          </form>

          {/* Upload File Zone (Appears when assignment joined) */}
          {activeAssignment && (
            <div className="pt-4 border-t border-zinc-800 space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white font-bold">{activeAssignment.title}</span>
                  <span className="text-zinc-400">Code: {activeAssignment.code}</span>
                </div>
                <p className="text-xs text-zinc-400">{activeAssignment.description || "Submit your completed assignment file."}</p>
              </div>

              <div
                onClick={() => handleUploadFile("Quantum_Assignment_AlexChen.pdf")}
                className="border-2 border-dashed border-zinc-700 hover:border-white rounded-xl p-8 text-center cursor-pointer transition-colors bg-black group"
              >
                <UploadCloud className="h-10 w-10 text-zinc-400 group-hover:text-white mx-auto mb-3 transition-colors" />
                <p className="text-sm font-semibold text-white">Click or drag assignment file to upload to S3</p>
                <p className="text-xs text-zinc-400 mt-1">S3 URL will be stored in backend database</p>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded bg-zinc-900 text-xs font-mono text-zinc-300 border border-zinc-800">
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

        {/* ================= BELOW SECTION: SUBMISSION HISTORY & REMARKS ================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Submission History & Remarks</h2>
              <p className="text-xs text-zinc-400">View your past uploaded assignments, stored S3 URLs, and teacher grading remarks.</p>
            </div>
            <span className="text-xs font-mono text-zinc-400">{history.length} Past Submissions</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-900/80 text-xs font-mono uppercase text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th scope="col" className="px-6 py-4">Assignment & Code</th>
                  <th scope="col" className="px-6 py-4">Submitted File (S3 Link)</th>
                  <th scope="col" className="px-6 py-4">Upload Date</th>
                  <th scope="col" className="px-6 py-4">Receipt Hash</th>
                  <th scope="col" className="px-6 py-4 text-right">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {history.length > 0 ? (
                  history.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-900/50 transition-colors">
                      {/* Assignment & Code */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="font-bold text-white text-sm">{item.title}</p>
                          <span className="inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                            Code: {item.code}
                          </span>
                        </div>
                      </td>

                      {/* File Name & S3 Link */}
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

                      {/* Upload Date */}
                      <td className="px-6 py-4 font-mono text-xs text-zinc-400">
                        {item.uploadedAt}
                      </td>

                      {/* Receipt Hash */}
                      <td className="px-6 py-4 font-mono text-xs text-zinc-400">
                        {item.fileHash}
                      </td>

                      {/* REMARKS: (Unchecked, Checked, Pass, Fail) */}
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full border font-bold ${
                          item.remark === "Pass"
                            ? "bg-white text-black border-white"
                            : item.remark === "Fail"
                            ? "bg-zinc-900 text-white border-zinc-700"
                            : item.remark === "Checked"
                            ? "bg-zinc-800 text-zinc-200 border-zinc-700"
                            : "bg-zinc-900 text-zinc-400 border-zinc-800" // Unchecked
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
        </div>

      </main>

      <footer className="border-t border-zinc-800 py-6 text-center text-xs font-mono text-zinc-500">
        GlobalAssign Student Portal • AWS S3 Stored URLs & Remarks
      </footer>
    </div>
  );
}
