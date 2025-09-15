"use client";

import { useEffect, useState } from "react";

export default function PayUReturnPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const bookingId = String(searchParams?.bookingId || "");
  const [status, setStatus] = useState<"checking" | "paid" | "unpaid" | "error">("checking");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let timer: number | undefined;
    async function poll() {
      try {
        if (!bookingId) {
          setStatus("error");
          setMessage("Brak identyfikatora rezerwacji.");
          return;
        }
        const r = await fetch(`/api/bookings?id=${encodeURIComponent(bookingId)}`, { cache: "no-store" });
        const j = await r.json();
        if (!r.ok || !j?.ok) {
          setStatus("error");
          setMessage(j?.error || `Błąd serwera (${r.status})`);
          return;
        }
        const pay = (j.booking?.paymentStatus || "").toUpperCase();
        if (pay === "PAID") {
          setStatus("paid");
          return;
        }
        // jeżeli jeszcze nie zapłacone — odśwież co 2s
        timer = window.setTimeout(poll, 2000);
      } catch (e: any) {
        setStatus("error");
        setMessage(String(e?.message || e));
      }
    }
    poll();
    return () => timer && window.clearTimeout(timer);
  }, [bookingId]);

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Finalizacja płatności</h1>
      <p className="text-gray-600 mb-6">
        Sprawdzamy status Twojej transakcji w PayU. To zwykle trwa kilka sekund.
      </p>

      {status === "checking" && (
        <div className="rounded-xl border p-4 bg-white shadow-sm">
          Trwa weryfikacja płatności…
        </div>
      )}

      {status === "paid" && (
        <div className="rounded-xl border p-4 bg-green-50 border-green-200 text-green-800 shadow-sm">
          ✅ Płatność przyjęta. Potwierdzenie rezerwacji zostało zapisane.
          <div className="mt-4">
            <a href="/" className="btn btn-primary">Wróć na stronę główną</a>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-xl border p-4 bg-red-50 border-red-200 text-red-700 shadow-sm">
          ❌ Coś poszło nie tak: {message || "Nieznany błąd."}
          <div className="mt-4 space-x-2">
            <a href="/" className="btn">Wróć</a>
            {bookingId && (
              <a href={`/platnosc/payu/return?bookingId=${encodeURIComponent(bookingId)}`} className="btn btn-primary">
                Spróbuj ponownie
              </a>
            )}
          </div>
        </div>
      )}

      {status === "unpaid" && (
        <div className="rounded-xl border p-4 bg-yellow-50 border-yellow-200 text-yellow-800 shadow-sm">
          ⏳ Płatność w trakcie lub nieudana. Jeśli środki zostały pobrane, status zaktualizuje się wkrótce.
        </div>
      )}
    </main>
  );
}
