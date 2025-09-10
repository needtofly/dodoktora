"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | string;
type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED" | string;

export default function P24ReturnClient() {
  const sp = useSearchParams();
  const bookingId = sp?.get("bookingId") || "";
  const err = sp?.get("error") || "";

  const [loading, setLoading] = useState(Boolean(bookingId));
  const [status, setStatus] = useState<BookingStatus | null>(null);
  const [payment, setPayment] = useState<PaymentStatus | null>(null);

  const isError = !!err;
  const isPaid = payment === "PAID";

  // Pullujemy status kilka razy (żeby webhook zdążył wpaść)
  useEffect(() => {
    if (!bookingId) return;
    let alive = true;
    let tries = 0;

    const tick = async () => {
      tries++;
      try {
        const r = await fetch(`/api/bookings?id=${encodeURIComponent(bookingId)}`, { cache: "no-store" });
        const d = await r.json();
        if (!alive) return;

        if (d?.ok && d?.booking) {
          setStatus(d.booking.status);
          setPayment(d.booking.paymentStatus);
          if (d.booking.paymentStatus === "PAID" || tries >= 6) {
            setLoading(false);
            return;
          }
        }
      } catch {
        // ignoruj i spróbuj ponownie
      }
      if (!alive) return;
      setTimeout(tick, 1500);
    };

    tick();
    return () => {
      alive = false;
    };
  }, [bookingId]);

  const Title = useMemo(() => {
    if (isError) return "Płatność przerwana";
    if (isPaid) return "Płatność przyjęta";
    return "Kończenie płatności…";
  }, [isError, isPaid]);

  const Subtitle = useMemo(() => {
    if (isError) return "Wygląda na to, że płatność została anulowana lub nie powiodła się.";
    if (isPaid) return "Dziękujemy! Twoja rezerwacja została potwierdzona.";
    return "To potrwa kilka sekund. Sprawdzamy status transakcji…";
  }, [isError, isPaid]);

  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <div className="bg-white border rounded-2xl shadow-sm p-8 text-center space-y-4">
        {/* Ikona statusu */}
        {!isError && !isPaid && (
          <div className="mx-auto w-16 h-16 rounded-full border animate-pulse flex items-center justify-center">
            <span className="text-xl">⏳</span>
          </div>
        )}
        {isPaid && (
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
            <span className="text-2xl">✓</span>
          </div>
        )}
        {isError && (
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
            <span className="text-2xl">!</span>
          </div>
        )}

        <h1 className="text-2xl font-semibold">{Title}</h1>
        <p className="text-gray-600">{Subtitle}</p>

        {/* Szczegóły (jeśli mamy bookingId) */}
        {bookingId ? (
          <div className="mt-4 text-sm text-gray-600">
            <div>ID rezerwacji: <span className="font-mono">{bookingId}</span></div>
            {status && <div>Status wizyty: <strong>{status}</strong></div>}
            {payment && <div>Status płatności: <strong>{payment}</strong></div>}
            {loading && <div className="mt-1 italic">Aktualizuję…</div>}
          </div>
        ) : (
          <div className="mt-2 text-sm text-gray-600">
            Brak identyfikatora rezerwacji w adresie powrotu.
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn btn-primary min-w-[220px] text-center">Przejdź do strony głównej</Link>
          <Link href="/uslugi" className="btn min-w-[220px] text-center">Umów kolejną wizytę</Link>
        </div>

        {!isError && (
          <p className="text-xs text-gray-500 mt-6">
            Potwierdzenie płatności wyślemy e-mailem. Jeśli status nie zmieni się automatycznie, odśwież stronę za chwilę.
          </p>
        )}
      </div>
    </main>
  );
}
