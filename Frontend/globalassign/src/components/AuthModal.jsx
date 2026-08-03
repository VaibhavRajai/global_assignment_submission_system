"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  X, 
  UserCheck, 
  ShieldCheck, 
  Mail, 
  User, 
  Key, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  LockKeyhole,
  UserPlus,
  KeyRound
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function AuthModal({ isOpen, onClose, initialMode = "signup" }) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);
  const [step, setStep] = useState("form"); // "form" or "otp"

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("teacher");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSignupFormSubmit = async (cleanEmail) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, fullName: name, fullname: name, email: cleanEmail, password, role })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || "Signup failed. Please try again.");
    }

    setSuccessMsg("OTP sent to your email! Please enter the 6-digit verification code below.");
    setStep("otp");
  };

  const handleOtpVerifySubmit = async (cleanEmail) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, otp: otp.trim() })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || "OTP verification failed. Please check your OTP code.");
    }

    const token = data.accessToken || data.token;
    localStorage.setItem("globalassign_token", token);
    localStorage.setItem("globalassign_access_token", data.accessToken || token);
    localStorage.setItem("globalassign_refresh_token", data.refreshToken || "");
    localStorage.setItem("globalassign_user", JSON.stringify(data.user));

    setSuccessMsg("Account verified & created successfully!");

    setTimeout(() => {
      onClose();
      if (data.user?.role === "teacher") {
        router.push("/teacher");
      } else {
        router.push("/student");
      }
    }, 900);
  };

  const handleLoginSubmit = async (cleanEmail) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, password })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || "Login failed. Please check your credentials.");
    }

    const token = data.accessToken || data.token;
    localStorage.setItem("globalassign_token", token);
    localStorage.setItem("globalassign_access_token", data.accessToken || token);
    localStorage.setItem("globalassign_refresh_token", data.refreshToken || "");
    localStorage.setItem("globalassign_user", JSON.stringify(data.user));

    setSuccessMsg("Logged in successfully!");

    setTimeout(() => {
      onClose();
      if (data.user?.role === "teacher") {
        router.push("/teacher");
      } else {
        router.push("/student");
      }
    }, 900);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const cleanEmail = email.toLowerCase().trim();

    try {
      if (mode === "signup" && step === "form") {
        await handleSignupFormSubmit(cleanEmail);
      } else if (mode === "signup" && step === "otp") {
        await handleOtpVerifySubmit(cleanEmail);
      } else {
        await handleLoginSubmit(cleanEmail);
      }
    } catch (err) {
      setErrorMsg(err.message || "Authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl overflow-hidden glass-panel relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

        <div className="relative border-b border-zinc-800/80 p-6 bg-black/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white text-black flex items-center justify-center font-extrabold shadow-md">
              {step === "otp" ? <KeyRound className="h-5 w-5" /> : mode === "signup" ? <UserPlus className="h-5 w-5" /> : <LockKeyhole className="h-5 w-5" />}
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">[ AUTHENTICATION ]</span>
              <h3 className="text-xl font-extrabold text-white leading-tight">
                {step === "otp" ? "Verify Email OTP" : mode === "signup" ? "Create New Account" : "Sign In to Portal"}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-2 bg-zinc-900/60 border-b border-zinc-800/80">
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-black border border-zinc-800">
            <button
              onClick={() => { setMode("signup"); setStep("form"); setErrorMsg(""); setSuccessMsg(""); }}
              className={`py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                mode === "signup"
                  ? "bg-white text-black shadow-lg"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" /> 1. Sign Up
            </button>
            <button
              onClick={() => { setMode("login"); setStep("form"); setErrorMsg(""); setSuccessMsg(""); }}
              className={`py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                mode === "login"
                  ? "bg-white text-black shadow-lg"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <LockKeyhole className="h-3.5 w-3.5" /> 2. Log In
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white flex items-center gap-2 font-mono">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-white text-black font-bold text-xs flex items-center gap-2 font-mono shadow-lg">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-black" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === "signup" && step === "form" && (
            <div className="space-y-2">
              <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider">
                SELECT YOUR ACCOUNT TYPE *
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setRole("teacher")}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    role === "teacher"
                      ? "bg-white text-black border-white shadow-xl scale-[1.02]"
                      : "bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-extrabold">Teacher</span>
                  </div>
                  <p className={`text-[10px] mt-1 ${role === "teacher" ? "text-zinc-700" : "text-zinc-500"}`}>
                    Create assignments, view turn-ins & AI summaries.
                  </p>
                </div>

                <div
                  onClick={() => setRole("student")}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    role === "student"
                      ? "bg-white text-black border-white shadow-xl scale-[1.02]"
                      : "bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-extrabold">Student</span>
                  </div>
                  <p className={`text-[10px] mt-1 ${role === "student" ? "text-zinc-700" : "text-zinc-500"}`}>
                    Join via 6-digit code & upload files safely.
                  </p>
                </div>
              </div>
            </div>
          )}

          {mode === "signup" && step === "form" && (
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase tracking-wider">FULL NAME *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === "teacher" ? "Prof. Sarah Jenkins" : "Alex Chen"}
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-800 pl-10 pr-4 py-2.5 text-sm text-white focus:border-white focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {step === "form" && (
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase tracking-wider">EMAIL ADDRESS *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-800 pl-10 pr-4 py-2.5 text-sm text-white focus:border-white focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {step === "form" && (
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase tracking-wider">PASSWORD *</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-800 pl-10 pr-4 py-2.5 text-sm text-white focus:border-white focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {step === "otp" && (
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase tracking-wider">ENTER 6-DIGIT OTP CODE *</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-800 pl-10 pr-4 py-2.5 text-lg font-mono tracking-widest text-white focus:border-white focus:outline-none transition-colors text-center"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-extrabold text-black hover:bg-zinc-200 disabled:opacity-50 transition-all active:scale-95 shadow-xl"
            >
              {loading ? (
                "Processing..."
              ) : step === "otp" ? (
                <>
                  Verify OTP & Complete Setup <ArrowRight className="h-4 w-4" />
                </>
              ) : mode === "signup" ? (
                <>
                  Send OTP Verification Code <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Sign In to Account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          <div className="pt-2 text-center text-xs text-zinc-400">
            {mode === "signup" ? (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("login"); setStep("form"); setErrorMsg(""); }}
                  className="text-white font-bold underline hover:text-zinc-300"
                >
                  Click here to Log In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account yet?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("signup"); setStep("form"); setErrorMsg(""); }}
                  className="text-white font-bold underline hover:text-zinc-300"
                >
                  Click here to Sign Up
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
