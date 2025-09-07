// C:\Users\JS Enterprise\telemed\app\platnosc-testowa\view.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestPaymentButton(props: { bookingId?: string }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  const startPayment = async () => {
    setLoading(true);
    setErr(null);

    try {
      const res = await fetch('/api/payments/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ bookingId: props.bookingId ?? null }),
      });

      // Spróbuj wczytać JSON niezależnie od statusu
      let data: any = null;
      try { data = await res.json(); } catch { /* ok; brak/zepsuty JSON */ }

      if (!res.ok) {
        // Serwer zwrócił błąd (np. 400/422/500)
        setErr(data?.error || `Błąd płatności (HTTP ${res.status})`);
        setLoading(false);
        return;
      }

      const redirectUrl = data?.redirectUrl;
      if (!redirectUrl || typeof redirectUrl !== 'string') {
        setErr('Brak adresu przekierowania (redirectUrl) w odpowiedzi API.');
        setLoading(false);
        return;
      }

      // Sukces → przejście do „bramki” (tu: nasza strona mockowa)
      router.push(redirectUrl);
    } catch (e: any) {
      setErr(e?.message || 'Nieoczekiwany błąd po stronie przeglądarki.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={startPayment}
        disabled={loading}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
      >
        {loading ? 'Przetwarzanie…' : 'Zapłać testowo'}
      </button>

      {err && (
        <p className="text-sm text-red-600">
          {err}
        </p>
      )}
    </div>
  );
}
