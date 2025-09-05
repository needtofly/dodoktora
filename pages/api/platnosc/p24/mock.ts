import type { NextApiRequest, NextApiResponse } from 'next';
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Location', '/platnosc/p24/mock');
  return res.status(302).end();
}
