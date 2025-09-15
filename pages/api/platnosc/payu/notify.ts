// pages/api/platnosc/payu/notify.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { payuGetOrder } from "@/lib/payu";

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

    // Najpewniej: dociągnij z PayU (zawiera extOrderId + status)
    if (orderId) {
      try {
        const info = await payuGetOrder(String(orderId));
        if (info?.extOrderId) extOrderId = info.extOrderId;
        if (info?.status) status = info.status;
      } catch (e) {
        // jeśli PayU chwilowo nie odpowie — spadniemy na body
      }
    }

    if (!extOrderId) {
      return res.status(400).json({ ok: false, error: "Missing extOrderId/orderId" });
    }

    const paid = String(status || "").toUpperCase() === "COMPLETED";

    await prisma.booking.update({
      where: { id: String(extOrderId) },
      data: { paymentStatus: paid ? "PAID" : "UNPAID" },
    });

    return res.status(200).send("OK");
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "Notify error" });
  }
}
