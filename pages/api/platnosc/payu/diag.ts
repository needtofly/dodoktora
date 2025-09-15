// pages/api/platnosc/payu/diag.ts
import type { NextApiRequest, NextApiResponse } from "next";

const ENV = (process.env.PAYU_ENV || "sandbox").toLowerCase();
const BASE = ENV === "production" ? "https://secure.payu.com" : "https://secure.snd.payu.com";

const POS_ID = String(process.env.PAYU_POS_ID || "").trim();           // merchantPosId / pos_id
const CLIENT_ID = String(process.env.PAYU_CLIENT_ID || "").trim();     // OAuth client_id
const CLIENT_SECRET = String(process.env.PAYU_CLIENT_SECRET || "").trim(); // OAuth client_secret

function b64(s: string) {
  return Buffer.from(s, "utf8").toString("base64");
}

async function oauthDiag() {
  const r = await fetch(`${BASE}/pl/standard/user/oauth/authorize`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${b64(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const ct = (r.headers.get("content-type") || "").toLowerCase();
  const text = await r.text();
  let json: any = {};
  if (ct.includes("application/json")) { try { json = JSON.parse(text); } catch {} }

  return {
    ok: r.ok && !!json?.access_token,
    status: r.status,
    contentType: ct || null,
    bodySnippet: text.slice(0, 800),
    accessToken: json?.access_token ? `len:${String(json.access_token).length}` : null,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    // 1) OAuth
    const oauth = await oauthDiag();

    // Jeśli OAuth nie przeszedł — zwróć diagnostykę
    if (!oauth.ok) {
      return res.status(200).json({
        ok: false,
        step: "oauth",
        env: ENV,
        base: BASE,
        posId: POS_ID,
        clientId_len: CLIENT_ID.length,
        details: oauth,
        hint: "Sprawdź PAYU_CLIENT_ID/SECRET, typ POS (REST) i środowisko (PAYU_ENV).",
      });
    }

    // 2) Create Order (test; bez zapisu do DB)
    const continueUrl = process.env.PAYU_RETURN_URL || "https://example.com/platnosc/payu/return";
    const notifyUrl = process.env.PAYU_NOTIFY_URL || "https://example.com/api/platnosc/payu/notify";
    const email = String(req.query.email || "diag@dodoktora.co");
    const amount = Number(req.query.amount || 4900); // 49.00 PLN
    const currency = String(req.query.currency || "PLN");
    const extOrderId = `diag-${Date.now()}`;

    // IP klienta (Vercel header) albo fallback
    const xff = String(req.headers["x-forwarded-for"] || "");
    const customerIp = xff.split(",")[0].trim() || "127.0.0.1";

    // pobierz token jeszcze raz (rozdzielenie kroków w diag)
    let token = "";
    {
      const r = await fetch(`${BASE}/pl/standard/user/oauth/authorize`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${b64(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });
      const t = await r.text();
      try { token = JSON.parse(t)?.access_token || ""; } catch { token = ""; }
    }

    const payload: any = {
      notifyUrl,
      continueUrl,
      customerIp,
      merchantPosId: POS_ID,
      description: `DIAG order for ${email}`,
      currencyCode: currency,
      totalAmount: String(amount),
      extOrderId,
      buyer: { email, language: "pl" },
      products: [{ name: "Diag", unitPrice: String(amount), quantity: "1" }],
    };

    const r = await fetch(`${BASE}/api/v2_1/orders`, {
      method: "POST",
      redirect: "manual", // nie podążamy za 302, bierzemy Location
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const loc = r.headers.get("location");
    const ct = (r.headers.get("content-type") || "").toLowerCase();
    const text = await r.text();
    let json: any = {};
    if (ct.includes("application/json")) { try { json = JSON.parse(text); } catch {} }

    const statusNode = json?.status || {};
    const statusOk =
      (typeof statusNode?.statusCode === "string" && statusNode.statusCode.toUpperCase() === "SUCCESS") ||
      (typeof statusNode?.status === "string" && statusNode.status.toUpperCase() === "SUCCESS");

    return res.status(200).json({
      ok: (r.status === 302 || r.status === 303) && !!loc || (r.ok && statusOk && !!(json?.redirectUri)),
      env: ENV,
      base: BASE,
      posId: POS_ID,
      clientId_len: CLIENT_ID.length,
      payloadSent: { // bez sekretów
        continueUrl, notifyUrl, customerIp,
        merchantPosId: POS_ID,
        totalAmount: String(amount), currencyCode: currency, extOrderId,
        buyer: { email, language: "pl" },
        products: [{ name: "Diag", unitPrice: String(amount), quantity: "1" }],
      },
      response: {
        status: r.status,
        redirected: r.redirected,
        locationHeader: loc || null,
        contentType: ct || null,
        bodySnippet: text.slice(0, 1200),
        jsonExtract: {
          status: json?.status || null,
          redirectUri: json?.redirectUri || null,
          orderId: json?.orderId || json?.orders?.[0]?.orderId || null,
        },
      },
      note: "Jeśli ok=false, prześlij ten JSON do nas / do PayU – zdiagnozujemy dokładnie.",
    });
  } catch (e: any) {
    return res.status(200).json({ ok: false, error: String(e?.message || e) });
  }
}
