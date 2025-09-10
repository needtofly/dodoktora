// pages/api/platnosc/p24/notify.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { p24ValidateWebhookSign, p24Verify } from "@/lib/p24";

export const config = {
  api: { bodyParser: false },
};

async function readBody(req: NextApiRequest): Promise<Record<string, any>> {
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    req.on("data", (c) => chunks.push(Buffer.from(c)));
    req.on("end", () => resolve());
    req.on("error", (e) => reject(e));
  });

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  const ct = (req.headers["content-type"] || "").toLowerCase();

  if (ct.includes("application/json")) {
    try { return JSON.parse(raw || "{}"); } catch {}
  }
  if (ct.includes("application/x-www-form-urlencoded") || raw.includes("=")) {
    const params = new URLSearchParams(raw);
    const obj: Record<string, any> = {};
    for (const [k, v] of params.entries()) obj[k] = v;
    return obj;
  }
  return {};
}

// pobiera wartość z wielu możliwych kluczy
const pick = (src: any, keys: string[], def?: any) => {
  for (const k of keys) if (src?.[k] !== undefined && src?.[k] !== "") return src[k];
  return def;
};

function normalize(body: Record<string, any>) {
  const data = typeof body?.data === "object" && body.data ? body.data : body;

  const sessionId = String(
    pick(data, ["sessionId", "merchantSessionId", "session_id", "p24_session_id", "p24_sessionId"], "")
  );
  const orderId = Number(pick(data, ["orderId", "order_id", "p24_order_id", "p24_orderId"], 0));

  const amountRaw = String(pick(data, ["amount", "paymentAmount", "p24_amount"], ""));
  const amount =
    amountRaw.includes(".") || amountRaw.includes(",")
      ? Math.round(Number(amountRaw.replace(",", ".")) * 100)
      : Number(amountRaw || 0);

  const currency = String(pick(data, ["currency", "p24_currency"], "PLN")).toUpperCase();
  const sign = String(pick(data, ["sign", "signature", "p24_sign"], ""));

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

    if (!sessionId || !orderId || !amount || !currency) {
      console.warn("[P24 notify] Missing fields", { sessionId, orderId, amount, currency, hasSign: !!sign });
      return res.status(200).json({ ok: true });
    }

    // 1) spróbujmy zweryfikować sign (dla diagnostyki)
    let signOk = false;
    try {
      signOk = p24ValidateWebhookSign({ sessionId, orderId, amount, currency, sign });
    } catch (e) {
      // nic – traktujemy jako false
    }
    if (!signOk) {
      console.warn("[P24 notify] Invalid sign", { sessionId, orderId });
      // nie przerywamy – przechodzimy do verify
    }

    // 2) sprawdźmy czy mamy taką rezerwację
    const booking = await prisma.booking.findUnique({ where: { id: sessionId } });
    if (!booking) {
      console.warn("[P24 notify] Booking not found", { sessionId });
      return res.status(200).json({ ok: true });
    }

    // 3) verify po stronie P24 – źródło prawdy
    try {
      await p24Verify({ sessionId, orderId, amountCents: amount, currency });
    } catch (e: any) {
      console.error("[P24 verify] failed", e?.message || e);
      return res.status(200).json({ ok: true });
    }

    // 4) aktualizacja statusu płatności
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
