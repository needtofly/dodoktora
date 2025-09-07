// app/platnosc/p24/mock/page.tsx
'use client'

import { Suspense, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function MockInner() {
  const sp = useSearchParams()
  const router = useRouter()

  // akceptujemy różne nazwy: id / bookingId / booking
  const bookingId = useMemo(
    () => sp?.get('id') || sp?.get('bookingId') || sp?.get('booking') || '',
    [sp]
  )

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const handlePay = async () => {
    if (!bookingId) return
    setError('')
    setLoading(true)
    try {
      const r = await fetch('/api/payments/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok || !j?.redirectUrl) {
        throw new Error(j?.error || `HTTP ${r.status}`)
      }
      // backend zwraca redirectUrl, przechodzimy na stronę sukcesu/return
      router.push(j.redirectUrl)
    } catch (e: any) {
      setError(e?.message || 'Błąd płatności')
    } finally {
      setLoading(false)
    }
  }

  if (!bookingId) {
    return (
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Płatność testowa P24</h1>
        <div className="rounded border border-yellow-200 bg-yellow-50 p-3 text-yellow-800">
          Brak ID rezerwacji. <a className="underline" href="/">Wróć na stronę główną</a>.
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Płatność testowa P24</h1>
      <p className="text-sm text-gray-600 mb-6">Rezerwacja: <code>{bookingId}</code></p>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>
      )}

      <button className="btn btn-primary" onClick={handlePay} disabled={loading}>
        {loading ? 'Przetwarzam…' : 'Zapłać testowo'}
      </button>
    </main>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Ładowanie…</div>}>
      <MockInner />
    </Suspense>
  )
}
