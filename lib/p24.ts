// lib/p24.ts
import crypto from "crypto";

const isSandbox = (process.env.P24_ENV || "sandbox") === "sandbox";
const BASE = isSandbox ? "https://sandbox.przelewy24.pl" : "https://secure.przelewy24.pl";

const merchantId = Number((process.env.P24_MERCHANT_ID || "").trim());
const posId = Number((process.env.P24_POS_ID || "").trim());
const crc = (process.env.P24_CRC || "").trim();
const apiKey = (process.env.P24_REST_API_KEY || "").trim();

// -----------------------------
// utils
// -----------------------------
function sha384Of(obj: Record<string, any>) {
  const json = JSON.stringify(obj);
  return crypto.createHash("sha384").update(json).digest("hex");
}

function b64(s: string) {
  return Buffer.from(s, "utf8").toString("base64");
}

async function testAccess(login: string) {
  const url = `${BASE}/api/v1/testAccess`;
  const r = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Basic ${b64(`${login}:${apiKey}`)}`,
    },
  });
  return r.ok;
}

// -----------------------------
// auto-detect auth (posId vs merchantId)
// -----------------------------
let cachedLogin: "pos" | "merchant" | null = null;
let detecting = false;

async function getAuthLogin(): Promise<"pos" | "merchant"> {
  if (cachedLogin) return cachedLogin;

  // unikamy równoległych probe
  if (detecting) {
    // krótka pętla – czekamy aż ktoś inny wykryje
    await new Promise((r) => setTimeout(r, 200));
    return cachedLogin || "pos";
  }

  detecting = true;
  try {
    // preferuj POS – wg części dokumentacji „User = posId”
    if (posId && (await testAccess(String(posId)))) {
      cachedLogin = "pos";
      return "pos";
    }
    // fallback – login = merchantId
    if (merchantId && (await testAccess(String(merchantId)))) {
      cachedLogin = "merchant";
      return "merchant";
    }
    // nic nie przeszło – zostaw 'pos' (i nie cache’uj)
    return "pos";
  } finally {
    detecting = false;
  }
}

async function authHeader() {
  const mode = await getAuthLogin();
  const login = mode === "pos" ? String(posId) : String(merchantId);
  return `Basic ${b64(`${login}:${apiKey}`)}`;
}

// -----------------------------
// API: register / verify / webhook-sign
// -----------------------------
export async function p24Register(opts: {
  sessionId: string;
  amountCents: number;
  currency?: string;
  description: string;
  email: string;
  country?: string;
  language?: string;
  urlReturn: string;
  urlStatus: string;
}) {
  const {
    sessionId, amountCents, currency = "PLN",
    description, email, country = "PL", language = "pl",
    urlReturn, urlStatus,
  } = opts;

  const sign = sha384Of({ sessionId, merchantId, amount: amountCents, currency, crc });

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
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": await authHeader(),
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let data: any = {};
  try { data = JSON.parse(text); } catch {}
  if (!res.ok || !data?.data?.token) {
    const msg = data?.error || data?.message || `P24 register HTTP ${res.status}`;
    if (res.status === 401) {
      console.error("[P24] 401 Incorrect authentication. Sprawdź w panelu: włącz REST API, ustaw 'Adres IP 1' na '%', wygeneruj nowy API key i wklej do ENV. Używany login:", cachedLogin ?? "probe-failed");
    }
    throw new Error(msg);
  }

  const token: string = data.data.token;
  const redirectUrl = `${BASE}/trnRequest/${token}`;
  return { token, redirectUrl };
}

export async function p24Verify(opts: {
  sessionId: string;
  orderId: number;
  amountCents: number;
  currency?: string;
}) {
  const { sessionId, orderId, amountCents, currency = "PLN" } = opts;

  const sign = sha384Of({ sessionId, orderId, amount: amountCents, currency, crc });
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
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": await authHeader(),
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) {
    let data: any = {};
    try { data = JSON.parse(text); } catch {}
    const msg = data?.error || data?.message || `P24 verify HTTP ${res.status}`;
    throw new Error(msg);
  }
  return true;
}

export function p24ValidateWebhookSign(body: {
  sessionId: string;
  orderId: number;
  amount: number;
  currency: string;
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
