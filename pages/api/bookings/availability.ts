// pages/api/bookings/availability.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

const TZ = "Europe/Warsaw";

function ymdInWarsaw(iso: string | Date) {
  const d = new Date(iso);
  // "sv-SE" daje format YYYY-MM-DD
  return d.toLocaleDateString("sv-SE", { timeZone: TZ });
}
function hhmmInWarsaw(iso: string | Date) {
  const d = new Date(iso);
  return d.toLocaleTimeString("pl-PL", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const date = String(req.query.date || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "Parametr 'date' (YYYY-MM-DD) jest wymagany." });
  }

  try {
    // Pobieramy wszystkie Teleporady (ilości są małe, filtr zrobimy po stronie JS w strefie PL)
    const rows = await prisma.booking.findMany({
      where: {
        visitType: "Teleporada",
      },
      select: { date: true, status: true },
      orderBy: { date: "asc" },
    });

    const taken = new Set<string>();
    for (const r of rows) {
      const localYmd = ymdInWarsaw(r.date as any);
      if (localYmd !== date) continue;
      if (String(r.status || "").toUpperCase() === "CANCELLED") continue;
      taken.add(hhmmInWarsaw(r.date as any));
    }

    return res.status(200).json({ date, taken: Array.from(taken).sort() });
  } catch (e: any) {
    return res.status(500).json({ error: "DB error", detail: e?.message ?? String(e) });
  }
}
