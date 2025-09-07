// pages/api/_diag/p24.ts
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

const isSandbox = (process.env.P24_ENV || "sandbox") === "sandbox";
const BASE = isSandbox ? "https://sandbox.przelewy24.pl" : "https://secure.przelewy24.pl";

const merchantId = Number(process.env.P24_MERCHANT_ID || 0);
const posId = Number(process.env.P24_POS_ID || 0);
const apiKey = (process.env.P24_REST_API_KEY || "").trim();
const crc = (process.env.P24_CRC || "").trim();

function b64(s: string) {
  return Buffer.from(s, "utf8").toString("base64");
}

async function callTestAccess(login: string) {
  const url = `${BASE}/api/v1/testAccess`;
  const h = {
    "Content-Type": "application/json",
    Authorization: `Basic ${b64(`${login}:${apiKey}`)}`,
  };
  try {
    const r = await fetch(url, { method: "GET", headers: h });
    const text = await r.text();
    return { ok: r.ok, status: r.status, body: text.slice(0, 500) || null };
  } catch (e: any) {
    return { ok: false, status: 0, body: e?.message || "fetch error" };
  }
}

// sign = sha384(JSON.stringify({ sessionId, merchantId, amount, currency, crc }))
function signRegister(sessionId: string, amount: number, currency = "PLN") {
  const json = JSON.stringify({ sessionId, merchantId, amount, currency, crc });
  return crypto.createHash("sha384").update(json).digest("hex");
}

async function tryRegister(login: string) {
  const sessionId = `diag-${Date.now()}`;
  const payload = {
    merchantId,
    posId,
    sessionId,
    amount: 123, // 1.23 PLN
    currency: "PLN",
    description: "DIAG",
    email: "diag@example.com",
    country: "PL",
    language: "pl",
    urlReturn: "https://example.org/return",
    urlStatus: "https://example.org/status",
    sign: signRegister(sessionId, 123),
  };

  const url = `${BASE}/api/v1/transaction/register`;
  const h = {
    "Content-Type": "application/json",
    Authorization: `Basic ${b64(`${login}:${apiKey}`)}`,
  };

  try {
    const r = await fetch(url, { method: "POST", headers: h, body: JSON.stringify(payload) });
    const text = await r.text();
    return { ok: r.ok, status: r.status, body: text.slice(0, 800) || null, sessionId };
  } catch (e: any) {
    return { ok: false, status: 0, body: e?.message || "fetch error" };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const action = (req.query.action as string) || "testAccess";

  // maskowanie sekretów
  const mask = (v: string | number) => {
    const s = String(v ?? "");
    if (!s) return null;
    return s.length <= 6 ? `***${s.slice(-2)}` : `${s.slice(0, 2)}***${s.slice(-4)}`;
  };

  const baseInfo = {
    base: BASE,
    env: process.env.P24_ENV || "sandbox",
    merchantId: mask(merchantId),
    posId: mask(posId),
    apiKeyLen: apiKey.length,
    crcLen: crc.length,
  };

  try {
    if (action === "register") {
      const m = await tryRegister(String(merchantId));
      const p = await tryRegister(String(posId));
      return res.status(200).json({ ok: true, baseInfo, mode: "register", merchantLogin: m, posLogin: p });
    }
    // domyślnie testAccess
    const m = await callTestAccess(String(merchantId));
    const p = await callTestAccess(String(posId));
    return res.status(200).json({ ok: true, baseInfo, mode: "testAccess", merchantLogin: m, posLogin: p });
  } catch (e: any) {
    return res.status(500).json({ ok: false, baseInfo, error: e?.message || "diag error" });
  }
}
