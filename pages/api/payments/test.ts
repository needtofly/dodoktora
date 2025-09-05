// pages/api/payments/test.ts
import type { NextApiRequest, NextApiResponse } from 'next';

function genId() {
  try { return crypto.randomUUID(); } catch {}
  return 'b_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const bookingId = genId();
  const redirectUrl = `/platnosc/p24/mock?id=${encodeURIComponent(bookingId)}&bookingId=${encodeURIComponent(bookingId)}`;
  return res.status(200).json({ ok: true, bookingId, redirectUrl, url: redirectUrl });
}
