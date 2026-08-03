"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Clock, 
  LogOut, 
  ExternalLink,
  AlertCircle,
  PlusCircle,
  FileCheck,
  Check,
  Sparkles,
  Eye,
  X,
  Trash2
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function StudentHomePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [studentUser, setStudentUser] = useState({ name: "Student", email: "student@university.edu" });

  // 6-Digit Join Code State
  const [inputCode, setInputCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState("");

  // History State
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Upload Modal State
  const [uploadModalItem, setUploadModalItem] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");

  // Delete State
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("globalassign_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setStudentUser(parsed);
      } catch (e) {}
    }

    fetchStudentHistory();
  }, []);

  const fetchStudentHistory = async () => {
    setLoadingHistory(true);
    const token = localStorage.getItem("globalassign_token");

    try {
      if (token) {
        const res = await fetch(`${API_BASE_URL}/api/assignments/student/history`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setHistory(json.data);
            setLoadingHistory(false);
            return;
          }
        }
      }
    } catch (err) {
      console.error("Error fetching student history:", err);
    }

    setHistory([]);
    setLoadingHistory(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("globalassign_token");
    localStorage.removeItem("globalassign_user");
    router.push("/");
  };

  // 1. Join Assignment via Code
  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!inputCode || inputCode.length < 6) {
      setJoinError("Please enter a valid 6-digit class code.");
      return;
    }

    setJoining(true);
    setJoinError("");
    setJoinSuccess("");

    try {
      const token = localStorage.getItem("globalassign_token");
      const res = await fetch(`${API_BASE_URL}/api/assignments/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ assignmentCode: inputCode.trim() })
      });
      const json = await res.json();

      if (json.success && json.data) {
        setJoinSuccess(`Successfully joined "${json.data.title}"! Status stored as "Joined".`);
        setInputCode("");
        fetchStudentHistory();
      } else {
        setJoinError(json.error || json.message || "Invalid assignment code or assignment is inactive.");
      }
    } catch (err) {
      setJoinError("Failed to join assignment. Please verify connection.");
    } finally {
      setJoining(false);
    }
  };

  // 2. Open Upload Modal
  const handleOpenUploadModal = (item) => {
    setUploadModalItem(item);
    setSelectedFile(null);
    setUploadError("");
    setUploadProgress(0);
  };

  const handleSelectDeviceFile = (e) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  // 3. Upload File to S3
  const handleExecuteUpload = async () => {
    if (!selectedFile || !uploadModalItem) return;

    setUploading(true);
    setUploadProgress(30);
    setUploadError("");

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev < 85 ? prev + 15 : prev));
    }, 200);

    const token = localStorage.getItem("globalassign_token");
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("fileName", selectedFile.name);

    try {
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const assignmentId = uploadModalItem.assignmentId || uploadModalItem.id;
      const res = await fetch(`${API_BASE_URL}/api/assignments/${assignmentId}/upload`, {
        method: "POST",
        headers,
        body: formData
      });

      clearInterval(progressInterval);
      const json = await res.json();

      if (json.success) {
        setUploadProgress(100);
        setTimeout(() => {
          setUploading(false);
          setUploadModalItem(null);
          setSelectedFile(null);
          fetchStudentHistory();
        }, 400);
      } else {
        throw new Error(json.error || "Upload failed");
      }
    } catch (err) {
      clearInterval(progressInterval);
      setUploading(false);
      setUploadError(err.message || "Failed to upload file. Please try again.");
    }
  };

  // 4. Remove / Delete Submission
  const handleDeleteSubmission = async (submissionId) => {
    if (!submissionId) return;
    if (!confirm("Are you sure you want to remove this uploaded file? Your status will revert to Joined.")) {
      return;
    }

    setDeletingId(submissionId);
    const token = localStorage.getItem("globalassign_token");

    try {
      const res = await fetch(`${API_BASE_URL}/api/assignments/submissions/${submissionId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const json = await res.json();
      if (json.success) {
        fetchStudentHistory();
      } else {
        alert(json.error || "Failed to remove submission.");
      }
    } catch (err) {
      alert("Error connecting to server to remove submission.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans relative selection:bg-white selection:text-black">
      <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleSelectDeviceFile}
        className="hidden"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,.txt"
      />

      {/* Compact Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-black/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-white text-black flex items-center justify-center font-extrabold text-xs">
              GA
            </div>
            <span className="text-sm font-bold text-white tracking-tight">GlobalAssign Student</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right font-mono text-[11px]">
              <span className="text-zinc-200 font-medium">{studentUser.name || studentUser.fullName}</span>
              <span className="text-zinc-500 text-[10px]">{studentUser.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white hover:text-black transition-all active:scale-95"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 mx-auto max-w-6xl w-full p-4 sm:p-6 space-y-6 relative z-10">
        
        {/* COMPACT JOIN ASSIGNMENT CARD (No AES-256 Tag) */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-white text-black flex items-center justify-center font-bold shrink-0">
              <PlusCircle className="h-4 w-4 text-black" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Join New Assignment</h2>
              <p className="text-xs text-zinc-400">Enter your teacher's 6-digit class code to join.</p>
            </div>
          </div>

          <form onSubmit={handleJoinByCode} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                maxLength={6}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit code e.g. 849201"
                className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-base font-mono tracking-widest text-white focus:border-zinc-500 focus:outline-none uppercase"
              />
              <button
                type="submit"
                disabled={joining}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-white px-6 py-2 text-xs font-bold text-black hover:bg-zinc-200 disabled:opacity-50 transition-all active:scale-95 shrink-0"
              >
                {joining ? "Joining..." : "Join Assignment"}
              </button>
            </div>

            {joinError && (
              <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-red-400 flex items-center gap-2 font-mono">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{joinError}</span>
              </div>
            )}

            {joinSuccess && (
              <div className="p-2.5 rounded-lg bg-white text-black font-bold text-xs flex items-center gap-2 font-mono shadow-md">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-black" />
                <span>{joinSuccess}</span>
              </div>
            )}
          </form>
        </div>

        {/* ELEGANT MINIMAL SUBMISSION HISTORY TABLE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Assignment History</h3>
              <p className="text-xs text-zinc-400">Track assignment name, deadline, status, and turn-ins.</p>
            </div>
            <span className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
              Items: {history.length}
            </span>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
            {loadingHistory ? (
              <div className="p-8 text-center text-zinc-500 font-mono text-xs">
                Loading history...
              </div>
            ) : history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-black text-zinc-400 uppercase border-b border-zinc-800 text-[11px]">
                    <tr>
                      <th scope="col" className="px-5 py-3 font-semibold">Assignment Name</th>
                      <th scope="col" className="px-5 py-3 font-semibold">Deadline</th>
                      <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                      <th scope="col" className="px-5 py-3 font-semibold">Submitted File</th>
                      <th scope="col" className="px-5 py-3 font-semibold">Remark</th>
                      <th scope="col" className="px-5 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {history.map((item, index) => (
                      <tr key={item.id || item._id || index} className="hover:bg-zinc-900/40 transition-colors">
                        
                        {/* Assignment Name */}
                        <td className="px-5 py-3.5 font-sans font-semibold text-white">
                          <div className="text-xs">{item.title}</div>
                          <span className="text-[11px] font-mono text-zinc-500">Code: {item.code || "849201"}</span>
                        </td>

                        {/* Deadline & Remaining Time */}
                        <td className="px-5 py-3.5 text-zinc-300">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                            <span className={item.remainingDays?.includes("Overdue") ? "text-red-400 font-bold" : "text-white"}>
                              {item.remainingDays || "No deadline"}
                            </span>
                          </div>
                        </td>

                        {/* Status (Joined / Uploaded / Graded) */}
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono border ${
                            item.status === "Uploaded"
                              ? "bg-white text-black border-white"
                              : item.status === "Graded"
                              ? "bg-zinc-200 text-black border-zinc-300"
                              : "bg-zinc-900 text-amber-400 border-amber-900/40"
                          }`}>
                            {item.status === "Uploaded" && <Check className="h-3 w-3 text-black" />}
                            {item.status === "Graded" && <Sparkles className="h-3 w-3 text-black" />}
                            {item.status === "Joined" && <span className="text-amber-400">●</span>}
                            <span>{item.status || (item.hasSubmitted ? "Uploaded" : "Joined")}</span>
                          </span>
                        </td>

                        {/* Submitted File Details */}
                        <td className="px-5 py-3.5 text-zinc-300">
                          {item.fileName ? (
                            <div className="flex items-center gap-1.5 text-white font-medium">
                              <FileText className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                              <span className="truncate max-w-[140px]">{item.fileName}</span>
                            </div>
                          ) : (
                            <span className="text-zinc-600 italic">Not uploaded</span>
                          )}
                        </td>

                        {/* Teacher Remark */}
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold font-mono border ${
                            item.remark === "Pass"
                              ? "bg-white text-black border-white"
                              : item.remark === "Fail"
                              ? "bg-zinc-900 text-red-400 border-zinc-800"
                              : item.remark === "Checked"
                              ? "bg-zinc-800 text-zinc-200 border-zinc-700"
                              : "bg-zinc-900 text-zinc-500 border-zinc-800"
                          }`}>
                            {item.remark || "Unchecked"}
                          </span>
                        </td>

                        {/* Actions (View File / Upload File / Remove File) */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="inline-flex items-center gap-2 justify-end">
                            {item.hasSubmitted || item.fileUrl ? (
                              <>
                                {/* VIEW FILE BUTTON (Label: "View File") */}
                                <a
                                  href={item.presignedUrl || item.viewUrl || item.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-xs font-semibold text-white hover:bg-white hover:text-black transition-all active:scale-95"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>View File</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>

                                {/* REMOVE / DELETE SUBMISSION BUTTON */}
                                <button
                                  disabled={deletingId === item.id}
                                  onClick={() => handleDeleteSubmission(item.id)}
                                  title="Remove Uploaded File"
                                  className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-red-600 hover:bg-red-950/40 hover:text-red-400 transition-all active:scale-95"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleOpenUploadModal(item)}
                                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all active:scale-95"
                              >
                                <UploadCloud className="h-3.5 w-3.5" />
                                <span>Upload File</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500 font-mono text-xs space-y-1">
                <FileCheck className="h-6 w-6 text-zinc-600 mx-auto mb-1" />
                <p className="text-white font-bold text-xs">No joined assignments yet</p>
                <p className="text-zinc-500 text-[11px]">Enter a 6-digit class code above to join an assignment.</p>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* COMPACT UPLOAD FILE MODAL */}
      {uploadModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl overflow-hidden relative">
            
            <div className="flex items-center justify-between border-b border-zinc-800 p-4 bg-black">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-white text-black flex items-center justify-center font-bold shrink-0">
                  <UploadCloud className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">[ UPLOAD ASSIGNMENT ]</span>
                  <h3 className="text-sm font-bold text-white leading-tight">{uploadModalItem.title}</h3>
                </div>
              </div>

              <button
                onClick={() => setUploadModalItem(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-xs space-y-1">
                <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                  <span>Code: <strong className="text-white">{uploadModalItem.code}</strong></span>
                  <span className="text-white font-bold">{uploadModalItem.remainingDays}</span>
                </div>
                <p className="text-zinc-400 text-[11px] mt-1">{uploadModalItem.description || "Select a file to submit."}</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-zinc-400 uppercase">
                  CHOOSE FILE FROM DEVICE *
                </label>
                <input
                  type="file"
                  onChange={handleSelectDeviceFile}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,.txt"
                  className="w-full text-xs font-mono text-zinc-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white file:text-black hover:file:bg-zinc-200 cursor-pointer rounded-xl bg-zinc-900 p-1.5 border border-zinc-800"
                />
              </div>

              {selectedFile && (
                <div className="p-2.5 rounded-lg bg-black border border-zinc-800 text-xs font-mono text-white flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-white shrink-0" />
                  <span className="truncate">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}

              {uploadError && (
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-red-400 flex items-center gap-2 font-mono">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploading && (
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-white">
                    <span>UPLOADING TO S3...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-white h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              <div className="pt-1 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setUploadModalItem(null)}
                  className="flex-1 py-2 rounded-xl border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedFile || uploading}
                  onClick={handleExecuteUpload}
                  className="flex-1 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 disabled:opacity-50 transition-all shadow-md"
                >
                  {uploading ? "Uploading..." : "Submit File"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
