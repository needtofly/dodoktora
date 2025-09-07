// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const { password } = req.body ?? {};
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

  if (!password || String(password) !== ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, error: 'Nieprawidłowe hasło.' });
  }

  const isProd = process.env.NODE_ENV === 'production';
  // cookie: admin=1 (7 dni)
  const cookie = [
    `admin=1`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=${60 * 60 * 24 * 7}`,
    isProd ? `Secure` : null,
  ]
    .filter(Boolean)
    .join('; ');

  res.setHeader('Set-Cookie', cookie);
  return res.status(200).json({ ok: true });
}
