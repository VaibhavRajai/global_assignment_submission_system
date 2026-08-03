"use client";

export default function Hero() {
  return (
    <section className="bg-black py-20 md:py-32 border-b border-zinc-800">
      <div className="mx-auto max-w-5xl px-6 text-center">
        
        {/* Badge */}
        <div className="inline-block rounded-full border border-zinc-800 bg-zinc-900 px-4 py-1.5 text-xs font-mono text-zinc-300 mb-6">
          BLACK & WHITE ACADEMIC PLATFORM
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl leading-tight">
          Simplified Assignment Management for <span className="underline decoration-zinc-600 underline-offset-8">Teachers</span> & Safe Submissions for <span className="bg-white text-black px-2.5 py-0.5 rounded-lg">Students</span>.
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-3xl text-base text-zinc-400 sm:text-xl font-normal leading-relaxed">
          GlobalAssign is built to streamline academic workflows. Teachers can effortlessly create assignments, view turn-ins, and generate instant AI class summaries—while students upload work safely with complete privacy and encryption.
        </p>

        {/* Two Column Feature Summary Text Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Teacher Summary Box */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 space-y-3 shadow-2xl text-white">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-white" />
              Teacher Platform Features
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Create structured assignments with custom rubrics and deadlines, monitor real-time class submission rates, and generate instant AI summaries of student work.
            </p>
          </div>

          {/* Student Summary Box */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 space-y-3 shadow-2xl text-white">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-white" />
              Student Safe Upload Features
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Upload assignments safely with end-to-end encryption, automated malware sandboxing, anti-plagiarism verification, and instant turn-in receipts.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
