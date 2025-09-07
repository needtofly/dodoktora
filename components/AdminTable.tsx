// components/AdminTable.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';

type VisitType = 'TELEPORADA' | 'WIZYTA_DOMOWA' | string;
type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED' | string;
type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | string;

export type Booking = {
  id: string;
  createdAt: string;
  date: string;

  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  pesel?: string | null;

  visitType: VisitType;

  // adresy
  address?: string | null; // legacy
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  postalCode?: string | null;

  notes?: string | null;
  doctor?: string | null;

  status: BookingStatus;
  completedAt?: string | null;

  paymentStatus: PaymentStatus;
  paymentRef?: string | null;
  priceCents?: number | null;
  currency?: string | null;
};

function fmtDateTime(iso?: string | null) {
  if (!iso) return '—';
  const dt = new Date(iso);
  return dt.toLocaleString('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function moneyPLN(cents?: number | null, currency = 'PLN') {
  if (typeof cents !== 'number') return '—';
  const val = cents / 100;
  try {
    return new Intl.NumberFormat('pl-PL', { style: 'currency', currency }).format(val);
  } catch {
    return `${val.toFixed(2)} ${currency}`;
  }
}

function pickAddressParts(b: Booking) {
  const parts = [b.addressLine1, b.addressLine2, b.postalCode, b.city]
    .map((x) => (x ?? '').trim())
    .filter(Boolean) as string[];
  return parts.length ? parts.join(', ') : '';
}

function fullAddress(b: Booking) {
  const structured = pickAddressParts(b);
  const legacy = (b.address ?? '').trim();
  return structured || legacy || '—';
}

export default function AdminTable() {
  const [list, setList] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // filtry
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [visitType, setVisitType] = useState('');

  // rozwinięcia
  const [open, setOpen] = useState<Record<string, boolean>>({});

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

  const toggleOpen = (id: string) => setOpen((s) => ({ ...s, [id]: !s[id] }));

  const setStatusApi = async (id: string, newStatus: BookingStatus) => {
    const res = await fetch(`/api/admin/bookings/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      alert(data?.error || `Nie udało się zaktualizować (HTTP ${res.status})`);
      return false;
    }
    setList((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: newStatus, completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : null } : b,
      ),
    );
    return true;
  };

  const markCompleted = (id: string) => setStatusApi(id, 'COMPLETED');
  const revertCompleted = (id: string) => setStatusApi(id, 'CONFIRMED');

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

      {/* Filtry */}
      <div className="grid gap-2 md:grid-cols-4">
        <input
          className="border rounded px-3 py-2"
          placeholder="Szukaj (imię, email, telefon, PESEL, numer płatności, adres, ID)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
        <select className="border rounded px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Status wizyty (wszystkie)</option>
          <option value="PENDING">PENDING</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <select className="border rounded px-3 py-2" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
          <option value="">Status płatności (wszystkie)</option>
          <option value="UNPAID">UNPAID</option>
          <option value="PAID">PAID</option>
          <option value="REFUNDED">REFUNDED</option>
        </select>
        <select className="border rounded px-3 py-2" value={visitType} onChange={(e) => setVisitType(e.target.value)}>
          <option value="">Typ wizyty (wszystkie)</option>
          <option value="TELEPORADA">TELEPORADA</option>
          <option value="WIZYTA_DOMOWA">WIZYTA DOMOWA</option>
        </select>
        <div className="md:col-span-4 flex gap-2">
          <button className="px-4 py-2 rounded bg-black text-white" onClick={load}>
            Filtruj
          </button>
          <button
            className="px-4 py-2 rounded border"
            onClick={() => {
              setQ('');
              setStatus('');
              setPaymentStatus('');
              setVisitType('');
              load();
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
                <th className="p-2 border w-12"> </th>
                <th className="p-2 border whitespace-nowrap">Data zgł.</th>
                <th className="p-2 border whitespace-nowrap">Termin</th>
                <th className="p-2 border">Pacjent</th>
                <th className="p-2 border">Typ</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Płatność</th>
                <th className="p-2 border">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => {
                const isCompleted = (b.status as string) === 'COMPLETED';
                const rowBg = isCompleted ? 'bg-green-50' : '';
                const detailBg = isCompleted ? 'bg-green-50' : 'bg-gray-50';
                return (
                  <FragmentRow
                    key={b.id}
                    b={b}
                    open={!!open[b.id]}
                    onToggle={() => toggleOpen(b.id)}
                    rowBg={rowBg}
                    detailBg={detailBg}
                    markCompleted={() => markCompleted(b.id)}
                    revertCompleted={() => revertCompleted(b.id)}
                    removeBooking={() => removeBooking(b.id)}
                    updatePayment={updatePayment}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-xs text-gray-500">Tip: kliknij strzałkę, aby rozwinąć szczegóły wizyty.</div>
    </div>
  );
}

type RowProps = {
  b: Booking;
  open: boolean;
  onToggle: () => void;
  rowBg: string;
  detailBg: string;
  markCompleted: () => void;
  revertCompleted: () => void;
  removeBooking: () => void;
  updatePayment: (id: string, status: PaymentStatus, ref: string) => void;
};

function FragmentRow({
  b,
  open,
  onToggle,
  rowBg,
  detailBg,
  markCompleted,
  revertCompleted,
  removeBooking,
  updatePayment,
}: RowProps) {
  const isCompleted = (b.status as string) === 'COMPLETED';

  return (
    <>
      {/* GŁÓWNY WIERSZ */}
      <tr className={`align-top ${rowBg}`}>
        <td className="p-2 border">
          <button
            className="px-2 py-1 rounded border hover:bg-gray-100"
            aria-expanded={open}
            onClick={onToggle}
            title={open ? 'Zwiń szczegóły' : 'Rozwiń szczegóły'}
          >
            {open ? '▾' : '▸'}
          </button>
        </td>
        <td className="p-2 border whitespace-nowrap">{fmtDateTime(b.createdAt)}</td>
        <td className="p-2 border whitespace-nowrap">{fmtDateTime(b.date)}</td>
        <td className="p-2 border">
          <div className="font-medium">{b.fullName || '—'}</div>
          <div className="text-xs text-gray-500">#{b.id}</div>
        </td>
        <td className="p-2 border">{(b.visitType as string) || '—'}</td>
        <td className="p-2 border">
          <div>{(b.status as string) || '—'}</div>
          {b.completedAt && <div className="text-xs text-gray-600">({fmtDateTime(b.completedAt)})</div>}
        </td>
        <td className="p-2 border">
          <div className="text-sm">{(b.paymentStatus as string) || '—'}</div>
          {b.paymentRef && <div className="text-xs text-gray-600">#{b.paymentRef}</div>}
        </td>
        <td className="p-2 border">
          <div className="flex flex-wrap gap-2">
            {!isCompleted ? (
              <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={markCompleted}>
                Zrealizowana
              </button>
            ) : (
              <button className="px-3 py-1 rounded border bg-white" onClick={revertCompleted} title="Cofnij do CONFIRMED">
                Cofnij
              </button>
            )}
            <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={removeBooking}>
              Usuń
            </button>
          </div>
        </td>
      </tr>

      {/* SZCZEGÓŁY */}
      {open && (
        <tr className={`${detailBg}`}>
          <td className="p-0 border" colSpan={8}>
            <div className="p-3 grid grid-cols-1 md:grid-cols-4 gap-4 text-[13px]">
              <div className="md:col-span-2">
                <h4 className="font-semibold mb-1">Adres</h4>
                <div>{fullAddress(b)}</div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Kontakt</h4>
                <div>{b.phone || '—'}</div>
                <div className="text-gray-600">{b.email || '—'}</div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Pacjent</h4>
                <div>PESEL: {b.pesel || '—'}</div>
                <div>Lekarz: {b.doctor || '—'}</div>
              </div>

              <div>
                <h4 className="font-semibold mb-1">Płatność</h4>
                <div className="flex items-center gap-2">
                  <select
                    className="border rounded px-2 py-1"
                    defaultValue={(b.paymentStatus as string) || 'UNPAID'}
                    onChange={(e) => updatePayment(b.id, e.target.value, b.paymentRef || '')}
                  >
                    <option value="UNPAID">UNPAID</option>
                    <option value="PAID">PAID</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>
                <div className="mt-2">
                  <label className="block text-xs text-gray-600 mb-1">Numer transakcji (P24)</label>
                  <input
                    className="border rounded px-2 py-1 w-full"
                    placeholder="np. TRX-123..."
                    defaultValue={b.paymentRef || ''}
                    onBlur={(e) => updatePayment(b.id, (b.paymentStatus as string) || 'UNPAID', e.currentTarget.value)}
                  />
                </div>
                <div className="mt-2 text-gray-700">Kwota: {moneyPLN(b.priceCents ?? undefined, b.currency || 'PLN')}</div>
              </div>

              <div className="md:col-span-3">
                <h4 className="font-semibold mb-1">Uwagi</h4>
                <div className="whitespace-pre-wrap">{b.notes?.trim() || '—'}</div>
              </div>

              <div>
                <h4 className="font-semibold mb-1">Daty</h4>
                <div>Utworzono: {fmtDateTime(b.createdAt)}</div>
                <div>Termin: {fmtDateTime(b.date)}</div>
                {b.completedAt && <div>Zrealizowano: {fmtDateTime(b.completedAt)}</div>}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
