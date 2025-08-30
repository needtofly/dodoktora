'use client'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function P24MockPage() {
  const sp = useSearchParams()
  const bookingId = sp.get('bookingId') || ''
  const amount = sp.get('amount') || ''
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  if (!bookingId) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        Brak ID rezerwacji. <a className="text-blue-600 underline" href="/">Wróć</a>.
      </main>
    )
  }

  const pay = async () => {
    setErr('')
    setLoading(true)
    try {
      const res = await fetch('/api/payments/p24/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, amount: Number(amount || '0') }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        setLoading(false)
        setErr(data?.error || `Błąd płatności (${res.status}).`)
        return
      }
      router.replace(`/platnosc/p24/return?bookingId=${encodeURIComponent(bookingId)}`)
    } catch {
      setLoading(false)
      setErr('Błąd sieci — spróbuj ponownie.')
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-2">Przelewy24 (mock)</h1>
      <p className="text-gray-600 mb-6">To jest tryb testowy. Kliknij, aby zasymulować płatność.</p>

      {err && <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{err}</div>}

      <button onClick={pay} className="btn btn-primary" disabled={loading}>
        {loading ? 'Przetwarzam…' : 'Zapłać (symulacja)'}
      </button>
    </main>
  )
}
