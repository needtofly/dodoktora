// components/AdminTable.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type VisitType = 'TELEPORADA' | 'WIZYTA_DOMOWA';
type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';
type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export type Booking = {
  id: string;
  createdAt: string;
  appointmentAt?: string | null;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  pesel?: string | null;
  visitType: VisitType;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  postalCode?: string | null;
  status: BookingStatus;
  completedAt?: string | null;
  paymentStatus: PaymentStatus;
  paymentRef?: string | null;
  priceCents?: number | null;
};

function fmtDate(d?: string | null) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleString();
}

function addressOf(b: Booking) {
  if (b.visitType !== 'WIZYTA_DOMOWA') return '—';
  const parts = [b.addressLine1, b.addressLine2, b.postalCode, b.city].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
}

export default function AdminTable() {
  const [list, setList] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'' | BookingStatus>('');
  const [paymentStatus, setPaymentStatus] = useState<'' | PaymentStatus>('');
  const [visitType, setVisitType] = useState<'' | VisitType>('');

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (status) params.set('status', status);
      if (paymentStatus) params.set('paymentStatus', paymentStatus);
      if (visitType) params.set('visitType', visitType);

      const res = await fetch(`/api/admin/bookings?${params.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setList(data.bookings as Booking[]);
    } catch (e: any) {
      setErr(e?.message || 'Nie udało się pobrać listy.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markCompleted = async (id: string) => {
    if (!confirm('Oznaczyć wizytę jako zrealizowaną?')) return;
    const res = await fetch(`/api/admin/bookings/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: 'COMPLETED' }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      alert(data?.error || `Nie udało się zaktualizować (HTTP ${res.status})`);
      return;
    }
    setList((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'COMPLETED', completedAt: new Date().toISOString() } : b)));
  };

  const updatePayment = async (id: string, newStatus: PaymentStatus, newRef: string) => {
    const res = await fetch(`/api/admin/bookings/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ paymentStatus: newStatus, paymentRef: newRef }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      alert(data?.error || `Nie udało się zapisać płatności (HTTP ${res.status})`);
      return;
    }
    setList((prev) => prev.map((b) => (b.id === id ? { ...b, paymentStatus: newStatus, paymentRef: newRef || null } : b)));
  };

  const removeBooking = async (id: string) => {
    if (!confirm('Usunąć wizytę bezpowrotnie?')) return;
    const res = await fetch(`/api/admin/bookings/${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      alert(data?.error || `Nie udało się usunąć (HTTP ${res.status})`);
      return;
    }
    setList((prev) => prev.filter((b) => b.id !== id));
  };

  const filtered = useMemo(() => list, [list]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Panel rezerwacji</h1>

      <div className="grid gap-2 md:grid-cols-4">
        <input
          className="border rounded px-3 py-2"
          placeholder="Szukaj (imię, email, telefon, PESEL, numer płatności)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
        <select className="border rounded px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value as any)}>
          <option value="">Status wizyty (wszystkie)</option>
          <option value="PENDING">PENDING</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <select className="border rounded px-3 py-2" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as any)}>
          <option value="">Status płatności (wszystkie)</option>
          <option value="UNPAID">UNPAID</option>
          <option value="PAID">PAID</option>
          <option value="REFUNDED">REFUNDED</option>
        </select>
        <select className="border rounded px-3 py-2" value={visitType} onChange={(e) => setVisitType(e.target.value as any)}>
          <option value="">Typ wizyty (wszystkie)</option>
          <option value="TELEPORADA">TELEPORADA</option>
          <option value="WIZYTA_DOMOWA">WIZYTA DOMOWA</option>
        </select>
        <div className="md:col-span-4 flex gap-2">
          <button className="px-4 py-2 rounded bg-black text-white" onClick={load}>Filtruj</button>
          <button
            className="px-4 py-2 rounded border"
            onClick={() => {
              setQ(''); setStatus(''); setPaymentStatus(''); setVisitType(''); load();
            }}
          >
            Wyczyść
          </button>
        </div>
      </div>

      {err && <p className="text-red-600">{err}</p>}
      {loading && <p>Ładowanie…</p>}

      {!loading && !filtered.length && <p>Brak rezerwacji.</p>}

      {!!filtered.length && (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="p-2 border">Data zgł.</th>
                <th className="p-2 border">Termin</th>
                <th className="p-2 border">Pacjent</th>
                <th className="p-2 border">PESEL</th>
                <th className="p-2 border">Typ</th>
                <th className="p-2 border">Adres (domowa)</th>
                <th className="p-2 border">Kontakt</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Płatność</th>
                <th className="p-2 border">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="odd:bg-white even:bg-gray-50 align-top">
                  <td className="p-2 border whitespace-nowrap">{fmtDate(b.createdAt)}</td>
                  <td className="p-2 border whitespace-nowrap">
                    {fmtDate(b.appointmentAt)}
                  </td>
                  <td className="p-2 border">
                    <div className="font-medium">{b.fullName || '—'}</div>
                    <div className="text-xs text-gray-500">#{b.id}</div>
                  </td>
                  <td className="p-2 border">{b.pesel || '—'}</td>
                  <td className="p-2 border">{b.visitType}</td>
                  <td className="p-2 border">{addressOf(b)}</td>
                  <td className="p-2 border">
                    <div>{b.phone || '—'}</div>
                    <div className="text-xs text-gray-600">{b.email || '—'}</div>
                  </td>
                  <td className="p-2 border">
                    <div>{b.status}</div>
                    {b.completedAt && <div className="text-xs text-gray-600">({fmtDate(b.completedAt)})</div>}
                  </td>
                  <td className="p-2 border">
                    <div className="flex flex-col gap-1">
                      <select
                        className="border rounded px-2 py-1"
                        defaultValue={b.paymentStatus}
                        onChange={(e) => updatePayment(b.id, e.target.value as PaymentStatus, b.paymentRef || '')}
                      >
                        <option value="UNPAID">UNPAID</option>
                        <option value="PAID">PAID</option>
                        <option value="REFUNDED">REFUNDED</option>
                      </select>
                      <input
                        className="border rounded px-2 py-1"
                        placeholder="Numer transakcji (P24)"
                        defaultValue={b.paymentRef || ''}
                        onBlur={(e) => updatePayment(b.id, b.paymentStatus, e.currentTarget.value)}
                      />
                    </div>
                  </td>
                  <td className="p-2 border">
                    <div className="flex flex-wrap gap-2">
                      {b.status !== 'COMPLETED' && (
                        <button
                          className="px-3 py-1 rounded bg-green-600 text-white"
                          onClick={() => markCompleted(b.id)}
                        >
                          Zrealizowana
                        </button>
                      )}
                      <button
                        className="px-3 py-1 rounded bg-red-600 text-white"
                        onClick={() => removeBooking(b.id)}
                      >
                        Usuń
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-xs text-gray-500">
        Wskazówka: edytuj status płatności z listy, a numer transakcji wpisz w polu – zapisuje się przy wyjściu z pola.
      </div>
    </div>
  );
}
