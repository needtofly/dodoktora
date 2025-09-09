// pages/api/_diag/p24-repro.ts
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

const ENV = process.env.P24_ENV || "sandbox";
const BASE =
  ENV === "sandbox"
    ? "https://sandbox.przelewy24.pl"
    : "https://secure.przelewy24.pl";

const merchantId = Number((process.env.P24_MERCHANT_ID || "").trim());
const posId = Number((process.env.P24_POS_ID || "").trim());
const apiKey = (process.env.P24_REST_API_KEY || "").trim();
const crc = (process.env.P24_CRC || "").trim();

function sha384Of(obj: Record<string, any>) {
  const json = JSON.stringify(obj);
  return crypto.createHash("sha384").update(json).digest("hex");
}
function b64(s: string) {
  return Buffer.from(s, "utf8").toString("base64");
}
function mask(v?: string | number | null) {
  const s = String(v ?? "");
  if (!s) return null;
  return s.length <= 6 ? `***${s.slice(-2)}` : `${s.slice(0, 2)}***${s.slice(-4)}`;
}

async function callRegister(authLogin: string, payload: any) {
  const url = `${BASE}/api/v1/transaction/register`;
  const headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": `Basic ${b64(`${authLogin}:${apiKey}`)}`,
  };
  const t0 = new Date();
  const r = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
  const text = await r.text();
  return {
    requested_at_utc: t0.toISOString(),
    endpoint: url,
    auth_login_used: mask(authLogin),
    status: r.status,
    response_body: text.slice(0, 1200), // wystarczy do debug
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const sessionId = `repro-${Date.now()}`;

    // Minimalny payload jak w produkcie
    const payload = {
      merchantId,
      posId,
      sessionId,
      amount: 123,           // 1,23 PLN do celów testowych
      currency: "PLN",
      description: "REPRO diag",
      email: "diag@dodoktora.co",
      country: "PL",
      language: "pl",
      urlReturn: process.env.P24_RETURN_URL || "https://example.com/return",
      urlStatus: process.env.P24_STATUS_URL || "https://example.com/status",
      sign: sha384Of({
        sessionId,
        merchantId,
        amount: 123,
        currency: "PLN",
        crc,
      }),
    };

    const merchantAttempt = await callRegister(String(merchantId), payload);
    const posAttempt = await callRegister(String(posId), payload);

    return res.status(200).json({
      ok: true,
      env: ENV,
      base: BASE,
      vercel_region: process.env.VERCEL_REGION || null,
      keys_info: {
        merchantId: mask(merchantId),
        posId: mask(posId),
        apiKey_len: apiKey.length,
        crc_len: crc.length,
      },
      payload_sent: payload, // to skopiuj do supportu jako "payload"
      attempts: {
        merchant_login: merchantAttempt,
        pos_login: posAttempt,
      },
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "repro error" });
  }
}
