"use client";

export default function SecurityText() {
  return (
    <section id="security" className="py-20 bg-zinc-950 border-b border-zinc-800">
      <div className="mx-auto max-w-5xl px-6">
        
        <div className="mb-10">
          <div className="inline-block rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs font-mono text-zinc-400 mb-2">
            SECURITY & PRIVACY
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight">
            Safe Upload Security Standards
          </h2>
          <p className="mt-3 text-zinc-400 text-base sm:text-lg">
            How GlobalAssign guarantees file safety for both teachers and students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-zinc-800 bg-black p-6 space-y-4">
            <h3 className="text-lg font-bold text-white uppercase font-mono tracking-wider">
              [ Educator Safeguards ]
            </h3>
            <p className="text-sm text-zinc-300">
              Teachers receive zero-day malware isolation on every downloaded assignment, ensuring institutional devices remain protected from corrupted or malicious submissions.
            </p>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="text-white">✓</span> Isolated Cloud Sandboxing
              </li>
              <li className="flex items-center gap-2">
                <span className="text-white">✓</span> Macro & Script Deactivation
              </li>
              <li className="flex items-center gap-2">
                <span className="text-white">✓</span> Automated File Format Sanitization
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-black p-6 space-y-4">
            <h3 className="text-lg font-bold text-white uppercase font-mono tracking-wider">
              [ Student Safeguards ]
            </h3>
            <p className="text-sm text-zinc-300">
              Students get guaranteed privacy with client-side encryption and instant cryptographic turn-in verification receipts.
            </p>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="text-white">✓</span> AES-256 Client Encryption
              </li>
              <li className="flex items-center gap-2">
                <span className="text-white">✓</span> Millisecond Timestamp Proof
              </li>
              <li className="flex items-center gap-2">
                <span className="text-white">✓</span> Zero Data Leak Vaulting
              </li>
            </ul>
          </div>
        </div>

      </div>
    </section>
  );
}
