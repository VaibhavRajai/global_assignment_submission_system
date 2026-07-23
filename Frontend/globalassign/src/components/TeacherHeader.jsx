"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";

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
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded bg-white flex items-center justify-center font-extrabold text-black text-sm">
              GA
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                GlobalAssign <span className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">Teacher Account</span>
              </span>
            </div>
          </Link>
        </div>

        {/* User Account Info & Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-white flex items-center gap-1.5 justify-end">
              <User className="h-3.5 w-3.5 text-zinc-400" /> {teacherUser.name}
            </span>
            <span className="text-[11px] font-mono text-zinc-400">{teacherUser.email || "Faculty Account"}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}
