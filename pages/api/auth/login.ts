// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';

function getPasswordFromReq(req: NextApiRequest): string {
  const body: any = req.body || {};
  const val = body.password ?? body.haslo ?? '';
  return typeof val === 'string' ? val : String(val || '');
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const expected = process.env.ADMIN_PASSWORD;
  const given = getPasswordFromReq(req);
  const ok = !!expected && !!given && given === expected;

  if (!ok) return res.status(401).json({ error: 'Nieprawidłowe hasło' });

  const isProd = process.env.NODE_ENV === 'production';
  const cookie = [
    `admin_auth=ok`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=${60 * 60 * 8}`,
    isProd ? `Secure` : null,
  ].filter(Boolean).join('; ');

  res.setHeader('Set-Cookie', cookie);
  return res.status(200).json({ ok: true });
}
