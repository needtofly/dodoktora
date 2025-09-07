// lib/p24.ts
import crypto from "crypto";

const isSandbox = (process.env.P24_ENV || "sandbox") === "sandbox";

const BASE = isSandbox
  ? "https://sandbox.przelewy24.pl"
  : "https://secure.przelewy24.pl";

// UŻYWAJ merchantId do Basic Auth (login), NIE posId
const merchantId = Number(process.env.P24_MERCHANT_ID || 0);
const posId = Number(process.env.P24_POS_ID || 0); // dalej potrzebny w payload
const crc = (process.env.P24_CRC || "").trim();
const apiKey = (process.env.P24_REST_API_KEY || "").trim();

function authHeader() {
  // Basic base64(merchantId:apiKey)  ← kluczowa zmiana
  const token = Buffer.from(`${merchantId}:${apiKey}`).toString("base64");
  return `Basic ${token}`;
}

// SHA-384(JSON.stringify(obj))
function sha384Of(obj: Record<string, any>) {
  const json = JSON.stringify(obj);
  return crypto.createHash("sha384").update(json).digest("hex");
}

/** Rejestracja transakcji – zwraca token i link do przekierowania */
export async function p24Register(opts: {
  sessionId: string;               // unikalny identyfikator (np. booking.id)
  amountCents: number;             // kwota w groszach
  currency?: string;               // 'PLN'
  description: string;
  email: string;
  country?: string;                // 'PL'
  language?: string;               // 'pl'
  urlReturn: string;
  urlStatus: string;               // webhook
}) {
  const {
    sessionId, amountCents, currency = "PLN",
    description, email, country = "PL", language = "pl",
    urlReturn, urlStatus
  } = opts;

  // sign dla register: {sessionId, merchantId, amount, currency, crc}
  const sign = sha384Of({
    sessionId,
    merchantId,
    amount: amountCents,
    currency,
    crc,
  });

  const payload = {
    merchantId,
    posId,
    sessionId,
    amount: amountCents,
    currency,
    description,
    email,
    country,
    language,
    urlReturn,
    urlStatus,
    sign,
  };

  const res = await fetch(`${BASE}/api/v1/transaction/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({} as any));
  if (!res.ok || !data?.data?.token) {
    const msg = data?.error || data?.message || `P24 register HTTP ${res.status}`;
    // pomocny log przy 401
    if (res.status === 401) {
      console.error("[P24] 401 Incorrect authentication. Upewnij się, że Authorization=Basic base64(merchantId:apiKey).", {
        merchantId, posId, hasApiKey: !!apiKey
      });
    }
    throw new Error(msg);
  }

  const token: string = data.data.token;
  const redirectUrl = `${BASE}/trnRequest/${token}`;
  return { token, redirectUrl };
}

/** Weryfikacja transakcji po stronie serwera (po webhooku) */
export async function p24Verify(opts: {
  sessionId: string;
  orderId: number;
  amountCents: number;
  currency?: string; // 'PLN'
}) {
  const { sessionId, orderId, amountCents, currency = "PLN" } = opts;

  // sign dla verify: {sessionId, orderId, amount, currency, crc}
  const sign = sha384Of({
    sessionId,
    orderId,
    amount: amountCents,
    currency,
    crc,
  });

  const payload = {
    merchantId,
    posId,
    sessionId,
    amount: amountCents,
    currency,
    orderId,
    sign,
  };

  const res = await fetch(`${BASE}/api/v1/transaction/verify`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({} as any));
  if (!res.ok) {
    const msg = data?.error || data?.message || `P24 verify HTTP ${res.status}`;
    throw new Error(msg);
  }
  return true;
}

/** Walidacja podpisu z webhooka (notify) */
export function p24ValidateWebhookSign(body: {
  sessionId: string;
  orderId: number;
  amount: number;   // grosze
  currency: string; // PLN
  sign: string;
}) {
  const expected = sha384Of({
    sessionId: body.sessionId,
    orderId: body.orderId,
    amount: body.amount,
    currency: body.currency,
    crc,
  });
  return expected === body.sign;
}
