"use client";

export default function StudentFeatures() {
  const features = [
    {
      step: "01",
      title: "Safe & Encrypted Upload",
      summary: "End-to-end client-side encryption ensures student work remains secure and confidential.",
      details: [
        "AES-256 GCM client-side encryption protects submission contents prior to upload.",
        "Zero-Knowledge storage guarantees only authorized course teachers can decrypt submissions.",
        "Seamless drag-and-drop file support for PDF, DOCX, ZIP archives, and Python/Jupyter files.",
        "Mobile-optimized upload interface for submitting assignments directly from tablets or phones."
      ]
    },
    {
      step: "02",
      title: "Malware & Plagiarism Safety",
      summary: "Automated threat isolation and pre-submission integrity checks.",
      details: [
        "Automated cloud sandbox scans all incoming files for malware or malicious macros.",
        "Real-time originality pre-check provides immediate feedback on citation and similarity.",
        "Prevents file corruption issues during upload with automatic checksum verification.",
        "Ensures teachers can safely download and review student work without security risks."
      ]
    },
    {
      step: "03",
      title: "Tamper-Proof Turn-In Receipts",
      summary: "Immutable timestamp proof for every successful assignment upload.",
      details: [
        "Generates a unique cryptographic receipt hash immediately upon successful submission.",
        "Includes millisecond-accurate timestamp verification to resolve deadline disputes.",
        "Provides a downloadable submission confirmation badge saved to the student profile.",
        "Allows students to view their upload history and verified submission status anytime."
      ]
    }
  ];

  return (
    <section id="student-features" className="py-20 bg-black border-b border-zinc-800">
      <div className="mx-auto max-w-5xl px-6">
        
        {/* Section Header */}
        <div className="mb-12">
          <div className="inline-block rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs font-mono text-zinc-400 mb-2">
            FOR STUDENTS
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight">
            Student Features: Upload Safely & Verify
          </h2>
          <p className="mt-3 text-zinc-400 text-base sm:text-lg">
            Guaranteeing privacy, security, and indisputable proof of submission for every student assignment.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 flex flex-col justify-between"
            >
              <div>
                <div className="text-xs font-mono text-zinc-500 mb-2">PROTECTION {item.step}</div>
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
