// pages/api/admin/bookings/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // (opcjonalnie) tu możesz dodać swój check autoryzacji, jeśli masz helper/cookie
  if (req.method === 'GET') {
    try {
      const {
        q,
        paymentStatus,
        status,
        visitType,
        take = '100',
        skip = '0',
      } = req.query as Record<string, string>;

      const where: any = {};
      if (paymentStatus) where.paymentStatus = paymentStatus;
      if (status) where.status = status;
      if (visitType) where.visitType = visitType;

      if (q) {
        where.OR = [
          { fullName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } },
          { pesel: { contains: q, mode: 'insensitive' } },
          { paymentRef: { contains: q, mode: 'insensitive' } },
        ];
      }

      const [total, bookings] = await Promise.all([
        prisma.booking.count({ where }),
        prisma.booking.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: Number(take) || 100,
          skip: Number(skip) || 0,
        }),
      ]);

      res.status(200).json({ ok: true, total, bookings });
    } catch (e: any) {
      res.status(500).json({ ok: false, error: e?.message ?? 'DB error' });
    }
    return;
  }

  res.setHeader('Allow', 'GET');
  res.status(405).json({ ok: false, error: 'Method Not Allowed' });
}
