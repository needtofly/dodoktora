// pages/api/bookings/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { payuCreateOrder } from "@/lib/payu";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const id = String(req.query.id || "");
      if (!id) return res.status(400).json({ ok: false, error: "Missing id" });
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
      visitType, doctor, date,
      city, postalCode, addressLine1, address,
      pesel, noPesel,
    } = req.body || {};

    if (!fullName || !email || !phone || !visitType || !date) {
      return res.status(400).json({ ok: false, error: "Brak wymaganych pól." });
    }

    const priceCents = visitType === "Wizyta domowa" ? 35000 : 4900;
    const currency = "PLN";

    const iso = new Date(date);
    if (Number.isNaN(iso.getTime())) {
      return res.status(400).json({ ok: false, error: "Invalid date" });
    }

    // blokada konfliktu (ten sam UTC)
    const clash = await prisma.booking.findFirst({ where: { date: iso }, select: { id: true } });
    if (clash) {
      return res.status(409).json({ ok: false, error: "Ten termin został już zajęty. Wybierz inną godzinę." });
    }

    // 1) zapis rezerwacji
    const booking = await prisma.booking.create({
      data: {
        fullName, email, phone,
        visitType: visitType === "Wizyta domowa" ? "WIZYTA_DOMOWA" : "TELEPORADA",
        doctor, date: iso,
        address: address || null, addressLine1: addressLine1 || null,
        postalCode: postalCode || null, city: city || null,
        pesel: pesel || null, noPesel: !!noPesel,
        priceCents, currency,
        status: "PENDING", paymentStatus: "UNPAID",
      },
    });

    // 2) PayU CreateOrder → redirect
    const baseReturn = process.env.PAYU_RETURN_URL || "https://dodoktora.co/platnosc/payu/return";
    const urlReturn = `${baseReturn}${baseReturn.includes("?") ? "&" : "?"}bookingId=${encodeURIComponent(booking.id)}`;
    const notifyUrl = process.env.PAYU_NOTIFY_URL || "https://dodoktora.co/api/platnosc/payu/notify";

    const xff = String(req.headers["x-forwarded-for"] || "");
    const customerIp = xff.split(",")[0].trim() || "127.0.0.1";

    const { redirectUri } = await payuCreateOrder({
      sessionId: booking.id,
      amountCents: priceCents,
      currency,
      description: `Rezerwacja #${booking.id} — ${visitType}`,
      email,
      urlReturn,
      notifyUrl,
      customerIp,
    });

    return res.status(200).json({ ok: true, id: booking.id, redirectUrl: redirectUri });
  } catch (e: any) {
    console.error("BOOKING POST error:", e?.message || e);
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}
