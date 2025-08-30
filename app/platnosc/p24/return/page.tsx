'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type Booking = {
  id: string
  fullName: string
  visitType: string
  date: string
  status: string
  priceCents: number
}

export default function ReturnPage() {
  const sp = useSearchParams()
  const bookingId = sp.get('bookingId') || ''
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!bookingId) return
    fetch(`/api/bookings/${bookingId}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        if (d?.id) setBooking(d)
        else setErr('Nie znaleziono rezerwacji.')
      })
      .catch(() => setErr('Błąd podczas sprawdzania rezerwacji.'))
      .finally(() => setLoading(false))
  }, [bookingId])

  if (!bookingId) {
    return (
      <main className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Brak ID rezerwacji</h1>
        <a href="/" className="text-blue-600 underline">Wróć na stronę główną</a>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-16 text-center">
      {loading && <p>Sprawdzanie statusu płatności...</p>}

      {!loading && booking && booking.status === 'PAID' && (
        <>
          <h1 className="text-3xl font-bold text-green-600 mb-4">Płatność przyjęta ✅</h1>
          <p className="text-lg mb-6">Twoja wizyta została potwierdzona.</p>
          <div className="bg-white rounded-xl shadow p-6 text-left space-y-3">
            <p><strong>Pacjent:</strong> {booking.fullName}</p>
            <p><strong>Rodzaj wizyty:</strong> {booking.visitType}</p>
            <p><strong>Data:</strong> {new Date(booking.date).toLocaleString('pl-PL')}</p>
            <p><strong>Status:</strong> {booking.status}</p>
            <p><strong>Kwota:</strong> {(booking.priceCents / 100).toFixed(2)} zł</p>
          </div>
          <a href="/" className="btn btn-primary mt-8">Wróć na stronę główną</a>
        </>
      )}

      {!loading && (err || (booking && booking.status !== 'PAID')) && (
        <>
          <h1 className="text-3xl font-bold text-red-600 mb-4">Błąd płatności ❌</h1>
          <p className="mb-4">{err || 'Twoja płatność nie została zaksięgowana.'}</p>
          <a href="/#umow" className="btn btn-primary">Spróbuj ponownie</a>
        </>
      )}
    </main>
  )
}
