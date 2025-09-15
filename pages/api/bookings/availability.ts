// pages/api/bookings/availability.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

const TZ = "Europe/Warsaw";
const HOLD_MINUTES = 20; // ile minut slot jest tymczasowo zablokowany na czas płatności

function parts(d: Date, opts: Intl.DateTimeFormatOptions) {
  const map: Record<string, string> = {};
  for (const p of new Intl.DateTimeFormat("pl-PL", { timeZone: TZ, ...opts }).formatToParts(d)) {
    if (p.type !== "literal") map[p.type] = p.value;
  }
  return map;
}
function ymdInTz(d: Date) {
  const m = parts(d, { year: "numeric", month: "2-digit", day: "2-digit" });
  return `${m.year}-${m.month}-${m.day}`;
}
function hmInTz(d: Date) {
  const m = parts(d, { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${m.hour}:${m.minute}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const dateStr = String(req.query.date || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return res.status(400).json({ ok: false, error: "Invalid date format (YYYY-MM-DD)" });
  }

  const [y, mo, da] = dateStr.split("-").map(Number);

  // szerokie okno UTC; później przefiltrujemy po dacie w strefie PL
  const start = new Date(Date.UTC(y, mo - 1, da - 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, mo - 1, da + 2, 0, 0, 0));
  const holdCutoff = new Date(Date.now() - HOLD_MINUTES * 60_000);

  try {
    const rows = await prisma.booking.findMany({
      where: {
        date: { gte: start, lt: end },
        // pobieramy WSZYSTKIE (w tym CANCELLED), bo i tak filtrowanie robimy logiką poniżej
      },
      select: { date: true, createdAt: true, status: true, paymentStatus: true },
    });

    const takenSet = new Set<string>();

    for (const r of rows) {
      if (ymdInTz(r.date) !== dateStr) continue;

      const status = String(r.status || "").toUpperCase();
      const pay = String(r.paymentStatus || "").toUpperCase();

      // CANCELLED nigdy nie blokuje
      if (status === "CANCELLED") continue;

      const isPaid = pay === "PAID";
      const isFreshHold = r.createdAt > holdCutoff; // tymczasowa blokada

      if (isPaid || isFreshHold) {
        takenSet.add(hmInTz(r.date)); // blokujemy slot (HH:MM)
      }
    }

    const taken = Array.from(takenSet).sort();
    return res.status(200).json({ ok: true, taken, holdMinutes: HOLD_MINUTES });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "DB error" });
  }
}
