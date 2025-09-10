// pages/api/bookings/availability.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

/** Format YYYY-MM-DD dla daty w strefie Europe/Warsaw */
function warsawDateStr(d: Date) {
  // en-CA daje YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Format HH:mm dla godziny w strefie Europe/Warsaw */
function warsawTimeStr(d: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const dateStr = String(req.query.date || "").trim(); // oczekujemy YYYY-MM-DD (lokalny dzień PL)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return res.status(400).json({ ok: false, error: "Invalid date" });
    }

    // Pobierz tylko ograniczony zakres (dzień +/- 1) i odfiltruj po PL dacie
    const day = new Date(`${dateStr}T12:00:00.000Z`); // środek dnia, by uniknąć granic DST
    const before = new Date(day.getTime() - 36 * 60 * 60 * 1000);
    const after = new Date(day.getTime() + 36 * 60 * 60 * 1000);

    const bookings = await prisma.booking.findMany({
      where: {
        date: { gte: before, lte: after },
        // jeśli masz pole "status" i "CANCELLED", można wykluczyć odwołane:
        // NOT: { status: "CANCELLED" },
      },
      select: { date: true },
      orderBy: { date: "asc" },
    });

    const taken: string[] = [];
    for (const b of bookings) {
      const d = new Date(b.date);
      if (warsawDateStr(d) === dateStr) {
        taken.push(warsawTimeStr(d)); // "HH:mm"
      }
    }

    // unikalne i posortowane
    const uniq = Array.from(new Set(taken)).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    return res.status(200).json({ ok: true, taken: uniq });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "DB error" });
  }
}
