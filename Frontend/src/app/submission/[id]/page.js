"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Search, 
  FileText, 
  User, 
  Clock, 
  Send, 
  Bot, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  ExternalLink,
  Sparkles,
  RefreshCw,
  Eye,
  Check,
  X
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

export default function AssignmentSubmissionsPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const assignmentId = unwrappedParams.id;

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mode 1: Search in Submissions List
  const [studentSearch, setStudentSearch] = useState("");

  // Mode 1: Edit Assignment Modal/State
  const [isEditingAssignment, setIsEditingAssignment] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Mode 2: Selected Student Submission Inspection (Left Chatbot + Right Document Viewer)
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Chatbot State for Selected Submission
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [activeRemark, setActiveRemark] = useState("Unchecked");
  const [mobileViewTab, setMobileViewTab] = useState("chat"); // "chat" or "viewer" on mobile screens

  useEffect(() => {
    fetchAssignmentDetails();
  }, [assignmentId]);

  const fetchAssignmentDetails = async () => {
    setLoading(true);
    const token = localStorage.getItem("globalassign_token");

    try {
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/api/assignments/${assignmentId}`, { headers });
      const json = await res.json();

      if (json.success && json.data) {
        setAssignment(json.data);
        setSubmissions(json.data.submissions || []);
        setEditTitle(json.data.title || "");
        setEditDescription(json.data.description || "");
        setEditDueDate(json.data.dueDate ? json.data.dueDate.split("T")[0] : "");
      }
    } catch (err) {
      console.error("Error fetching assignment details:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Editing Assignment Details
  const handleSaveAssignmentEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    const token = localStorage.getItem("globalassign_token");

    try {
      const res = await fetch(`${API_BASE_URL}/api/assignments/${assignmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          dueDate: editDueDate
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAssignment((prev) => ({ ...prev, ...json.data }));
        setIsEditingAssignment(false);
      }
    } catch (err) {
      alert("Failed to update assignment details.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Open Inspection Mode for a Student Submission
  const handleSelectSubmission = (sub) => {
    setSelectedSubmission(sub);
    setActiveRemark(sub.remark || "Unchecked");

    const studentName = sub.studentName || sub.student?.fullName || "Student";
    const docId = sub.id || sub._id || "submission_doc";
    const docText = sub.data || sub.extractedText || "";
    const fileUrl = sub.presignedUrl || sub.viewUrl || sub.fileUrl || "";

    // Non-blocking background pre-indexing call (pre-embeds before teacher asks question)
    fetch(`${FASTAPI_URL}/api/v1/rag/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        doc_id: String(docId),
        text: docText,
        file_url: fileUrl,
        title: sub.fileName || ""
      })
    }).catch(() => {});

    setChatMessages([
      {
        sender: "bot",
        text: `AI Assistant Ready for ${studentName}'s Submission\n\nFile: ${sub.fileName}\n\nAsk any question about this document to check topics, verify skills, or summarize content.`
      }
    ]);
  };


  // Handle Chatbot User Input with RAG Microservice (ChromaDB + HuggingFace + Gemini AI)
  const handleSendChatMessage = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || isAiThinking) return;

    const userText = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setChatInput("");
    setIsAiThinking(true);

    try {
      const docId = selectedSubmission?.id || selectedSubmission?._id || "submission_doc";
      const docText = selectedSubmission?.data || selectedSubmission?.extractedText || "";
      const fileUrl = selectedSubmission?.presignedUrl || selectedSubmission?.viewUrl || selectedSubmission?.fileUrl || "";

      // Clean timeout using Promise.race (prevents Next.js AbortSignal errors)
      const fetchPromise = fetch(`${FASTAPI_URL}/api/v1/rag/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          doc_id: String(docId),
          text: docText,
          file_url: fileUrl,
          query: userText
        })
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("TimeoutError")), 35000)
      );

      const res = await Promise.race([fetchPromise, timeoutPromise]);
      const json = await res.json();

      if (json && json.answer) {
        setChatMessages((prev) => [...prev, { sender: "bot", text: json.answer }]);
      } else if (json && json.detail) {
        setChatMessages((prev) => [
          ...prev, 
          { sender: "bot", text: `⚠️ **RAG Error:** ${typeof json.detail === 'string' ? json.detail : JSON.stringify(json.detail)}` }
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev, 
          { sender: "bot", text: "⚠️ Unable to process document query at this time." }
        ]);
      }
    } catch (err) {
      console.error("Error querying RAG microservice:", err);
      if (err.message === 'TimeoutError') {
        setChatMessages((prev) => [
          ...prev,
          { 
            sender: "bot", 
            text: `⏱️ **Timeout Error:** The AI query took longer than 35 seconds to respond. Please try sending your question again.` 
          }
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { 
            sender: "bot", 
            text: `🤖 **RAG Service Offline:** Could not connect to RAG backend at \`${FASTAPI_URL}\`.\n\nPlease start the FastAPI server (\`python -m uvicorn main:app --reload\`) from the \`FastAPI\` directory.` 
          }
        ]);
      }
    } finally {
      setIsAiThinking(false);
    }
  };

  // Handle Updating Remark
  const handleUpdateRemark = async (remark) => {
    if (!selectedSubmission) return;
    setActiveRemark(remark);

    const token = localStorage.getItem("globalassign_token");
    try {
      await fetch(`${API_BASE_URL}/api/assignments/submissions/${selectedSubmission.id || selectedSubmission._id}/remark`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ remark })
      });

      // Update local state
      setSelectedSubmission((prev) => ({ ...prev, remark }));
      setSubmissions((prev) =>
        prev.map((s) => (s.id === selectedSubmission.id ? { ...s, remark } : s))
      );
    } catch (err) {}
  };

  // Filter Submissions by Student Name or File Name
  const filteredSubmissions = submissions.filter((sub) => {
    const name = (sub.studentName || sub.student?.fullName || sub.student?.email || "").toLowerCase();
    const file = (sub.fileName || "").toLowerCase();
    const q = studentSearch.toLowerCase();
    return name.includes(q) || file.includes(q);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading Submissions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col font-sans overflow-hidden">
      
      {/* TOP HEADER */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-950 px-4 flex items-center justify-between shrink-0 font-mono text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => selectedSubmission ? setSelectedSubmission(null) : router.push("/teacher")}
            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-white hover:text-black transition-all flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{selectedSubmission ? "Back to Submissions List" : "Dashboard"}</span>
          </button>

          <span className="text-zinc-600">|</span>
          <span className="font-bold text-white text-sm font-sans">{assignment?.title}</span>
          <span className="text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-[11px]">
            Code: {assignment?.assignmentCode || assignment?.code}
          </span>
        </div>

        {selectedSubmission && (
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-xs font-sans">Viewing: <strong>{selectedSubmission.studentName || "Student"}</strong></span>
            <a
              href={selectedSubmission.presignedUrl || selectedSubmission.viewUrl || selectedSubmission.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-zinc-700 bg-zinc-900 text-xs font-bold text-white hover:bg-white hover:text-black"
            >
              <span>Download File</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </header>

      {/* MODE 1: ASSIGNMENT DETAILS (LEFT) + SUBMISSIONS LIST WITH SEARCH (RIGHT) */}
      {!selectedSubmission ? (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-zinc-800">
          
          {/* LEFT SIDE: ASSIGNMENT DETAILS & EDIT OPTION */}
          <div className="w-full md:w-[40%] bg-zinc-950 p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-lg font-bold text-white tracking-tight">Assignment Details</h2>
              <button
                onClick={() => setIsEditingAssignment(!isEditingAssignment)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-xs font-bold text-white hover:bg-white hover:text-black transition-all"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>{isEditingAssignment ? "Cancel Edit" : "Edit Details"}</span>
              </button>
            </div>

            {isEditingAssignment ? (
              <form onSubmit={handleSaveAssignmentEdit} className="space-y-4 font-mono text-xs animate-in fade-in">
                <div>
                  <label className="block text-zinc-400 mb-1">TITLE *</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-xl bg-black border border-zinc-800 px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">DUE DATE *</label>
                  <input
                    type="date"
                    required
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full rounded-xl bg-black border border-zinc-800 px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">DESCRIPTION</label>
                  <textarea
                    rows={4}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full rounded-xl bg-black border border-zinc-800 px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingEdit}
                  className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-black border border-zinc-800 space-y-2">
                  <span className="text-[11px] font-mono text-zinc-500 uppercase">TITLE & DESCRIPTION</span>
                  <h3 className="text-base font-bold text-white">{assignment?.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">
                    {assignment?.description || "No specific instructions provided."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-black border border-zinc-800">
                    <span className="text-zinc-500 text-[10px]">6-DIGIT CODE</span>
                    <p className="text-sm font-bold text-white tracking-widest">{assignment?.assignmentCode}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black border border-zinc-800">
                    <span className="text-zinc-500 text-[10px]">DUE DATE</span>
                    <p className="text-xs font-bold text-white">
                      {assignment?.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "No deadline"}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black border border-zinc-800 flex items-center justify-between font-mono text-xs">
                  <span className="text-zinc-400">Total Student Turn-ins</span>
                  <span className="text-sm font-bold text-white">{submissions.length}</span>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE: SUBMISSIONS LIST WITH SEARCH OPTION */}
          <div className="w-full md:w-[60%] bg-black p-6 flex flex-col overflow-hidden space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white">Student Turn-ins</h3>
                <p className="text-xs text-zinc-400">Click any student submission to open chatbot assistant & file viewer.</p>
              </div>

              {/* SEARCH OPTION */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search student or file..."
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>
            </div>

            {/* SUBMISSIONS LIST */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((sub, idx) => (
                  <div
                    key={sub.id || sub._id || idx}
                    onClick={() => handleSelectSubmission(sub)}
                    className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-white text-black font-extrabold flex items-center justify-center text-xs shrink-0">
                        <User className="h-4 w-4 text-black" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:underline">
                          {sub.studentName || sub.student?.fullName || sub.student?.email || "Student"}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono mt-0.5">
                          <FileText className="h-3 w-3" />
                          <span className="truncate max-w-[180px]">{sub.fileName}</span>
                          <span>•</span>
                          <span>{new Date(sub.uploadedAt || sub.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono border ${
                        sub.remark === "Pass" ? "bg-white text-black border-white" : "bg-zinc-900 text-zinc-400 border-zinc-800"
                      }`}>
                        {sub.remark || "Unchecked"}
                      </span>

                      <button className="p-1.5 rounded-lg bg-white text-black font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-zinc-500 font-mono text-xs">
                  No matching student turn-ins found.
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* MODE 2: LEFT CHATBOT INTERFACE + RIGHT DOCUMENT VIEWER WITH MOBILE RESPONSIVE TABS */
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-zinc-800 relative">
          
          {/* MOBILE NAVIGATION BAR (< 768px) */}
          <div className="flex md:hidden items-center border-b border-zinc-800 bg-zinc-950 font-mono text-xs shrink-0">
            <button
              onClick={() => setMobileViewTab("chat")}
              className={`flex-1 py-2.5 text-center font-bold flex items-center justify-center gap-1.5 transition-all ${
                mobileViewTab === "chat" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Bot className="h-4 w-4" />
              <span>AI Chatbot</span>
            </button>
            <button
              onClick={() => setMobileViewTab("viewer")}
              className={`flex-1 py-2.5 text-center font-bold flex items-center justify-center gap-1.5 transition-all ${
                mobileViewTab === "viewer" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Document Viewer</span>
            </button>
          </div>
          
          {/* LEFT SIDE (40% on Desktop / Hidden on Mobile when viewer active): CHATBOT INTERFACE */}
          <div className={`w-full md:w-[40%] bg-zinc-950 flex flex-col overflow-hidden ${
            mobileViewTab === "chat" ? "flex flex-1" : "hidden md:flex"
          }`}>
            
            {/* Chatbot Header */}
            <div className="p-3 sm:p-4 border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-md flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-sans text-xs">
                <div className="h-6 w-6 rounded-lg bg-white text-black flex items-center justify-center font-extrabold text-[10px] shrink-0">
                  AI
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-white leading-tight">AI Grading & Q&A Assistant</span>
                  <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    RAG Engine Active
                  </span>
                </div>
              </div>

              {/* Grading Remark Buttons */}
              <div className="flex items-center gap-1 font-mono text-[10px] shrink-0">
                {["Pass", "Fail", "Checked"].map((r) => (
                  <button
                    key={r}
                    onClick={() => handleUpdateRemark(r)}
                    className={`px-2 py-0.5 rounded border transition-all ${
                      activeRemark === r ? "bg-white text-black border-white font-bold" : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-4 font-sans text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 items-start ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar Icon */}
                  <div className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                    msg.sender === "user" ? "bg-zinc-800 text-white" : "bg-white text-black"
                  }`}>
                    {msg.sender === "user" ? "T" : "AI"}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-white text-black font-medium shadow-md rounded-tr-none"
                        : "bg-zinc-900/90 text-zinc-200 border border-zinc-800/80 shadow-md rounded-tl-none space-y-1 font-sans"
                    }`}
                  >
                    {msg.sender === "user" ? (
                      msg.text
                    ) : (
                      // Clean formatted renderer stripping raw ** asterisks and headings
                      msg.text.split("\n").map((line, lIdx) => {
                        let cleanLine = line.replace(/^#+\s*/, "").replace(/^📌\s*/, "");
                        const parts = cleanLine.split(/(\*\*.*?\*\*|`.*?`)/g);

                        return (
                          <div key={lIdx} className={cleanLine.trim() === "" ? "h-1.5" : "min-h-[1.2rem]"}>
                            {parts.map((part, pIdx) => {
                              if (part.startsWith("**") && part.endsWith("**")) {
                                return (
                                  <strong key={pIdx} className="font-bold text-white">
                                    {part.slice(2, -2)}
                                  </strong>
                                );
                              }
                              if (part.startsWith("`") && part.endsWith("`")) {
                                return (
                                  <code key={pIdx} className="bg-zinc-800 text-zinc-200 px-1 py-0.5 rounded font-mono text-[11px]">
                                    {part.slice(1, -1)}
                                  </code>
                                );
                              }
                              return part;
                            })}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}

              {isAiThinking && (
                <div className="flex gap-2.5 items-center text-zinc-400 text-[11px] font-mono pl-1">
                  <div className="h-6 w-6 rounded-lg bg-white text-black flex items-center justify-center font-bold text-[10px] shrink-0">
                    AI
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-zinc-300" />
                    <span>Analyzing document text...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-3 pt-2 pb-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar font-sans text-[11px] border-t border-zinc-900 bg-black/60">
              {[
                { label: "💡 Summarize Submission", query: "Summarize this document" },
                { label: "⚡ Technical Skills", query: "What skills are listed?" },
                { label: "🏢 Experience Check", query: "What work experience does candidate have?" },
                { label: "🎓 Education Details", query: "Where did candidate study?" }
              ].map((chip, cIdx) => (
                <button
                  key={cIdx}
                  type="button"
                  onClick={() => {
                    setChatInput(chip.query);
                  }}
                  className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600 transition-all shrink-0 font-medium"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-zinc-800 bg-black flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI about student's submission or grade..."
                className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-xs font-sans text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isAiThinking}
                className="p-2.5 rounded-xl bg-white text-black font-bold disabled:opacity-40 hover:bg-zinc-200 transition-all active:scale-95 shrink-0 shadow-md"
              >
                <Send className="h-4 w-4 text-black" />
              </button>
            </form>
          </div>

          {/* RIGHT SIDE (60% on Desktop / Hidden on Mobile when chat active): DOCUMENT VIEWER */}
          <div className={`w-full md:w-[60%] bg-black flex flex-col overflow-hidden relative ${
            mobileViewTab === "viewer" ? "flex flex-1" : "hidden md:flex"
          }`}>
            {selectedSubmission.presignedUrl || selectedSubmission.viewUrl || selectedSubmission.fileUrl ? (
              <iframe
                src={selectedSubmission.presignedUrl || selectedSubmission.viewUrl || selectedSubmission.fileUrl}
                className="w-full h-full border-0 bg-zinc-900 min-h-[400px] md:min-h-full"
                title="Student Submission Document"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 font-mono text-xs p-6">
                <FileText className="h-10 w-10 text-zinc-600 mb-2" />
                <p>Document preview unavailable directly in browser.</p>
                <a
                  href={selectedSubmission.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 px-4 py-2 rounded-xl bg-white text-black font-bold text-xs"
                >
                  Download File
                </a>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
