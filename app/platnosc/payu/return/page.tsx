// app/platnosc/payu/return/page.tsx
"use client";

import { useEffect, useState } from "react";

type UiState = "checking" | "paid" | "rejected" | "unpaid" | "error";

export default function PayUReturnPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const bookingId = String(searchParams?.bookingId || "");
  const [status, setStatus] = useState<UiState>("checking");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function poll() {
      try {
        if (!bookingId) {
          setStatus("error");
          setMessage("Brak identyfikatora rezerwacji.");
          return;
        }

        const r = await fetch(`/api/bookings?id=${encodeURIComponent(bookingId)}`, {
          cache: "no-store",
        });
        const j = await r.json();

        if (!r.ok || !j?.ok) {
          setStatus("error");
          setMessage(j?.error || `Błąd serwera (${r.status})`);
          return;
        }

        const pay = String(j.booking?.paymentStatus || "").toUpperCase();
        const st = String(j.booking?.status || "").toUpperCase();

        if (pay === "PAID" || st === "CONFIRMED") {
          setStatus("paid");
          return; // stop polling
        }

        if (pay === "REJECTED" || st === "CANCELLED") {
          setStatus("rejected");
          setMessage("Płatność odrzucona lub anulowana.");
          return; // stop polling
        }

        // wciąż w toku — polling co 2s
        timer = setTimeout(poll, 2000);
      } catch (e: any) {
        setStatus("error");
        setMessage(String(e?.message || e));
      }
    }

    setStatus("checking");
    setMessage("");
    poll();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [bookingId]);

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Finalizacja płatności</h1>
      <p className="text-gray-600 mb-6">
        Sprawdzamy status Twojej transakcji w PayU. To zwykle trwa kilka sekund.
      </p>

      {status === "checking" && (
        <div className="rounded-xl border p-4 bg-white shadow-sm">Trwa weryfikacja płatności…</div>
      )}

      {status === "paid" && (
        <div className="rounded-xl border p-4 bg-green-50 border-green-200 text-green-800 shadow-sm">
          ✅ Płatność przyjęta. Potwierdzenie rezerwacji zostało zapisane.
          <div className="mt-4">
            <a href="/" className="btn btn-primary">Wróć na stronę główną</a>
          </div>
        </div>
      )}

      {status === "rejected" && (
        <div className="rounded-xl border p-4 bg-red-50 border-red-200 text-red-700 shadow-sm">
          ❌ Płatność odrzucona lub anulowana. Twoja rezerwacja nie została opłacona, a termin został zwolniony.
          <div className="mt-4 space-x-2">
            <a href="/" className="btn">Wróć</a>
            <a href="/#umow" className="btn btn-primary">Umów ponownie</a>
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
          ⏳ Płatność w trakcie. Jeśli środki zostały pobrane, status zaktualizuje się wkrótce.
        </div>
      )}
    </main>
  );
}
