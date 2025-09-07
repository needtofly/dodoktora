// C:\Users\JS Enterprise\telemed\app\platnosc\p24\mock\page.tsx
import Link from 'next/link';

export default function MockP24({ searchParams }: { searchParams: { tx?: string } }) {
  const tx = searchParams?.tx || 'brak-tx';

  return (
    <main className="max-w-lg mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Mock P24</h1>
      <p>Symulacja płatności dla transakcji: <strong>{tx}</strong></p>

      <div className="space-x-2">
        <Link
          className="inline-block px-4 py-2 rounded bg-green-600 text-white"
          href={`/success?tx=${encodeURIComponent(tx)}`}
        >
          Zasymuluj SUKCES
        </Link>

        <Link
          className="inline-block px-4 py-2 rounded bg-red-600 text-white"
          href={`/cancel?tx=${encodeURIComponent(tx)}`}
        >
          Zasymuluj ANULOWANIE
        </Link>
      </div>
    </main>
  );
}
