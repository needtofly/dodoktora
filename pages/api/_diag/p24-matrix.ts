// pages/api/_diag/p24-matrix.ts
import type { NextApiRequest, NextApiResponse } from "next";

const merchantId = String(process.env.P24_MERCHANT_ID || "").trim();
const posId = String(process.env.P24_POS_ID || "").trim();
const apiKey = String(process.env.P24_REST_API_KEY || "").trim();

const HOSTS = {
  sandbox: "https://sandbox.przelewy24.pl",
  production: "https://secure.przelewy24.pl",
};

function b64(s: string) {
  return Buffer.from(s, "utf8").toString("base64");
}

async function testAccess(base: string, login: string) {
  try {
    const r = await fetch(`${base}/api/v1/testAccess`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Basic ${b64(`${login}:${apiKey}`)}`,
      },
    });
    const body = await r.text();
    return { ok: r.ok, status: r.status, body: body.slice(0, 300) };
  } catch (e: any) {
    return { ok: false, status: 0, body: e?.message || "fetch error" };
  }
}

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const result: any = { merchantId: merchantId ? "***" + merchantId.slice(-4) : null, posId: posId ? "***" + posId.slice(-4) : null, apiKeyLen: apiKey.length, rows: [] };
  for (const [env, base] of Object.entries(HOSTS)) {
    for (const who of ["merchantId", "posId"] as const) {
      const login = who === "merchantId" ? merchantId : posId;
      const out = await testAccess(base, login);
      result.rows.push({ env, base, who, loginMask: login ? "***" + login.slice(-4) : null, ...out });
    }
  }
  res.status(200).json(result);
}
