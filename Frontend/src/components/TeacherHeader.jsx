"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User, Sparkles, ShieldCheck } from "lucide-react";

export default function TeacherHeader() {
  const router = useRouter();
  const [teacherUser, setTeacherUser] = useState({ name: "Prof. Sarah Jenkins", email: "" });

  useEffect(() => {
    const stored = localStorage.getItem("globalassign_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTeacherUser(parsed);
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("globalassign_token");
    localStorage.removeItem("globalassign_user");
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-white text-black flex items-center justify-center font-extrabold shadow-lg transition-transform group-hover:scale-105">
              <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5 sm:gap-2">
                GlobalAssign <span className="hidden sm:inline-block text-[10px] font-mono uppercase bg-zinc-900 border border-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full">Educator Portal</span>
              </span>
            </div>
          </Link>
        </div>


        {/* User Account Info & Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 rounded-full px-4 py-1.5 backdrop-blur-md">
            <div className="h-7 w-7 rounded-full bg-white text-black font-extrabold flex items-center justify-center text-xs">
              {teacherUser.name ? teacherUser.name.charAt(0).toUpperCase() : "P"}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-none">{teacherUser.name}</span>
              <span className="text-[10px] font-mono text-zinc-400 mt-0.5">{teacherUser.email || "Faculty Member"}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-bold text-zinc-300 hover:text-white hover:border-zinc-600 transition-all active:scale-95 shadow-md"
            title="Log Out"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}
