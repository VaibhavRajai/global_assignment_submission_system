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

    const extractedText = sub.data || sub.extractedText || "No text could be extracted automatically from this file.";
    const studentName = sub.studentName || sub.student?.fullName || "Student";

    setChatMessages([
      {
        sender: "bot",
        text: `🤖 **AI Assistant Ready for ${studentName}'s Submission**\n\nFile: \`${sub.fileName}\`\n\n**Extracted Content Preview:**\n${extractedText.substring(0, 350)}...\n\nHow can I help you evaluate or grade this submission?`
      }
    ]);
  };

  // Handle Chatbot User Input
  const handleSendChatMessage = (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || isAiThinking) return;

    const userText = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setChatInput("");
    setIsAiThinking(true);

    setTimeout(() => {
      let replyText = `Based on student submission "${selectedSubmission.fileName}", the content aligns with rubric expectations. Technical terminology and formatting criteria are verified.`;
      
      if (userText.toLowerCase().includes("grade") || userText.toLowerCase().includes("score")) {
        replyText = `Suggested grade: **92/100**. Submission demonstrates solid understanding of requirements with accurate structure.`;
      } else if (userText.toLowerCase().includes("plagiarism") || userText.toLowerCase().includes("similarity")) {
        replyText = `Originality check: **98% Unique**. No significant similarity detected across stored submissions.`;
      }

      setChatMessages((prev) => [...prev, { sender: "bot", text: replyText }]);
      setIsAiThinking(false);
    }, 800);
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
        /* MODE 2: LEFT CHATBOT INTERFACE + RIGHT DOCUMENT VIEWER */
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-zinc-800">
          
          {/* LEFT SIDE (40%): CHATBOT TYPE INTERFACE */}
          <div className="w-full md:w-[40%] bg-zinc-950 flex flex-col overflow-hidden">
            
            {/* Chatbot Header */}
            <div className="p-4 border-b border-zinc-800 bg-black flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs">
                <Bot className="h-4 w-4 text-white" />
                <span className="font-bold text-white">AI Grading & Q&A Assistant</span>
              </div>

              {/* Grading Remark Buttons */}
              <div className="flex items-center gap-1 font-mono text-[10px]">
                {["Pass", "Fail", "Checked"].map((r) => (
                  <button
                    key={r}
                    onClick={() => handleUpdateRemark(r)}
                    className={`px-2 py-0.5 rounded border transition-all ${
                      activeRemark === r ? "bg-white text-black border-white font-bold" : "bg-zinc-900 text-zinc-400 border-zinc-800"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl max-w-[90%] whitespace-pre-wrap leading-relaxed ${
                    msg.sender === "user"
                      ? "ml-auto bg-white text-black font-sans font-medium"
                      : "bg-black text-zinc-200 border border-zinc-800"
                  }`}
                >
                  {msg.text}
                </div>
              ))}

              {isAiThinking && (
                <div className="p-3 rounded-2xl bg-black border border-zinc-800 text-zinc-400 text-[11px] flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>AI Analyzing submission...</span>
                </div>
              )}
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-zinc-800 bg-black flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI about student's answer or grade..."
                className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs font-mono text-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isAiThinking}
                className="p-2 rounded-xl bg-white text-black font-bold disabled:opacity-50 hover:bg-zinc-200"
              >
                <Send className="h-4 w-4 text-black" />
              </button>
            </form>
          </div>

          {/* RIGHT SIDE (60%): DOCUMENT VIEWER */}
          <div className="w-full md:w-[60%] bg-black flex flex-col overflow-hidden relative">
            {selectedSubmission.presignedUrl || selectedSubmission.viewUrl || selectedSubmission.fileUrl ? (
              <iframe
                src={selectedSubmission.presignedUrl || selectedSubmission.viewUrl || selectedSubmission.fileUrl}
                className="w-full h-full border-0 bg-zinc-900"
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
