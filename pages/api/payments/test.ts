// C:\Users\JS Enterprise\telemed\pages\api\payments\test.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type Ok = { ok: true; redirectUrl: string };
type Err = { ok: false; error: string; details?: unknown };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Ok | Err>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    // TODO: tu zwykle tworzysz rezerwację / transakcję itd.
    // Dla testu generujemy identyfikator i kierujemy do mockowej strony płatności w aplikacji
    const tx = crypto.randomUUID();
    const redirectUrl = `/platnosc/p24/mock?tx=${encodeURIComponent(tx)}`;

    return res.status(200).json({ ok: true, redirectUrl });
  } catch (e: any) {
    // Jeśli coś pójdzie źle, zwróć status != 200
    return res.status(500).json({
      ok: false,
      error: 'Payment init failed',
      details: e?.message ?? String(e),
    });
  }
}
