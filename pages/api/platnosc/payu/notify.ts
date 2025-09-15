// pages/api/platnosc/payu/notify.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { payuGetOrder } from "@/lib/payu";

// Mapowanie statusów PayU -> nasze pola
// PayU: NEW, PENDING, WAITING_FOR_CONFIRMATION, COMPLETED, CANCELED, REJECTED
function mapPayuToBooking(status: string) {
  const s = status.toUpperCase();
  if (s === "COMPLETED") {
    return { paymentStatus: "PAID", status: "CONFIRMED" };
  }
  if (s === "CANCELED" || s === "REJECTED") {
    return { paymentStatus: "REJECTED", status: "CANCELLED" };
  }
  // NEW / PENDING / WAITING_FOR_CONFIRMATION
  return { paymentStatus: "UNPAID", status: "PENDING" };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const body: any = req.body || {};
    const orderId = body?.order?.orderId || body?.orderId || null;
    const extOrderIdFromBody = body?.order?.extOrderId || body?.extOrderId || null;
    let extOrderId = extOrderIdFromBody;
    let status = body?.order?.status || body?.status || null;

    // Dociągamy dane pewne z PayU (zawiera extOrderId i status)
    if (orderId) {
      try {
        const info = await payuGetOrder(String(orderId));
        if (info?.extOrderId) extOrderId = info.extOrderId;
        if (info?.status) status = info.status;
      } catch {
        // jeśli nie udało się pobrać — użyjemy tego, co przyszło w webhooku
      }
    }

    if (!extOrderId) {
      return res.status(400).json({ ok: false, error: "Missing extOrderId/orderId" });
    }

    const mapped = mapPayuToBooking(String(status || "PENDING"));
    await prisma.booking.update({
      where: { id: String(extOrderId) },
      data: {
        paymentStatus: mapped.paymentStatus,
        status: mapped.status,
      },
    });

    return res.status(200).send("OK");
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "Notify error" });
  }
}
