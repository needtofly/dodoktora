"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

export default function P24MockView() {
  const sp = useSearchParams();

  // akceptujemy różne nazwy: id / bookingId / booking
  const bookingId = useMemo(
    () => sp.get("id") || sp.get("bookingId") || sp.get("booking") || "",
    [sp]
  );

  const amountNum = useMemo(() => {
    const raw = sp.get("amount") || sp.get("value") || sp.get("total") || "0";
    const v = parseFloat(raw.replace(",", "."));
    return Number.isFinite(v) ? v : 0;
  }, [sp]);

  const payHref = useMemo(() => {
    if (!bookingId || amountNum <= 0) return null;
    // Tu używamy istniejącego endpointu testowego
    return `/api/payments/test?id=${encodeURIComponent(
      bookingId
    )}&amount=${encodeURIComponent(amountNum.toFixed(2))}`;
  }, [bookingId, amountNum]);

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-4">Płatność testowa P24</h1>

      {!bookingId ? (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-red-700">
          Brak ID rezerwacji. Wróć do strony głównej.
        </div>
      ) : (
        <>
          <p className="mb-1">Rezerwacja: <strong>{bookingId}</strong></p>
          <p className="mb-6">Kwota: <strong>{amountNum.toFixed(2)} zł</strong></p>

          {payHref ? (
            // zwykły <a> – zawsze „klikalny”
            <a className="btn btn-primary" href={payHref}>
              Zapłać testowo
            </a>
          ) : (
            <div className="rounded border border-red-200 bg-red-50 p-3 text-red-700">
              Nieprawidłowa kwota.
            </div>
          )}
        </>
      )}
    </main>
  );
}
