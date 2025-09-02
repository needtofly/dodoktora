"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

type Booking = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  visitType: string;
  doctor?: string | null;
  date: string; // z API przyjdzie ISO
  priceCents: number;
  status: string;
};

function ThanksInner() {
  const sp = useSearchParams();
  const bookingId = sp?.get("bookingId") ?? "";

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }
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
      <main className="max-w-3xl mx-auto px-4 py-24 text-center">
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
      <main className="max-w-3xl mx-auto px-4 py-24 text-center">
        Ładowanie szczegółów rezerwacji…
      </main>
    );
  }

  if (err) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-3">Błąd</h1>
        <p className="text-red-600 mb-6">{err}</p>
        <a className="btn" href="/">
          Wróć na stronę główną
        </a>
      </main>
    );
  }

  const when = booking?.date ? new Date(booking.date).toLocaleString("pl-PL") : "—";
  const price =
    typeof booking?.priceCents === "number"
      ? (booking.priceCents / 100).toFixed(2) + " zł"
      : "—";

  return (
    <main className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-3">Dziękujemy — płatność przyjęta</h1>
      {booking?.email && (
        <p className="text-gray-700 mb-6">
          Wysłaliśmy potwierdzenie na adres <strong>{booking.email}</strong>. Jeśli nie widzisz wiadomości — sprawdź spam.
        </p>
      )}
      {booking ? (
        <div className="inline-block text-left bg-white rounded-2xl border p-6">
          <p>
            <strong>Wizyta:</strong> {booking.visitType}
          </p>
          <p>
            <strong>Pacjent:</strong> {booking.fullName}
          </p>
          <p>
            <strong>Termin:</strong> {when}
          </p>
          {booking.doctor && (
            <p>
              <strong>Lekarz:</strong> {booking.doctor}
            </p>
          )}
          <p>
            <strong>Cena:</strong> {price}
          </p>
        </div>
      ) : (
        <div>Nie znaleziono rezerwacji.</div>
      )}
      <div className="mt-8">
        <a href="/" className="btn">
          Strona główna
        </a>
      </div>
    </main>
  );
}

export default function ThanksPage() {
  // Suspense rozwiązuje ostrzeżenia Next o useSearchParams przy budowie
  return (
    <Suspense fallback={<main className="max-w-3xl mx-auto px-4 py-24 text-center">Ładowanie…</main>}>
      <ThanksInner />
    </Suspense>
  );
}
