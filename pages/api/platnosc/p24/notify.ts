// pages/api/platnosc/p24/notify.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { p24ValidateWebhookSign, p24Verify } from "@/lib/p24";

/**
 * P24 potrafi wysyłać:
 * - application/x-www-form-urlencoded (najczęściej)
 * - application/json
 * - różne nazwy pól: sessionId / merchantSessionId / p24_session_id / session_id
 *                   orderId / p24_order_id / order_id
 *                   amount  / paymentAmount / p24_amount
 *                   currency / p24_currency
 *                   sign / p24_sign / signature
 * Dlatego wyłączamy bodyParser i parsujemy RAW.
 */
export const config = {
  api: { bodyParser: false },
};

// Czytamy RAW body (Buffer) i próbujemy JSON -> urlencoded -> fallback
async function readBody(req: NextApiRequest): Promise<Record<string, any>> {
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    req.on("data", (c) => chunks.push(Buffer.from(c)));
    req.on("end", () => resolve());
    req.on("error", (e) => reject(e));
  });

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  const ct = (req.headers["content-type"] || "").toLowerCase();

  // JSON
  if (ct.includes("application/json")) {
    try {
      return JSON.parse(raw || "{}");
    } catch {}
  }

  // urlencoded
  if (ct.includes("application/x-www-form-urlencoded") || raw.includes("=")) {
    const params = new URLSearchParams(raw);
    const obj: Record<string, any> = {};
    for (const [k, v] of params.entries()) obj[k] = v;
    return obj;
  }

  // fallback: puste
  return {};
}

// Normalizacja kluczy z różnych wariantów nazw
function normalize(body: Record<string, any>) {
  // Czasem przychodzi wszystko z prefiksem "p24_", czasem snake_case.
  // Pobierzmy najpierw „kanoniczne” wartości niezależnie od wariantu.
  const get = (keys: string[], def: any = undefined) => {
    for (const k of keys) {
      if (body[k] != null && body[k] !== "") return body[k];
    }
    return def;
  };

  // W niektórych integracjach przychodzi { data: {...} }
  const data = typeof body?.data === "object" && body.data ? body.data : null;
  const src = data || body;

  const sessionIdRaw = get.call(src, [
    "sessionId",
    "merchantSessionId",
    "session_id",
    "p24_session_id",
    "p24_sessionId",
  ]);
  const orderIdRaw = get.call(src, [
    "orderId",
    "order_id",
    "p24_order_id",
    "p24_orderId",
  ]);
  const amountRaw = get.call(src, [
    "amount",
    "paymentAmount",
    "p24_amount",
  ]);
  const currencyRaw = get.call(src, [
    "currency",
    "p24_currency",
  ]);
  const signRaw = get.call(src, [
    "sign",
    "signature",
    "p24_sign",
  ]);

  // Rzutowania
  const sessionId = String(sessionIdRaw ?? "");
  const orderId = Number(orderIdRaw ?? 0);
  // amount bywa stringiem — przeliczamy bezpiecznie na liczbę całkowitą (grosze)
  const amount = (() => {
    const v = String(amountRaw ?? "");
    if (!v) return 0;
    // jeśli przypadkiem przyjdzie "49.00", zamienimy na grosze
    if (v.includes(".") || v.includes(",")) {
      const norm = v.replace(",", ".");
      const n = Math.round(Number(norm) * 100);
      return Number.isFinite(n) ? n : 0;
    }
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  })();
  const currency = String(currencyRaw || "PLN").toUpperCase();
  const sign = String(signRaw ?? "");

  return { sessionId, orderId, amount, currency, sign };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const raw = await readBody(req);
    const { sessionId, orderId, amount, currency, sign } = normalize(raw);

    if (!sessionId || !orderId || !amount || !currency || !sign) {
      console.warn("[P24 notify] Missing fields", { sessionId, orderId, amount, currency, hasSign: !!sign });
      // Zwracamy 200 by P24 nie spamowało retry (tak zaleca praktyka), ale nie podnosimy statusu
      return res.status(200).json({ ok: true });
    }

    // 1) Weryfikacja podpisu webhooka
    const valid = p24ValidateWebhookSign({ sessionId, orderId, amount, currency, sign });
    if (!valid) {
      console.warn("[P24 notify] Invalid sign", { sessionId, orderId });
      return res.status(200).json({ ok: true });
    }

    // 2) Booking
    const booking = await prisma.booking.findUnique({ where: { id: sessionId } });
    if (!booking) {
      console.warn("[P24 notify] Booking not found", { sessionId });
      return res.status(200).json({ ok: true });
    }

    // 3) Verify w P24 (obowiązkowo wg REST)
    try {
      await p24Verify({ sessionId, orderId, amountCents: amount, currency });
    } catch (e: any) {
      console.error("[P24 verify] failed", e?.message || e);
      // Zwróć 200 (nie retry), ale nie zmieniaj statusu
      return res.status(200).json({ ok: true });
    }

    // 4) Aktualizacja płatności
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
    return res.status(200).json({ ok: true });
  }
}
