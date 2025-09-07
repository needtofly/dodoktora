// pages/api/_diag/env-p24.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_: NextApiRequest, res: NextApiResponse) {
  const mask = (v?: string | number | null) => {
    const s = String(v ?? "");
    if (!s) return null;
    return s.length <= 6 ? `***${s.slice(-2)}` : `${s.slice(0, 2)}***${s.slice(-4)}`;
  };

  const data = {
    P24_ENV: process.env.P24_ENV || "sandbox",
    P24_MERCHANT_ID: mask(process.env.P24_MERCHANT_ID),
    P24_POS_ID: mask(process.env.P24_POS_ID),
    P24_REST_API_KEY_LEN: (process.env.P24_REST_API_KEY || "").length,
    P24_CRC_LEN: (process.env.P24_CRC || "").length,
    BASE_WOULD_BE: (process.env.P24_ENV || "sandbox") === "sandbox"
      ? "https://sandbox.przelewy24.pl"
      : "https://secure.przelewy24.pl",
  };

  res.status(200).json({ ok: true, data });
}
