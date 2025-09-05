// pages/api/diag/db.ts
import type { NextApiRequest, NextApiResponse } from 'next';

let prisma: any = null;
try {
  const { prisma: p } = require('@/lib/prisma');
  prisma = p;
} catch {
  prisma = null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // W produkcji nie ujawniamy diagn. endointu
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).end();
  }
  if (!prisma) {
    return res.status(200).json({ ok: false, reason: 'No Prisma client import' });
  }

  try {
    if (req.query.create === '1') {
      const rec = await prisma.booking.create({
        data: {
          fullName: 'Test User',
          email: 'test@example.com',
          phone: '000000000',
          visitType: 'Teleporada',
          doctor: 'Dr. Test',
          date: new Date(),
          notes: 'diag',
          address: null,
          pesel: null,
          noPesel: true,
          amount: 49,
          currency: 'PLN',
          status: 'PENDING',
          createdAt: new Date(),
        },
      });
      return res.status(200).json({ ok: true, createdId: rec.id });
    }
    const count = await prisma.booking.count();
    return res.status(200).json({ ok: true, count });
  } catch (e: any) {
    return res.status(200).json({ ok: false, error: e?.message || String(e) });
  }
}
