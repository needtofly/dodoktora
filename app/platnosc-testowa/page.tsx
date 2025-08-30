'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function MockPaymentPage() {
  const sp = useSearchParams()
  const bookingId = sp.get('bookingId') || ''
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  if (!bookingId) return <main className="max-w-3xl mx-auto px-4 py-24">Brak ID rezerwacji.</main>

  const pay = async () => {
    setLoading(true)
    const res = await fetch('/api/payments/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId })
    })
    setLoading(false)
    if (!res.ok) { alert('Błąd płatności testowej'); return }
    router.push(`/dziekujemy?bookingId=${bookingId}`)
  }

  return (
    <main className="max-w-md mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-2">Płatność testowa</h1>
      <p className="text-gray-600 mb-6">Kliknij poniżej, aby oznaczyć wizytę jako opłaconą.</p>
      <button onClick={pay} disabled={loading} className="btn btn-primary">
        {loading ? 'Przetwarzam…' : 'Opłać (test)'}
      </button>
    </main>
  )
}
