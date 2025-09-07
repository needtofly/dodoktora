// app/platnosc/p24/mock/view.tsx
"use client"

import { useMemo, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"

export default function MockView() {
  const sp = useSearchParams()
  const router = useRouter()

  const bookingId = useMemo(
    () => sp?.get("id") || sp?.get("bookingId") || sp?.get("booking") || "",
    [sp]
  )

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  const pay = useCallback(async () => {
    setError("")
    if (!bookingId) {
      setError("Brak ID rezerwacji. Wróć do strony głównej.")
      return
    }
    setLoading(true)
    try {
      const r = await fetch("/api/platnosc/p24/mock", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ bookingId }),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok || !data?.ok) {
        setError(data?.error || `Błąd płatności (HTTP ${r.status}).`)
        setLoading(false)
        return
      }
      const redirect = data.redirectUrl || data.url || "/success"
      router.replace(redirect)
    } catch (e: any) {
      setError(e?.message || "Błąd sieci")
      setLoading(false)
    }
  }, [bookingId, router])

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-semibold mb-2">Płatność testowa P24</h1>
      <p className="text-sm text-gray-600 mb-6">Rezerwacja: {bookingId || "—"}</p>

      {error && (
        <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700">{error}</div>
      )}

      <button className="btn btn-primary w-full h-12" onClick={pay} disabled={loading}>
        {loading ? "Przetwarzam…" : "Zapłać testowo"}
      </button>

      <p className="text-xs text-gray-500 mt-4">
        To tylko tryb testowy — nic nie obciążymy.
      </p>
    </main>
  )
}
