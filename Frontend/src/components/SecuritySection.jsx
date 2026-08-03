"use client";

import { Shield, Lock, Cpu, CheckSquare, FileCheck, Terminal } from "lucide-react";

export default function SecuritySection() {
  return (
    <section className="py-20 bg-zinc-950 border-b border-zinc-800 relative">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Text Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400">
              <Shield className="h-3.5 w-3.5 text-white" />
              <span>ZERO-TRUST SECURITY ARCHITECTURE</span>
            </div>

            <h2 className="text-3xl font-extrabold sm:text-4xl text-white tracking-tight leading-tight">
              Why student file uploads are 100% safe on GlobalAssign.
            </h2>

            <p className="text-zinc-400 text-base leading-relaxed">
              Traditional assignment portals expose educators to malicious file payloads, corrupt submissions, and missing timestamp disputes. GlobalAssign operates on a Zero-Trust vault protocol.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-white shrink-0 mt-1">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Client-Side Encryption</h4>
                  <p className="text-xs text-zinc-400">Files are encrypted before leaving the student's browser. Only authorized educators possess decryption keys.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-white shrink-0 mt-1">
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Automated Sandbox Threat Inspection</h4>
                  <p className="text-xs text-zinc-400">Incoming submissions are executed in isolated cloud containers to strip executable macros or malicious scripts.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-white shrink-0 mt-1">
                  <FileCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Cryptographic Timestamp Proof</h4>
                  <p className="text-xs text-zinc-400">Eliminates submission deadline disputes with immutable cryptographic receipts issued upon successful upload.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Code / Protocol Terminal Graphic */}
          <div className="rounded-2xl border border-zinc-800 bg-black p-6 font-mono text-xs shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-zinc-700" />
                <span className="h-3 w-3 rounded-full bg-zinc-700" />
                <span className="h-3 w-3 rounded-full bg-zinc-700" />
                <span className="text-zinc-400 text-[11px] ml-2">globalassign-security-audit.sh</span>
              </div>
              <span className="text-zinc-500">v2.4-STABLE</span>
            </div>

            <div className="space-y-3 text-zinc-300">
              <p className="text-zinc-500"># Initializing Student Safe Upload Pipeline</p>
              <p><span className="text-white">&gt;</span> Receiving file stream: <span className="text-zinc-100">"Final_Research_Paper.pdf"</span></p>
              <p><span className="text-white">&gt;</span> AES-256 GCM Cipher key generated.</p>
              <p className="text-zinc-400">[1/4] Client-Side Hash: 0x9f8a7e6d5c4b3a21</p>
              <p className="text-zinc-400">[2/4] Malware Isolation Engine: CLEAN (0 threats detected)</p>
              <p className="text-zinc-400">[3/4] Plagiarism Similarity Score: 0.12% Originality Verified</p>
              <p className="text-zinc-400">[4/4] Generating Cryptographic Timestamp Receipt...</p>
              <div className="p-3 rounded bg-zinc-900 border border-zinc-800 text-white mt-4 font-mono">
                <p className="text-[11px] text-zinc-400">STATUS: <span className="text-white font-bold">SUCCESSFULLY VAULTED</span></p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Receipt ID: GA-2026-REC-994208-E2E</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
