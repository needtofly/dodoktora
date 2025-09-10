// pages/api/bookings/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { p24Register } from "@/lib/p24";

const isSandbox = (process.env.P24_ENV || "sandbox") === "sandbox";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const id = String(req.query.id || "");
    if (!id) return res.status(400).json({ ok: false, error: "Missing id" });
    try {
      const b = await prisma.booking.findUnique({
        where: { id },
        select: { id: true, status: true, paymentStatus: true, date: true, visitType: true },
      });
      if (!b) return res.status(404).json({ ok: false, error: "Not found" });
      return res.status(200).json({ ok: true, booking: b });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: e?.message || "DB error" });
    }
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const {
      fullName, email, phone,
      visitType, doctor, date, notes,
      address, addressLine1, postalCode, city,
      pesel, noPesel,
    } = req.body || {};

    if (!fullName || !email || !phone || !visitType || !date) {
      return res.status(400).json({ ok: false, error: "Brak wymaganych pól." });
    }

    const priceCents = visitType === "Wizyta domowa" ? 35000 : 4900;
    const currency = "PLN";

    const iso = new Date(date); // klient wysyła ISO w UTC (z localDateTimeToISO)
    if (Number.isNaN(iso.getTime())) {
      return res.status(400).json({ ok: false, error: "Invalid date" });
    }

    // 🔒 BLOKADA KONFLIKTU: sprawdź czy slot nie jest już zajęty (dokładna minuta)
    const clash = await prisma.booking.findFirst({
      where: {
        date: iso,
        // jeśli chcesz dopuszczać konflikt z CANCELLED:
        // NOT: { status: "CANCELLED" },
      },
      select: { id: true },
    });
    if (clash) {
      return res.status(409).json({ ok: false, error: "Ten termin został już zajęty. Wybierz inną godzinę." });
    }

    // 1) zapis rezerwacji
    const booking = await prisma.booking.create({
      data: {
        fullName, email, phone,
        visitType: visitType === "Wizyta domowa" ? "WIZYTA_DOMOWA" : "TELEPORADA",
        doctor, date: iso, notes: notes || null,
        address: address || null, addressLine1: addressLine1 || null,
        postalCode: postalCode || null, city: city || null,
        pesel: pesel || null, noPesel: !!noPesel,
        priceCents, currency,
        status: "PENDING", paymentStatus: "UNPAID",
      },
    });

    // 2) rejestracja płatności P24 — dorzucamy bookingId do return
    const baseReturn = process.env.P24_RETURN_URL || "https://example.com/platnosc/p24/return";
    const urlReturn = `${baseReturn}${baseReturn.includes("?") ? "&" : "?"}bookingId=${encodeURIComponent(booking.id)}`;

    try {
      const { redirectUrl } = await p24Register({
        sessionId: booking.id,
        amountCents: priceCents,
        currency,
        description: `Rezerwacja #${booking.id} — ${visitType}`,
        email,
        country: "PL",
        language: "pl",
        urlReturn,
        urlStatus: process.env.P24_STATUS_URL || "https://example.com/api/platnosc/p24/notify",
      });

      return res.status(200).json({ ok: true, id: booking.id, redirectUrl });
    } catch (e: any) {
      const msg = String(e?.message || "");
      const shouldFallback = isSandbox || /Incorrect authentication|401/.test(msg);
      if (shouldFallback) {
        console.warn("[P24] Fallback to mock due to:", msg);
        return res.status(200).json({
          ok: true,
          id: booking.id,
          redirectUrl: `/platnosc/p24/mock?bookingId=${encodeURIComponent(booking.id)}`,
        });
      }
      throw e;
    }
  } catch (e: any) {
    console.error("BOOKING POST error:", e?.message || e);
    return res.status(500).json({ ok: false, error: e?.message || "Server error" });
  }
}
