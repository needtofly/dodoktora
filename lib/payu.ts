// lib/payu.ts
const ENV = (process.env.PAYU_ENV || "sandbox").toLowerCase();
const BASE = ENV === "production" ? "https://secure.payu.com" : "https://secure.snd.payu.com";

const POS_ID = String(process.env.PAYU_POS_ID || "").trim();
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

  const text = await r.text();
  let j: any = {};
  try { j = JSON.parse(text); } catch {}

  if (!r.ok || !j?.access_token) {
    throw new Error(`PayU OAuth failed; status=${r.status}; body=${text.slice(0,500)}`);
  }
  return j.access_token as string;
}

type CreateOrderInput = {
  sessionId: string;
  amountCents: number;
  currency: string;
  description: string;
  email: string;
  urlReturn: string;
  notifyUrl?: string;
  customerIp?: string;
};

export async function payuCreateOrder(input: CreateOrderInput): Promise<{ redirectUri: string; orderId?: string; }> {
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
    buyer: { email: input.email, language: "pl" },
    products: [{ name: input.description.slice(0,255), unitPrice: String(input.amountCents), quantity: "1" }],
  };

  const r = await fetch(`${BASE}/api/v2_1/orders`, {
    method: "POST",
    redirect: "manual", // nie podążamy za 302
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const loc = r.headers.get("location");
  const ct = (r.headers.get("content-type") || "").toLowerCase();
  const text = await r.text();
  let j: any = {};
  if (ct.includes("application/json")) { try { j = JSON.parse(text); } catch {} }

  if ((r.status === 302 || r.status === 303) && loc) {
    return { redirectUri: loc };
  }

  const statusNode = j?.status || {};
  const statusOk =
    (typeof statusNode?.statusCode === "string" && statusNode.statusCode.toUpperCase() === "SUCCESS") ||
    (typeof statusNode?.status === "string" && statusNode.status.toUpperCase() === "SUCCESS");
  const redirectUri: string | undefined = j?.redirectUri || j?.redirecturl || j?.redirectURL;
  const orderId: string | undefined = j?.orderId || j?.orders?.[0]?.orderId;

  if (statusOk && redirectUri) {
    return { redirectUri, orderId };
  }

  if (r.ok && r.redirected && typeof r.url === "string" && r.url.startsWith("http")) {
    return { redirectUri: r.url };
  }

  throw new Error(
    `PayU create order failed; status=${r.status}; ct=${ct || "n/a"}; ` +
    `locationHeader=${loc || "n/a"}; body=${text.slice(0,600)}`
  );
}

export async function payuGetOrder(orderId: string) {
  const token = await getAccessToken();
  const r = await fetch(`${BASE}/api/v2_1/orders/${orderId}`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` },
  });
  const ct = (r.headers.get("content-type") || "").toLowerCase();
  const text = await r.text();
  let j: any = {};
  if (ct.includes("application/json")) { try { j = JSON.parse(text); } catch {} }
  if (!r.ok) throw new Error(`PayU get order failed; status=${r.status}; body=${text.slice(0,500)}`);

  const order = j?.orders?.[0] || j?.order || j;
  return {
    status: order?.status,
    extOrderId: order?.extOrderId,
    totalAmount: Number(order?.totalAmount ?? 0),
    currencyCode: order?.currencyCode || "PLN",
  };
}
