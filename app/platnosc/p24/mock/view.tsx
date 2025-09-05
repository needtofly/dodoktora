"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Params = {
  bookingId: string;
  amount: string;   // "49.00"
  currency: string; // "PLN"
};

export default function P24MockView() {
  const router = useRouter();

  const [params, setParams] = useState<Params>({
    bookingId: "",
    amount: "0.00",
    currency: "PLN",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const id = sp.get("bookingId") || sp.get("id") || "";
      const rawAmount = sp.get("amount") || "0";
      const v = parseFloat(rawAmount);
      const amount = Number.isFinite(v) ? v.toFixed(2) : "0.00";
      const currency = sp.get("currency") || "PLN";
      setParams({ bookingId: id, amount, currency });
    } catch {
      /* ignore */
    }
  }, []);

  const canPay = useMemo(() => !!params.bookingId, [params.bookingId]);

  async function handlePay() {
    setErr("");
    if (!params.bookingId) {
      setErr("Brak ID rezerwacji. Wróć do strony głównej.");
      return;
    }
    setLoading(true);
    try {
      // „udajemy” webhook P24 – zwróci 200 OK
      await fetch("/api/platnosc/p24/notify", { method: "POST" }).catch(() => {});
    } finally {
      const qs = new URLSearchParams({
        status: "success",
        tr_status: "success",
        id: params.bookingId,
        bookingId: params.bookingId,
        orderId: params.bookingId,
        amount: params.amount,
        currency: params.currency,
      });
      router.push(`/platnosc/p24/return?${qs.toString()}`);
    }
  }

  return (
    <div className="mx-auto max-w-xl p-6 bg-white rounded-2xl border shadow-sm space-y-4">
      <h1 className="text-2xl font-semibold">Płatność testowa P24</h1>

      {err && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm" role="alert">
          {err}
        </div>
      )}

      <div className="text-sm text-gray-600">
        <div><span className="font-medium text-gray-800">Rezerwacja:</span> {params.bookingId || "—"}</div>
        <div><span className="font-medium text-gray-800">Kwota:</span> {params.amount} {params.currency}</div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={handlePay}
          disabled={loading || !canPay}
          className="px-4 h-11 rounded-xl border bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Przetwarzanie…" : "Zapłać (testowo)"}
        </button>

        <a
          href="/cancel"
          className="px-4 h-11 rounded-xl border bg-white hover:bg-gray-50 text-gray-800"
        >
          Anuluj
        </a>
      </div>
    </div>
  );
}
