// components/FAQ.tsx
"use client";
import React from "react";

type QA = { q: string; a: React.ReactNode };

export default function FAQ({ items }: { items: QA[] }) {
  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map(i => ({
      "@type": "Question",
      "name": i.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": (typeof i.a === "string" ? i.a : String(""))
      }
    }))
  };

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold mb-4">Najczęstsze pytania</h2>
      <div className="divide-y border rounded-xl">
        {items.map((item, idx) => (
          <details key={idx} className="group p-4">
            <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
              <span>{item.q}</span>
              <span className="ml-3 text-gray-500 group-open:rotate-180 transition">⌄</span>
            </summary>
            <div className="mt-2 text-gray-700">{item.a}</div>
          </details>
        ))}
      </div>

      {/* FAQ JSON-LD (tylko teksty; proste) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}
