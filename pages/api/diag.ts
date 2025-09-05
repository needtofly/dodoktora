// pages/api/diag.ts
import type { NextApiRequest, NextApiResponse } from 'next';

let prisma: any = null;
try {
  const { prisma: p } = require('@/lib/prisma');
  prisma = p;
} catch {
  prisma = null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // w prod ukryte, chyba że włączysz flagę
  const allowProd = process.env.ALLOW_DIAG === '1';
  if (process.env.NODE_ENV === 'production' && !allowProd) return res.status(404).end();

  const hasDbUrl = !!process.env.DATABASE_URL;
  const hasPrisma = !!prisma;

  try {
    const count = hasDbUrl && hasPrisma ? await prisma.booking.count() : null;

    if (req.query.create === '1' && hasDbUrl && hasPrisma) {
      const rec = await prisma.booking.create({
        data: {
          fullName: 'Diag User',
          email: 'diag@example.com',
          phone: '000000000',
          visitType: 'Teleporada',
          doctor: 'Dr. Diag',
          date: new Date(),
          noPesel: true,
          amount: 49,
          currency: 'PLN',
          status: 'PENDING',
          createdAt: new Date(),
        },
      });
      return res.status(200).json({ ok: true, hasDbUrl, hasPrisma, createdId: rec.id });
    }

    return res.status(200).json({ ok: true, hasDbUrl, hasPrisma, count });
  } catch (e: any) {
    return res.status(200).json({ ok: false, hasDbUrl, hasPrisma, error: e?.message || String(e) });
  }
}
