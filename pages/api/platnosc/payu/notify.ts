// pages/api/platnosc/payu/notify.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { payuGetOrder } from "@/lib/payu";

export const config = { api: { bodyParser: false } };

// PayU wysyła JSON; czytamy RAW dla pewności
async function readBody(req: NextApiRequest): Promise<any> {
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    req.on("data", (c) => chunks.push(Buffer.from(c)));
    req.on("end", () => resolve());
    req.on("error", (e) => reject(e));
  });
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  try { return JSON.parse(raw || "{}"); } catch { return {}; }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const body = await readBody(req);

    // Notyfikacja PayU ma zwykle strukturę: { order: { orderId, extOrderId, status, ... } }
    const orderId = body?.order?.orderId || body?.orderId;
    const extOrderId = body?.order?.extOrderId || body?.extOrderId;

    if (!orderId || !extOrderId) {
      console.warn("[PayU notify] Missing ids", body);
      return res.status(200).json({ ok: true });
    }

    // Znajdź rezerwację po naszym extOrderId (booking.id)
    const booking = await prisma.booking.findUnique({ where: { id: String(extOrderId) } });
    if (!booking) {
      console.warn("[PayU notify] Booking not found", { extOrderId });
      return res.status(200).json({ ok: true });
    }

    // Zweryfikuj status po stronie PayU (źródło prawdy)
    let status: string | undefined;
    let totalAmount = 0;
    let currencyCode = "PLN";
    try {
      const ord = await payuGetOrder(String(orderId));
      status = ord.status;
      totalAmount = Number(ord.totalAmount || 0);
      currencyCode = ord.currencyCode || "PLN";
    } catch (err: any) {
      console.error("[PayU getOrder] failed", err?.message || err);
      return res.status(200).json({ ok: true });
    }

    // Akceptujemy tylko COMPLETED
    if (status === "COMPLETED") {
      // (opcjonalnie) dopasuj kwotę:
      if (totalAmount && booking.priceCents && Number(totalAmount) !== Number(booking.priceCents)) {
        console.warn("[PayU notify] Amount mismatch", { orderId, totalAmount, bookingPrice: booking.priceCents });
        return res.status(200).json({ ok: true });
      }

      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: "PAID",
          paymentRef: String(orderId),
          status: booking.status === "PENDING" ? "CONFIRMED" : booking.status,
        },
      });
    } else {
      // inne statusy można mapować wedle potrzeb (CANCELED, WAITING_FOR_CONFIRMATION itp.)
      console.log("[PayU notify] Non-final status", { orderId, status });
    }

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error("[PayU notify] error", e?.message || e);
    return res.status(200).json({ ok: true });
  }
}
