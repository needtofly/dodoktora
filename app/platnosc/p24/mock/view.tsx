// app/platnosc/p24/mock/view.tsx
'use client'

import { useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function P24MockView() {
  const sp = useSearchParams()
  const router = useRouter()

  // Bezpieczne pobieranie parametrów (gdy sp == null zwróci pusty string)
  const q = useCallback((key: string) => sp?.get(key) ?? '', [sp])

  // Akceptujemy różne nazwy: id / bookingId / booking
  const bookingId = useMemo(() => q('id') || q('bookingId') || q('booking') || '', [q])

  const amount = useMemo(() => {
    const v = parseFloat(q('amount') || '0')
    return Number.isFinite(v) ? v.toFixed(2) : '0.00'
  }, [q])

  const canPay = !!bookingId

  const onPay = async () => {
    if (!canPay) return
    try {
      // API zwraca JSON z redirectUrl/url albo Location w nagłówku
      const res = await fetch(`/api/platnosc/p24/mock?bookingId=${encodeURIComponent(bookingId)}`, {
        method: 'POST',
        cache: 'no-store',
      })

      const ct = res.headers.get('content-type') || ''
      if (ct.includes('application/json')) {
        const j = await res.json().catch(() => ({} as any))
        const url = j.redirectUrl || j.url || j.location
        if (url) {
          router.push(url)
          return
        }
      }

      const loc = res.headers.get('Location')
      if (loc) {
        router.push(loc)
        return
      }

      // awaryjnie — przejdź na success
      router.push(`/success?bookingId=${encodeURIComponent(bookingId)}`)
    } catch (e) {
      // tu można dodać toast/alert, ale nie blokujemy
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold mb-6">Płatność testowa P24</h1>

      <div className="rounded-2xl border bg-white p-5 space-y-3">
        <div className="text-sm text-gray-600">Rezerwacja:</div>
        <div className="font-mono text-sm break-all">{bookingId || '— brak —'}</div>

        <div className="text-sm text-gray-600 pt-2">Kwota:</div>
        <div className="text-xl font-semibold">{amount} zł</div>

        <button
          onClick={onPay}
          disabled={!canPay}
          className="btn btn-primary w-full h-12 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          title={canPay ? 'Zapłać testowo' : 'Brak ID rezerwacji'}
        >
          Zapłać testowo
        </button>
      </div>
    </main>
  )
}
