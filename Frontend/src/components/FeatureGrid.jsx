"use client";

import { 
  FilePlus, 
  Eye, 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  Lock, 
  BarChart, 
  CheckCircle2, 
  FileCheck2, 
  Smartphone 
} from "lucide-react";

export default function FeatureGrid() {
  const teacherFeatures = [
    {
      icon: <FilePlus className="h-6 w-6 text-white" />,
      title: "Seamless Assignment Creation",
      description: "Define instructions, set exact deadline windows, attach rubrics, and specify accepted file types in under 60 seconds."
    },
    {
      icon: <Eye className="h-6 w-6 text-white" />,
      title: "Real-Time Submissions Dashboard",
      description: "Track turned-in student work live. Filter by student, timestamp, course, or grading status with zero latency."
    },
    {
      icon: <Sparkles className="h-6 w-6 text-white" />,
      title: "Instant AI Submission Summary",
      description: "Synthesize batch submissions into natural language summaries highlighting class strengths, common pitfalls, and suggested grade curves."
    }
  ];

  const studentFeatures = [
    {
      icon: <ShieldCheck className="h-6 w-6 text-white" />,
      title: "End-to-End Encrypted Safe Upload",
      description: "Student files are encrypted on the client side using AES-256 before transmission, guaranteeing complete data privacy."
    },
    {
      icon: <Lock className="h-6 w-6 text-white" />,
      title: "Malware & Virus Sandboxing",
      description: "Automated zero-day threat scanning isolates submitted files to ensure complete security for educators and teaching assistants."
    },
    {
      icon: <FileCheck2 className="h-6 w-6 text-white" />,
      title: "Tamper-Proof Receipt Hashes",
      description: "Every successful upload yields a cryptographic receipt timestamping submission proof down to the exact millisecond."
    }
  ];

  return (
    <section id="features" className="py-24 bg-black border-b border-zinc-800">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-3">
            [ ARCHITECTURE & CAPABILITIES ]
          </h2>
          <p className="text-3xl font-extrabold sm:text-5xl text-white tracking-tight">
            Built for Academic Integrity & Effortless Instruction.
          </p>
          <p className="mt-4 text-zinc-400 text-base sm:text-lg">
            A unified monochrome platform designed to solve the two biggest friction points in modern education: teacher administrative overload and student submission security.
          </p>
        </div>

        {/* Teacher Suite Grid */}
        <div id="teacher-suite" className="mb-16 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <span className="flex h-3 w-3 rounded-full bg-white" />
            <h3 className="text-xl font-bold text-white tracking-tight">Educator Core Features</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teacherFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 glass-card-hover flex flex-col justify-between"
              >
                <div>
                  <div className="h-12 w-12 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 border border-zinc-700">
                    {feat.icon}
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{feat.title}</h4>
                  <p className="text-sm text-zinc-400 leading-relaxed">{feat.description}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" /> Included in Educator Tier
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Safe Upload Grid */}
        <div id="student-safe" className="space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <span className="flex h-3 w-3 rounded-full bg-white" />
            <h3 className="text-xl font-bold text-white tracking-tight">Student Safe Upload Portal</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {studentFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 glass-card-hover flex flex-col justify-between"
              >
                <div>
                  <div className="h-12 w-12 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 border border-zinc-700">
                    {feat.icon}
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{feat.title}</h4>
                  <p className="text-sm text-zinc-400 leading-relaxed">{feat.description}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" /> Standard Protection
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
