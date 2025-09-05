import type { NextApiRequest, NextApiResponse } from 'next';
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const redirectUrl = '/platnosc/p24/mock';
  return res.status(200).json({ ok: true, redirectUrl, url: redirectUrl });
}
