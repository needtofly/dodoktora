'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'

type Booking = {
  id: string
  fullName: string
  email: string
  phone: string
  visitType: string
  doctor?: string | null
  date: string
  notes?: string | null
  status: string
  priceCents: number
  createdAt: string
  realized: boolean
  pesel?: string | null
}

function goToLogin() {
  if (typeof window !== 'undefined') {
    const next = encodeURIComponent(window.location.pathname || '/admin')
    window.location.href = `/admin/login?next=${next}`
  }
}

async function fetchBookings(): Promise<Booking[]> {
  const r = await fetch('/api/admin/bookings', {
    cache: 'no-store',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })

  if (r.status === 401) {
    goToLogin()
    throw new Error('HTTP 401 – Unauthorized')
  }

  const ct = r.headers.get('content-type') || ''
  if (!r.ok) {
    let msg = `HTTP ${r.status}`
    if (ct.includes('application/json')) {
      try {
        const d = await r.json()
        if (d?.error) msg = `HTTP ${r.status} – ${d.error}`
      } catch {}
    }
    throw new Error(msg)
  }

  if (!ct.includes('application/json')) return []
  const data = await r.json()

  // Akceptuj zarówno czystą tablicę, jak i obiekt { items: [...] } / { bookings: [...] }
  if (Array.isArray(data)) return data as Booking[]
  if (Array.isArray((data as any)?.items)) return (data as any).items as Booking[]
  if (Array.isArray((data as any)?.bookings)) return (data as any).bookings as Booking[]

  return []
}

function Badge({ status }: { status: string }) {
  const base = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'
  const cls =
    status === 'PAID'
      ? 'bg-green-100 text-green-700 border border-green-200'
      : status === 'PENDING'
      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      : 'bg-gray-100 text-gray-700 border border-gray-200'
  return <span className={`${base} ${cls}`}>{status}</span>
}

function extractAddress(notes?: string | null): string | null {
  if (!notes) return null
  const marker = 'Adres wizyty domowej:'
  const idx = notes.indexOf(marker)
  if (idx === -1) return null
  const after = notes.slice(idx + marker.length).trim()
  return after.split('\n')[0].trim()
}

function formatPLN(cents: number) {
  return (cents / 100).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN', minimumFractionDigits: 2 })
}

export default function AdminTable() {
  const [bookings, setBookings] = useState<Booking[] | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [error, setError] = useState<string>('')

  // diagnostyka cookie
  const [diag, setDiag] = useState<any | null>(null)
  const runDiag = async () => {
    try {
      const r = await fetch('/api/_diag/echo-cookies', { credentials: 'include', cache: 'no-store' })
      const d = await r.json().catch(() => ({}))
      setDiag(d)
    } catch {
      setDiag({ error: 'Diag failed' })
    }
  }

  // FILTRY
  const [filterDate, setFilterDate] = useState('')
  const [filterName, setFilterName] = useState('')
  const [filterPesel, setFilterPesel] = useState('')

  const load = async () => {
    setError('')
    try {
      const list = await fetchBookings()
      setBookings(list)
    } catch (e: any) {
      setError(e?.message || 'Błąd pobierania')
    }
  }

  useEffect(() => {
    load()
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    if (!bookings) return []
    return bookings.filter((b) => {
      let ok = true
      if (filterDate) {
        const d = new Date(b.date).toISOString().slice(0, 10)
        if (d !== filterDate) ok = false
      }
      if (filterName) {
        if (!b.fullName.toLowerCase().includes(filterName.toLowerCase())) ok = false
      }
      if (filterPesel) {
        const inNotes = (b.notes || '').includes(filterPesel)
        const inField = b.pesel ? String(b.pesel).includes(filterPesel) : false
        if (!inNotes && !inField) ok = false
      }
      return ok
    })
  }, [bookings, filterDate, filterName, filterPesel])

  // SUMY
  const totalAllCents = useMemo(
    () => (bookings ? bookings.reduce((sum, b) => sum + (b.priceCents || 0), 0) : 0),
    [bookings]
  )
  const totalFilteredCents = useMemo(
    () => filtered.reduce((sum, b) => sum + (b.priceCents || 0), 0),
    [filtered]
  )

  const toggleRealized = async (id: string, realized: boolean) => {
    const r = await fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ realized }),
    })
    if (r.status === 401) {
      goToLogin()
      return
    }
    if (!r.ok) {
      alert('Nie udało się zmienić statusu.')
      return
    }
    setBookings((prev) => (prev ? prev.map((b) => (b.id === id ? { ...b, realized } : b)) : prev))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tę wizytę?')) return
    const r = await fetch(`/api/admin/bookings/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (r.status === 401) {
      goToLogin()
      return
    }
    if (!r.ok) {
      alert('Nie udało się usunąć.')
      return
    }
    setBookings((prev) => (prev ? prev.filter((b) => b.id !== id) : prev))
    if (openId === id) setOpenId(null)
  }

  return (
    <div className="space-y-4">
      {/* Pasek akcji */}
      <div className="flex items-center gap-2">
        <button onClick={load} className="btn">Odśwież</button>
        <button onClick={runDiag} className="btn">Diag: cookie</button>
        {diag && (
          <code className="ml-2 text-xs bg-gray-100 border rounded px-2 py-1 overflow-x-auto">
            {(() => {
              try { return JSON.stringify({ host: diag.host, admin_auth: diag.admin_auth }, null, 2) }
              catch { return 'diag' }
            })()}
          </code>
        )}
      </div>

      {error && (
        <div className="p-4 text-red-700 bg-red-50 border border-red-200 rounded">
          {error}
          {error.includes('401') && (
            <div className="mt-2 text-sm">
              Wygląda na brak sesji admina (cookie). Kliknij „Diag: cookie” i sprawdź, czy <code>admin_auth</code> = "ok".
            </div>
          )}
        </div>
      )}

      {!bookings && !error && <div className="p-4">Ładowanie…</div>}
      {bookings && bookings.length === 0 && !error && <div className="p-4 text-gray-600">Brak rezerwacji.</div>}

      {bookings && bookings.length > 0 && (
        <>
          {/* FILTRY */}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Data</label>
              <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="border p-2 rounded" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Nazwisko / Imię i nazwisko</label>
              <input type="text" placeholder="np. Kowalska" value={filterName} onChange={(e) => setFilterName(e.target.value)} className="border p-2 rounded" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">PESEL</label>
              <input type="text" placeholder="11 cyfr" value={filterPesel} onChange={(e) => setFilterPesel(e.target.value)} className="border p-2 rounded" />
            </div>
            <button
              onClick={() => { setFilterDate(''); setFilterName(''); setFilterPesel(''); }}
              className="btn"
            >
              Wyczyść filtry
            </button>
          </div>

          {/* PODSUMOWANIA */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border bg-white p-4">
              <div className="text-sm text-gray-600 mb-1">
                {filterDate ? `Suma dla dnia ${filterDate}` : 'Suma (po filtrach)'}
              </div>
              <div className="text-2xl font-semibold">{formatPLN(totalFilteredCents)}</div>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <div className="text-sm text-gray-600 mb-1">Suma ogółem</div>
              <div className="text-2xl font-semibold">{formatPLN(totalAllCents)}</div>
            </div>
          </div>

          {/* TABELA */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-2xl overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Pacjent</th>
                  <th className="p-3 text-left">Kontakt</th>
                  <th className="p-3 text-left">Wizyta</th>
                  <th className="p-3 text-left">Data</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Cena</th>
                  <th className="p-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const isOpen = openId === b.id
                  const address = extractAddress(b.notes)

                  return (
                    <Fragment key={b.id}>
                      <tr className={`border-t hover:bg-gray-50 ${b.realized ? 'bg-green-50' : ''}`}>
                        <td className="p-3 align-top">
                          <button onClick={() => setOpenId(isOpen ? null : b.id)} className="text-left w-full hover:underline" title="Pokaż szczegóły">
                            {b.fullName}
                          </button>
                        </td>
                        <td className="p-3 align-top">
                          <div className="text-sm">{b.email}</div>
                          <div className="text-sm">{b.phone}</div>
                        </td>
                        <td className="p-3 align-top">
                          {b.visitType} {b.doctor && <span>({b.doctor})</span>}
                        </td>
                        <td className="p-3 align-top">{new Date(b.date).toLocaleString('pl-PL')}</td>
                        <td className="p-3 align-top"><Badge status={b.status} /></td>
                        <td className="p-3 align-top">{formatPLN(b.priceCents || 0)}</td>
                        <td className="p-3 align-top text-right space-x-2">
                          <button onClick={() => toggleRealized(b.id, !b.realized)} className="text-green-600 hover:underline text-sm">
                            {b.realized ? 'Odhacz' : 'Zrealizuj'}
                          </button>
                          <button onClick={() => handleDelete(b.id)} className="text-red-600 hover:underline text-sm">
                            Usuń
                          </button>
                        </td>
                      </tr>

                      {isOpen && (
                        <tr className="bg-gray-50">
                          <td colSpan={7} className="p-4">
                            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-800">
                              <div className="space-y-2">
                                <p><strong>ID:</strong> {b.id}</p>
                                <p><strong>Pacjent:</strong> {b.fullName}</p>
                                <p><strong>PESEL:</strong> {b.pesel || '—'}</p>
                                <p><strong>E-mail:</strong> {b.email}</p>
                                <p><strong>Telefon:</strong> {b.phone}</p>
                                <p><strong>Rodzaj wizyty:</strong> {b.visitType}</p>
                                {b.doctor && <p><strong>Lekarz:</strong> {b.doctor}</p>}
                                <p><strong>Data:</strong> {new Date(b.date).toLocaleString('pl-PL')}</p>
                                <p><strong>Status:</strong> {b.status}</p>
                                <p><strong>Kwota:</strong> {formatPLN(b.priceCents || 0)}</p>
                              </div>
                              <div className="space-y-2">
                                {address && (
                                  <p><strong>Adres wizyty domowej:</strong><br />{address}</p>
                                )}
                                {b.notes && (
                                  <p>
                                    <strong>Uwagi pacjenta:</strong><br />
                                    {b.notes.replace(/^Adres wizyty domowej:.*(\r?\n)?/i, '').trim() || '—'}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
