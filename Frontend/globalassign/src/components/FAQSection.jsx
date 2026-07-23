"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "How does the Teacher Assignment Creation process work?",
      a: "Teachers specify assignment titles, course codes, detailed instructions, due dates, grading rubrics, and allowed file formats (.pdf, .docx, .zip, .ipynb). They can also toggle AI summary generation upon assignment creation."
    },
    {
      q: "How can teachers view and track student submissions?",
      a: "The Teacher Dashboard provides a real-time list of all active assignments, displaying submission progress (e.g., 42/45 turned in), submission timestamps, student lists, and average class grades."
    },
    {
      q: "What is the AI Class Summarizer feature?",
      a: "The AI Class Summarizer automatically analyzes all submitted student work for an assignment. It generates a concise natural language report highlighting class strengths, common misconceptions, grade distribution percentages, and suggested review topics for upcoming lectures."
    },
    {
      q: "How do students upload assignments safely?",
      a: "Students upload files through an encrypted vault. Submissions are encrypted client-side using AES-256 before transmission and automatically scanned in an isolated cloud sandbox for malware and plagiarism."
    },
    {
      q: "How do students verify their turn-in timestamp?",
      a: "Upon successful upload, GlobalAssign issues an immutable cryptographic receipt containing a unique hash and millisecond-accurate timestamp to guarantee proof of submission."
    }
  ];

  return (
    <section id="faq" className="py-20 bg-black border-b border-zinc-800">
      <div className="mx-auto max-w-4xl px-6">
        
        <div className="mb-10 text-center">
          <div className="inline-block rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs font-mono text-zinc-400 mb-2">
            FREQUENTLY ASKED QUESTIONS
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight">
            Platform Capabilities & Feature FAQ
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base">
            Detailed text answers explaining Teacher tools and Student safe upload features.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-white hover:text-zinc-300"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-zinc-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-900 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
