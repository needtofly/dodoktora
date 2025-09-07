// pages/api/auth/logout.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const isProd = process.env.NODE_ENV === 'production';
  // wygaszenie cookie
  const cookie = [
    `admin=`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=0`,
    isProd ? `Secure` : null,
  ]
    .filter(Boolean)
    .join('; ');

  res.setHeader('Set-Cookie', cookie);
  return res.status(200).json({ ok: true });
}
