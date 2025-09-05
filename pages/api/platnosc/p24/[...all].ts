// pages/api/platnosc/p24/[...all].ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Zwracamy zawsze 200 OK, żeby mock nie wywalał 404
  const path = Array.isArray(req.query.all) ? req.query.all.join('/') : String(req.query.all || '');
  return res.status(200).json({ ok: true, path, method: req.method });
}
