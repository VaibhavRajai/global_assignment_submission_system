"use client";

import { useState } from "react";
import Link from "next/link";
import AuthModal from "@/components/AuthModal";
import { Menu, X, ArrowRight, UserCheck } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signup");

  const openAuth = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-white flex items-center justify-center font-extrabold text-black text-sm">
              GA
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              GlobalAssign
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#teacher-features" className="transition-colors hover:text-white">
              Teacher Features
            </a>
            <a href="#student-features" className="transition-colors hover:text-white">
              Student Features
            </a>
            <a href="#security" className="transition-colors hover:text-white">
              Safety & Security
            </a>
            <a href="#faq" className="transition-colors hover:text-white">
              FAQ
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => openAuth("login")}
              className="text-sm font-semibold text-zinc-300 hover:text-white px-3 py-2"
            >
              Log In
            </button>
            <button
              onClick={() => openAuth("signup")}
              className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-zinc-200"
            >
              Sign Up <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-zinc-800 bg-zinc-950 px-6 py-6 space-y-4">
            <nav className="flex flex-col gap-4 text-base font-medium text-zinc-300">
              <button
                onClick={() => { setMobileMenuOpen(false); openAuth("signup"); }}
                className="text-left hover:text-white py-1 text-white font-bold flex items-center gap-2"
              >
                Sign Up / Create Account <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); openAuth("login"); }}
                className="text-left hover:text-white py-1 text-zinc-300"
              >
                Log In
              </button>
              <a
                href="#teacher-features"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white py-1"
              >
                Teacher Features
              </a>
              <a
                href="#student-features"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white py-1"
              >
                Student Features
              </a>
              <a
                href="#security"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white py-1"
              >
                Safety & Security
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}
