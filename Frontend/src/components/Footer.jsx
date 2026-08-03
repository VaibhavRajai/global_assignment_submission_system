"use client";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-black text-zinc-400 py-12 border-t border-zinc-800">
      <div className="mx-auto max-w-5xl px-6">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-zinc-800">
          <div>
            <span className="text-lg font-bold text-white tracking-tight">GlobalAssign</span>
            <p className="text-xs text-zinc-400 mt-1">
              Monochrome Academic Platform for Teacher Assignment Management & Student Safe Uploads.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-xs text-zinc-400">
            <a href="#teacher-features" className="hover:text-white transition-colors">Teacher Features</a>
            <a href="#student-features" className="hover:text-white transition-colors">Student Features</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <p>© {new Date().getFullYear()} GlobalAssign. All Rights Reserved.</p>
          <button
            onClick={scrollToTop}
            className="hover:text-white underline cursor-pointer"
          >
            Back to top ↑
          </button>
        </div>

      </div>
    </footer>
  );
}
