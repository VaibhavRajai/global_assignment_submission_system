"use client";

export default function TeacherFeatures() {
  const features = [
    {
      step: "01",
      title: "Create Assignments",
      summary: "Draft and publish clear assignment tasks with custom parameters.",
      details: [
        "Define assignment title, course code, detailed instructions, and submission deadlines.",
        "Set accepted file formats including PDF documents, ZIP archives, and Jupyter Notebooks.",
        "Attach custom grading rubrics and enable automated AI analysis for incoming submissions.",
        "Schedule future assignment release dates and set automatic deadline enforcement windows."
      ]
    },
    {
      step: "02",
      title: "View Submissions & Track Progress",
      summary: "Monitor class turn-ins live through a clean, unified dashboard.",
      details: [
        "View all active assignments and track real-time submission counts (e.g. 42/45 turned in).",
        "Inspect student turn-in status, submission timestamps, and file version history.",
        "Filter student work by course section, submission status, or grade distribution.",
        "Access student submissions from any device with responsive web support."
      ]
    },
    {
      step: "03",
      title: "AI Class Summarizer",
      summary: "Generate instant AI-powered summaries of all turned-in student work.",
      details: [
        "Synthesize batch student submissions into a concise executive summary in under 3 seconds.",
        "Identify key class strengths and recurring conceptual misunderstandings across submissions.",
        "Review automatically calculated grade distribution curves (A, B, C, D percentages).",
        "Receive tailored AI recommendations for topics to review in upcoming lectures."
      ]
    }
  ];

  return (
    <section id="teacher-features" className="py-20 bg-zinc-950 border-b border-zinc-800">
      <div className="mx-auto max-w-5xl px-6">
        
        {/* Section Header */}
        <div className="mb-12">
          <div className="inline-block rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs font-mono text-zinc-400 mb-2">
            FOR EDUCATORS & TEACHERS
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight">
            Teacher Features: Create, View & Summarize
          </h2>
          <p className="mt-3 text-zinc-400 text-base sm:text-lg">
            Everything teachers need to organize assignments and gain instant insights into student understanding.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-zinc-800 bg-black p-6 flex flex-col justify-between"
            >
              <div>
                <div className="text-xs font-mono text-zinc-500 mb-2">FEATURE {item.step}</div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm font-medium text-zinc-300 mb-4">{item.summary}</p>
                
                <ul className="space-y-2 border-t border-zinc-900 pt-4">
                  {item.details.map((point, pIdx) => (
                    <li key={pIdx} className="text-xs text-zinc-400 flex items-start gap-2">
                      <span className="text-white font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
