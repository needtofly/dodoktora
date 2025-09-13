import type { NextApiRequest, NextApiResponse } from "next";

function b64(s: string) { return Buffer.from(s, "utf8").toString("base64"); }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const env = (process.env.PAYU_ENV || "sandbox").toLowerCase();
  const base = env === "production" ? "https://secure.payu.com" : "https://secure.snd.payu.com";
  const cid = String(process.env.PAYU_CLIENT_ID || "").trim();
  const cs = String(process.env.PAYU_CLIENT_SECRET || "").trim();
  const pos = String(process.env.PAYU_POS_ID || "").trim();

  let status = 0, body = "";
  try {
    const r = await fetch(`${base}/pl/standard/user/oauth/authorize`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${b64(`${cid}:${cs}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    status = r.status;
    body = (await r.text()).slice(0, 250);
  } catch (e: any) {
    body = String(e?.message || e);
  }

  res.status(200).json({
    ok: status === 200,
    env, base,
    clientId_len: cid.length,
    clientId_tail: cid.slice(-3),
    posId: pos,
    status, body,
  });
}
