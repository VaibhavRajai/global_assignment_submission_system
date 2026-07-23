"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, UserCheck, ShieldCheck, Mail, User, Key, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function AuthModal({ isOpen, onClose, initialMode = "signup" }) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode); // "signup" | "login"

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("teacher"); // "teacher" | "student"

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const cleanEmail = email.toLowerCase().trim();

    // 1. Send Request to Backend REST API
    try {
      const endpoint = mode === "signup" 
        ? "http://localhost:5000/api/auth/signup" 
        : "http://localhost:5000/api/auth/login";

      const payload = mode === "signup" 
        ? { name, email: cleanEmail, password, role } 
        : { email: cleanEmail, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // STRICT REJECTION FROM BACKEND
        setErrorMsg(data.error || "Authentication failed.");
        setLoading(false);
        return;
      }

      // Save token and user details upon successful auth
      localStorage.setItem("globalassign_token", data.token);
      localStorage.setItem("globalassign_user", JSON.stringify(data.user));

      setSuccessMsg(mode === "signup" ? "Account registered successfully!" : "Login successful!");

      setTimeout(() => {
        onClose();
        if (data.user.role === "teacher") {
          router.push("/teacher");
        } else {
          router.push("/student");
        }
      }, 1000);

    } catch (networkError) {
      // 2. Strict Offline Authentication Logic
      const storedUsersRaw = localStorage.getItem("globalassign_registered_users");
      let registeredUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];

      if (mode === "signup") {
        // Strict Sign Up Check
        const existing = registeredUsers.find(u => u.email === cleanEmail);
        if (existing) {
          setErrorMsg("An account with this email already exists. Please switch to Log In.");
          setLoading(false);
          return;
        }

        const newUser = {
          id: "usr_" + Date.now(),
          name: name.trim() || "User",
          email: cleanEmail,
          password: password, // In offline mode
          role: role
        };

        registeredUsers.push(newUser);
        localStorage.setItem("globalassign_registered_users", JSON.stringify(registeredUsers));
        localStorage.setItem("globalassign_token", "jwt_offline_token_" + Date.now());
        localStorage.setItem("globalassign_user", JSON.stringify({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }));

        setSuccessMsg("Account registered successfully!");
        setTimeout(() => {
          onClose();
          if (newUser.role === "teacher") router.push("/teacher");
          else router.push("/student");
        }, 1000);

      } else {
        // Strict Log In Check
        const existing = registeredUsers.find(u => u.email === cleanEmail);
        if (!existing) {
          setErrorMsg("No account found with this email. Please sign up first.");
          setLoading(false);
          return;
        }

        if (existing.password !== password) {
          setErrorMsg("Incorrect password. Please verify your password and try again.");
          setLoading(false);
          return;
        }

        localStorage.setItem("globalassign_token", "jwt_offline_token_" + Date.now());
        localStorage.setItem("globalassign_user", JSON.stringify({ id: existing.id, name: existing.name, email: existing.email, role: existing.role }));

        setSuccessMsg("Log in successful!");
        setTimeout(() => {
          onClose();
          if (existing.role === "teacher") router.push("/teacher");
          else router.push("/student");
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 p-6 bg-black">
          <div>
            <span className="text-xs font-mono text-zinc-400 uppercase">[ STRICT AUTHENTICATION ]</span>
            <h3 className="text-xl font-bold text-white mt-0.5">
              {mode === "signup" ? "Create Account" : "Log In to Account"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 border-b border-zinc-800 bg-zinc-900/50 text-xs font-mono font-bold">
          <button
            onClick={() => { setMode("signup"); setErrorMsg(""); setSuccessMsg(""); }}
            className={`py-3 text-center transition-colors ${
              mode === "signup" ? "bg-black text-white border-b-2 border-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => { setMode("login"); setErrorMsg(""); setSuccessMsg(""); }}
            className={`py-3 text-center transition-colors ${
              mode === "login" ? "bg-black text-white border-b-2 border-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Log In
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white flex items-center gap-2 font-mono">
              <AlertCircle className="h-4 w-4 shrink-0 text-white" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-white text-black font-bold text-xs flex items-center gap-2 font-mono">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-black" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SIGN UP ROLE SELECTOR - ASK FOR ROLE ON SIGNUP ITSELF */}
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-2">SELECT YOUR ROLE *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("teacher")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                    role === "teacher"
                      ? "bg-white text-black border-white shadow-md"
                      : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                  }`}
                >
                  <UserCheck className="h-4 w-4" />
                  Teacher
                </button>
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                    role === "student"
                      ? "bg-white text-black border-white shadow-md"
                      : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Student
                </button>
              </div>
            </div>
          )}

          {/* Name Field (Sign Up Only) */}
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">FULL NAME *</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === "teacher" ? "Prof. Sarah Jenkins" : "Alex Chen"}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-800 pl-9 pr-4 py-2.5 text-sm text-white focus:border-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1">EMAIL ADDRESS *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 pl-9 pr-4 py-2.5 text-sm text-white focus:border-white focus:outline-none"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1">PASSWORD *</label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 pl-9 pr-4 py-2.5 text-sm text-white focus:border-white focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-bold text-black hover:bg-zinc-200 disabled:opacity-50 transition-colors shadow-lg"
            >
              {loading ? (
                "Authenticating..."
              ) : mode === "signup" ? (
                <>
                  Register New Account <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Log In to Account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
