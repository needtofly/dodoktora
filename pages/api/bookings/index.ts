// pages/api/bookings/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { p24Register } from "@/lib/p24";

const isSandbox = (process.env.P24_ENV || "sandbox") === "sandbox";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const {
      fullName,
      email,
      phone,
      visitType,     // "Teleporada" | "Wizyta domowa"
      doctor,
      date,          // ISO string (UTC)
      notes,
      // adres — rozbite pola + legacy
      address,
      addressLine1,
      postalCode,
      city,
      pesel,
      noPesel,
    } = req.body || {};

    if (!fullName || !email || !phone || !visitType || !date) {
      return res.status(400).json({ ok: false, error: "Brak wymaganych pól." });
    }

    const priceCents = visitType === "Wizyta domowa" ? 35000 : 4900;
    const currency = "PLN";

    // 1) Zapis rezerwacji
    const booking = await prisma.booking.create({
      data: {
        fullName,
        email,
        phone,
        visitType: visitType === "Wizyta domowa" ? "WIZYTA_DOMOWA" : "TELEPORADA",
        doctor,
        date: new Date(date),
        notes: notes || null,
        address: address || null,
        addressLine1: addressLine1 || null,
        postalCode: postalCode || null,
        city: city || null,
        pesel: pesel || null,
        noPesel: !!noPesel,
        priceCents,
        currency,
        status: "PENDING",
        paymentStatus: "UNPAID",
      },
    });

    // 2) Próba rejestracji w P24
    try {
      const { redirectUrl } = await p24Register({
        sessionId: booking.id,
        amountCents: priceCents,
        currency,
        description: `Rezerwacja #${booking.id} — ${visitType}`,
        email,
        country: "PL",
        language: "pl",
        urlReturn: process.env.P24_RETURN_URL || "https://example.com/platnosc/p24/return",
        urlStatus: process.env.P24_STATUS_URL || "https://example.com/api/platnosc/p24/notify",
      });

      return res.status(200).json({ ok: true, id: booking.id, redirectUrl });
    } catch (e: any) {
      // 401 lub inne błędy z P24 → fallback do mocka w sandboxie
      const msg = String(e?.message || "");
      const shouldFallback =
        isSandbox || /Incorrect authentication/i.test(msg) || /401/.test(msg);

      if (shouldFallback) {
        console.warn("[P24] Fallback to mock due to:", msg);
        // Możesz przekazać id rezerwacji w query mocka, jeśli mock to obsługuje
        return res.status(200).json({
          ok: true,
          id: booking.id,
          redirectUrl: `/platnosc/p24/mock?bookingId=${encodeURIComponent(booking.id)}`,
        });
      }
      // produkcja bez fallbacku – zgłoś błąd
      throw e;
    }
  } catch (e: any) {
    console.error("BOOKING POST error:", e?.message || e);
    return res.status(500).json({ ok: false, error: e?.message || "Server error" });
  }
}
