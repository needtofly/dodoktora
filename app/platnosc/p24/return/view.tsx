// app/platnosc/p24/return/view.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Booking = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  visitType: "Teleporada" | "Wizyta domowa" | string;
  doctor?: string | null;
  date: string | Date;
  status: string;
  priceCents: number;
};

export default function ReturnPage() {
  const sp = useSearchParams();
  const bookingId = sp?.get("bookingId") ?? "";
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!bookingId) return;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}`, {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || `HTTP ${res.status}`);
        }
        const data = (await res.json()) as Booking;
        setBooking(data);
      } catch (e: any) {
        setErr(e?.message || "Nie udało się pobrać danych rezerwacji.");
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId]);

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

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-24">
        Sprawdzanie statusu płatności…
      </main>
    );
  }

  if (err) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-24">
        <h1 className="text-2xl font-bold mb-3">Błąd</h1>
        <p className="text-red-600 mb-6">{err}</p>
        <a className="btn" href={`/platnosc-testowa?bookingId=${encodeURIComponent(bookingId)}`}>
          Spróbuj zapłacić ponownie (symulacja)
        </a>
      </main>
    );
  }

  const when = booking?.date ? new Date(booking.date).toLocaleString("pl-PL") : "—";
  const price =
    typeof booking?.priceCents === "number" ? (booking.priceCents / 100).toFixed(2) + " zł" : "—";

  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-4">Status płatności</h1>

      {booking ? (
        <div className="card p-6 space-y-3">
          <div>
            <div className="text-sm text-gray-500">ID rezerwacji</div>
            <div className="font-mono text-sm">{booking.id}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Pacjent</div>
              <div className="font-medium">{booking.fullName}</div>
              <div className="text-sm text-gray-600">{booking.email || "—"}</div>
              <div className="text-sm text-gray-600">{booking.phone || "—"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Wizyta</div>
              <div className="font-medium">
                {booking.visitType}
                {booking.doctor ? ` — ${booking.doctor}` : ""}
              </div>
              <div className="text-sm text-gray-600">Termin: {when}</div>
              <div className="text-sm text-gray-600">Kwota: {price}</div>
            </div>
          </div>

          <div className="pt-2">
            <div className="text-sm text-gray-500">Status</div>
            <div
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                booking.status === "PAID"
                  ? "bg-green-100 text-green-700"
                  : booking.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {booking.status}
            </div>
          </div>

          {booking.status !== "PAID" && (
            <div className="pt-4">
              <a className="btn" href={`/platnosc-testowa?bookingId=${encodeURIComponent(bookingId)}`}>
                Zapłać ponownie (symulacja)
              </a>
            </div>
          )}
        </div>
      ) : (
        <div>Nie znaleziono rezerwacji.</div>
      )}
    </main>
  );
}
