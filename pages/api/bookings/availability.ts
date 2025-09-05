// pages/api/bookings/availability.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Na teraz zwracamy puste zajętości — formularz i tak ruszy.
  // W etapie z bazą wypełnimy to realnymi slotami z tabeli bookings.
  const date = String(req.query.date || '');
  return res.status(200).json({ date, taken: [] as string[] });
}
