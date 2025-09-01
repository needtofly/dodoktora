// app/platnosc-testowa/view.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function MockPaymentPage() {
  const sp = useSearchParams();
  const bookingId = sp?.get("bookingId") ?? "";
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  if (!bookingId) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-24">
        Brak ID rezerwacji. Wróć do{" "}
        <a className="text-blue-600 underline" href="/">
          strony głównej
        </a>
        .
      </main>
    );
  }

  const pay = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await fetch("/api/payments/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      const data = await res.json().catch(() => ({}));
      if (data?.ok) {
        router.push(`/dziekujemy?bookingId=${encodeURIComponent(bookingId)}`);
      } else {
        throw new Error("Błąd płatności (nieznany)");
      }
    } catch (e: any) {
      setErr(e?.message || "Błąd płatności");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-2">Płatność testowa</h1>
      <p className="text-gray-600 mb-6">Rezerwacja: {bookingId}</p>
      {err && <div className="mb-4 text-red-600">{err}</div>}
      <button className="btn" onClick={pay} disabled={loading}>
        {loading ? "Przetwarzanie..." : "Zapłać (symulacja)"}
      </button>
    </main>
  );
}
