// pages/api/bookings/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

const TZ = "Europe/Warsaw";

function ymdInWarsaw(iso: string | Date) {
  const d = new Date(iso);
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
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const {
      fullName,
      email,
      phone,
      visitType,
      doctor,
      date, // ISO z frontu
      notes,
      address,
      pesel,
      noPesel,
    } = body;

    if (!fullName || !email || !phone || !visitType || !doctor || !date) {
      return res.status(400).json({ ok: false, error: "Brak wymaganych pól." });
    }

    const priceCents = visitType === "Wizyta domowa" ? 35000 : 4900;

    let finalNotes = (notes || "").trim();
    if (visitType === "Wizyta domowa" && address?.trim()) {
      finalNotes = `Adres wizyty domowej: ${address.trim()}\n${finalNotes}`.trim();
    }

    // twarda blokada konfliktu dla Teleporady (dzień + HH:mm w PL)
    if (visitType === "Teleporada") {
      const targetYMD = ymdInWarsaw(date);
      const targetHM = hhmmInWarsaw(date);
      const existing = await prisma.booking.findMany({
        where: { visitType: "Teleporada" },
        select: { date: true, status: true },
      });
      const conflict = existing.some((b) => {
        if (String(b.status || "").toUpperCase() === "CANCELLED") return false;
        return ymdInWarsaw(b.date as any) === targetYMD && hhmmInWarsaw(b.date as any) === targetHM;
      });
      if (conflict) {
        return res.status(409).json({ ok: false, error: "Ten termin jest już zajęty." });
      }
    }

    const created = await prisma.booking.create({
      data: {
        fullName,
        email,
        phone,
        visitType,
        doctor,
        date: new Date(date),
        notes: finalNotes || null,
        address: visitType === "Wizyta domowa" ? address?.trim() || null : null,
        pesel: pesel || null,
        noPesel: !!noPesel,
        status: "PENDING",
        priceCents,
        realized: false,
      },
      select: { id: true },
    });

    // ⬇⬇ KLUCZ: przekażemy ID i kwotę w URL do mocku płatności
    const amountStr = (priceCents / 100).toFixed(2);
    return res.status(200).json({
      ok: true,
      id: created.id,
      priceCents,
      redirectUrl: `/platnosc/p24/mock?id=${encodeURIComponent(created.id)}&amount=${encodeURIComponent(amountStr)}`,
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: "Błąd serwera", detail: e?.message ?? String(e) });
  }
}
