// app/admin/page.tsx
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export const runtime = "nodejs";
export const revalidate = 0;
export const dynamic = "force-dynamic";

type Booking = {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  visitType: "Teleporada" | "Wizyta domowa";
  doctor: string;
  date: string;
  notes?: string;
  address?: string;
  pesel?: string;
  noPesel?: boolean;
  createdAt?: string;
};

function getBaseUrl() {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return "";
  return `${proto}://${host}`;
}

async function fetchBookings(cookieHeader: string): Promise<{ ok: boolean; items: Booking[]; error?: string }> {
  try {
    const base = getBaseUrl();
    const url = `${base}/api/admin/bookings`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: { cookie: cookieHeader, accept: "application/json" },
    });

    if (res.status === 401) {
      return { ok: false, items: [], error: "HTTP 401 – Unauthorized" };
    }
    if (res.status === 405) {
      return { ok: false, items: [], error: "HTTP 405 – Method not allowed" };
    }
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const j = await res.json();
        if (j?.error) msg = `${msg} – ${j.error}`;
      } catch {}
      return { ok: false, items: [], error: msg };
    }

    const data = await res.json().catch(() => null);
    if (Array.isArray(data)) return { ok: true, items: data as Booking[] };
    if (Array.isArray((data as any)?.items)) return { ok: true, items: (data as any).items as Booking[] };
    return { ok: false, items: [], error: "Nieprawidłowe dane z API" };
  } catch (e: any) {
    return { ok: false, items: [], error: e?.message || "Błąd połączenia" };
  }
}

export default async function AdminPage() {
  // WYMAGAJ LOGOWANIA po stronie serwera
  const cookieStore = cookies();
  const auth = cookieStore.get("admin_auth");
  if (!auth || auth.value !== "ok") {
    redirect("/admin/login?next=" + encodeURIComponent("/admin"));
  }

  // Pobierz listę z przekazaniem ciasteczek do API
  const cookieHeader = headers().get("cookie") ?? "";
  const { ok, items, error } = await fetchBookings(cookieHeader);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Panel administratora</h1>

      {!ok && (
        <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          Nie udało się pobrać listy rezerwacji.{error ? <> Szczegóły: {error}</> : null}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left">Data</th>
              <th className="px-3 py-2 text-left">Godz.</th>
              <th className="px-3 py-2 text-left">Pacjent</th>
              <th className="px-3 py-2 text-left">Typ</th>
              <th className="px-3 py-2 text-left">Lekarz</th>
              <th className="px-3 py-2 text-left">Telefon</th>
              <th className="px-3 py-2 text-left">E-mail</th>
            </tr>
          </thead>
          <tbody>
            {(items || []).length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-gray-500" colSpan={7}>
                  Brak rezerwacji do wyświetlenia.
                </td>
              </tr>
            ) : (
              items.map((b, i) => {
                const d = new Date(b.date);
                const isValid = !isNaN(d.getTime());
                const dStr = isValid ? d.toLocaleDateString("pl-PL", { timeZone: "Europe/Warsaw" }) : b.date;
                const tStr = isValid
                  ? d.toLocaleTimeString("pl-PL", { timeZone: "Europe/Warsaw", hour: "2-digit", minute: "2-digit" })
                  : "";
                return (
                  <tr key={b.id || i} className="border-t">
                    <td className="px-3 py-2">{dStr}</td>
                    <td className="px-3 py-2">{tStr}</td>
                    <td className="px-3 py-2">{b.fullName}</td>
                    <td className="px-3 py-2">{b.visitType}</td>
                    <td className="px-3 py-2">{b.doctor}</td>
                    <td className="px-3 py-2">{b.phone}</td>
                    <td className="px-3 py-2">{b.email}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
