// pages/api/platnosc/p24/notify.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { p24ValidateWebhookSign, p24Verify } from "@/lib/p24";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const body = req.body || {};
    // P24 (REST notify) zwykle wysyła: merchantId,posId,sessionId,orderId,amount,currency,sign, itd.
    const {
      sessionId,
      orderId,
      amount,
      currency = "PLN",
      sign,
    } = body as {
      sessionId: string;
      orderId: number;
      amount: number;
      currency: string;
      sign: string;
    };

    if (!sessionId || !orderId || !amount || !currency || !sign) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    // 1) Sprawdź podpis webhooka
    const valid = p24ValidateWebhookSign({ sessionId, orderId, amount, currency, sign });
    if (!valid) {
      return res.status(400).json({ ok: false, error: "Invalid sign" });
    }

    // 2) Znajdź rezerwację po sessionId (używamy booking.id jako session)
    const booking = await prisma.booking.findUnique({ where: { id: sessionId } });
    if (!booking) {
      // Zwróć 200 — P24 oczekuje 200, by nie ponawiać bez końca
      return res.status(200).json({ ok: true }); 
    }

    // 3) Weryfikacja w P24 (obowiązkowa)
    await p24Verify({
      sessionId,
      orderId,
      amountCents: amount,
      currency,
    });

    // 4) Oznacz płatność jako opłaconą
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: "PAID",
        paymentRef: String(orderId),
        status: booking.status === "PENDING" ? "CONFIRMED" : booking.status,
      },
    });

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    // Zwróć 200, aby P24 nie spamowało retry; wewnętrznie loguj
    console.error("P24 notify error:", e?.message || e);
    return res.status(200).json({ ok: true });
  }
}
