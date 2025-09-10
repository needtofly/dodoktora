// pages/api/platnosc/p24/notify.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { p24ValidateWebhookSign, p24Verify } from "@/lib/p24";

// ✅ P24 często wysyła application/x-www-form-urlencoded → parsujemy surowe body
export const config = {
  api: {
    bodyParser: false,
  },
};

// czytamy RAW body (Buffer) i parsujemy JSON lub x-www-form-urlencoded
async function readBody(req: NextApiRequest): Promise<Record<string, any>> {
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    req.on("data", (c) => chunks.push(Buffer.from(c)));
    req.on("end", () => resolve());
    req.on("error", (e) => reject(e));
  });

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  const ct = (req.headers["content-type"] || "").toLowerCase();

  // 1) spróbuj JSON
  if (ct.includes("application/json")) {
    try {
      return JSON.parse(raw || "{}");
    } catch {
      // fallthrough
    }
  }

  // 2) spróbuj urlencoded
  if (ct.includes("application/x-www-form-urlencoded") || raw.includes("=")) {
    const params = new URLSearchParams(raw);
    const obj: Record<string, any> = {};
    for (const [k, v] of params.entries()) obj[k] = v;
    return obj;
  }

  // 3) fallback: puste
  return {};
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const body = await readBody(req);

    // P24 notify pola (mogą być stringami → rzutujemy)
    const sessionId = String(body.sessionId || body.merchantSessionId || "");
    const orderId = Number(body.orderId ?? body.order_id ?? 0);
    const amount = Number(body.amount ?? body.paymentAmount ?? 0); // w groszach
    const currency = String(body.currency || "PLN");
    const sign = String(body.sign || body.signature || "");

    if (!sessionId || !orderId || !amount || !currency || !sign) {
      // zwracamy 200 aby P24 nie retry’owało w pętli, ale logujemy
      console.warn("[P24 notify] Missing fields", { sessionId, orderId, amount, currency });
      return res.status(200).json({ ok: true });
    }

    // 1) weryfikacja podpisu z webhooka
    const validSign = p24ValidateWebhookSign({ sessionId, orderId, amount, currency, sign });
    if (!validSign) {
      console.warn("[P24 notify] Invalid sign", { sessionId, orderId });
      return res.status(200).json({ ok: true });
    }

    // 2) znajdź rezerwację
    const booking = await prisma.booking.findUnique({ where: { id: sessionId } });
    if (!booking) {
      console.warn("[P24 notify] Booking not found", { sessionId });
      return res.status(200).json({ ok: true });
    }

    // 3) verify w P24 (obowiązkowo)
    try {
      await p24Verify({
        sessionId,
        orderId,
        amountCents: amount,
        currency,
      });
    } catch (e: any) {
      console.error("[P24 verify] failed", e?.message || e);
      // zwróć 200 – P24 myśli, że OK i nie retry’uje; ale nie podnoś statusu
      return res.status(200).json({ ok: true });
    }

    // 4) oznacz płatność jako opłaconą
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
    console.error("[P24 notify] error", e?.message || e);
    // 200 aby P24 nie robił sztormu retry
    return res.status(200).json({ ok: true });
  }
}
