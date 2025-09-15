// components/PrivacyControls.tsx
"use client";

import { useEffect, useState } from "react";

type Consents = { necessary: true; analytics: boolean; marketing: boolean };

function readCookieConsent(): Consents | null {
  try {
    const m = document.cookie.match(/(?:^|; )cookie_consent_v1=([^;]*)/);
    if (!m) return null;
    const obj = JSON.parse(decodeURIComponent(m[1]));
    return { necessary: true, analytics: !!obj.analytics, marketing: !!obj.marketing };
  } catch {
    return null;
  }
}

export default function PrivacyControls() {
  const [current, setCurrent] = useState<Consents | null>(null);

  useEffect(() => {
    setCurrent(readCookieConsent());
    const onChange = () => setCurrent(readCookieConsent());
    window.addEventListener("consentchange", onChange as any);
    return () => window.removeEventListener("consentchange", onChange as any);
  }, []);

  function exportJSON() {
    try {
      const log = JSON.parse(localStorage.getItem("cookie_consent_log") || "[]");
      const current = readCookieConsent();
      const blob = new Blob([JSON.stringify({ current, log }, null, 2)], {
        type: "application/json",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `cookie-consent-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {}
  }

  function exportCSV() {
    try {
      const log: any[] = JSON.parse(localStorage.getItem("cookie_consent_log") || "[]");
      const header = [
        "at",
        "source",
        "analytics",
        "marketing",
        "href",
        "referer",
        "ua",
        "version",
      ];
      const rows = log.map((e) => [
        e.at,
        e.source,
        e?.consents?.analytics ? "1" : "0",
        e?.consents?.marketing ? "1" : "0",
        `"${(e.href || "").replaceAll(`"`, `""`)}"`,
        `"${(e.referer || "").replaceAll(`"`, `""`)}"`,
        `"${(e.ua || "").replaceAll(`"`, `""`)}"`,
        e.version || "",
      ]);
      const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `cookie-consent-log-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {}
  }

  return (
    <div className="rounded-2xl border p-4 md:p-5 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-2">Twoje ustawienia prywatności</h2>
      <p className="text-gray-600 mb-4">
        Możesz w każdej chwili zmienić zgodę na pliki cookie, wycofać ją lub pobrać swoją historię zgód.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          className="px-4 h-10 rounded-xl border border-blue-600 text-blue-700 bg-white hover:bg-blue-50"
          onClick={() => (window as any).__openCookieSettings?.()}
        >
          Ustawienia cookies
        </button>
        <button
          className="px-4 h-10 rounded-xl border border-gray-300 hover:bg-gray-50"
          onClick={() => (window as any).__resetCookieConsent?.()}
        >
          Wycofaj zgodę (pokaż baner)
        </button>
        <button className="px-4 h-10 rounded-xl border hover:bg-gray-50" onClick={exportJSON}>
          Eksportuj (JSON)
        </button>
        <button className="px-4 h-10 rounded-xl border hover:bg-gray-50" onClick={exportCSV}>
          Eksportuj (CSV)
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-700">
        <div className="font-medium mb-1">Aktualny status:</div>
        {current ? (
          <ul className="list-disc ml-5">
            <li>Niezbędne: zawsze włączone</li>
            <li>Analityczne: {current.analytics ? "włączone" : "wyłączone"}</li>
            <li>Marketingowe: {current.marketing ? "włączone" : "wyłączone"}</li>
          </ul>
        ) : (
          <div>Brak zapisanej zgody (baner pojawi się przy kolejnym wejściu).</div>
        )}
      </div>
    </div>
  );
}
