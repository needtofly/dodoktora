// lib/payu.ts
import crypto from "crypto";

const ENV = (process.env.PAYU_ENV || "sandbox").toLowerCase();
const BASE = ENV === "production" ? "https://secure.payu.com" : "https://secure.snd.payu.com";

const POS_ID = String(process.env.PAYU_POS_ID || "").trim();           // merchantPosId
const CLIENT_ID = String(process.env.PAYU_CLIENT_ID || "").trim();
const CLIENT_SECRET = String(process.env.PAYU_CLIENT_SECRET || "").trim();

function b64(s: string) {
  return Buffer.from(s, "utf8").toString("base64");
}

async function getAccessToken(): Promise<string> {
  const r = await fetch(`${BASE}/pl/standard/user/oauth/authorize`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${b64(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j?.access_token) {
    throw new Error(`PayU OAuth failed (${r.status}) ${JSON.stringify(j).slice(0,300)}`);
  }
  return j.access_token as string;
}

type CreateOrderInput = {
  sessionId: string;            // Twój booking.id (extOrderId)
  amountCents: number;          // grosze
  currency: string;             // "PLN"
  description: string;
  email: string;
  urlReturn: string;
  notifyUrl?: string;
  customerIp?: string;
};

export async function payuCreateOrder(input: CreateOrderInput): Promise<{ redirectUri: string; orderId: string; }> {
  const token = await getAccessToken();

  const payload: any = {
    notifyUrl: input.notifyUrl || process.env.PAYU_NOTIFY_URL,
    continueUrl: input.urlReturn,
    customerIp: input.customerIp || "127.0.0.1",
    merchantPosId: POS_ID,
    description: input.description,
    currencyCode: input.currency,
    totalAmount: String(input.amountCents),
    extOrderId: input.sessionId,
    buyer: {
      email: input.email,
      language: "pl",
    },
    products: [
      {
        name: input.description.slice(0,255),
        unitPrice: String(input.amountCents),
        quantity: "1",
      },
    ],
  };

  const r = await fetch(`${BASE}/api/v2_1/orders`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const j = await r.json().catch(() => ({}));
  if (!r.ok || j?.status?.status !== "SUCCESS") {
    throw new Error(`PayU create order failed (${r.status}) ${JSON.stringify(j).slice(0,300)}`);
  }

  const redirectUri = j?.redirectUri;
  const orderId = j?.orderId || j?.orders?.[0]?.orderId;

  if (!redirectUri || !orderId) {
    throw new Error("PayU response missing redirectUri/orderId");
  }
  return { redirectUri, orderId };
}

export async function payuGetOrder(orderId: string) {
  const token = await getAccessToken();
  const r = await fetch(`${BASE}/api/v2_1/orders/${orderId}`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` },
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`PayU get order failed (${r.status}) ${JSON.stringify(j).slice(0,300)}`);
  // zwracamy ujednolicony widok
  const order = j?.orders?.[0] || j;
  return {
    status: order?.status || order?.order?.status,
    extOrderId: order?.extOrderId || order?.order?.extOrderId,
    totalAmount: Number(order?.totalAmount ?? order?.order?.totalAmount ?? 0),
    currencyCode: order?.currencyCode || order?.order?.currencyCode,
  };
}
