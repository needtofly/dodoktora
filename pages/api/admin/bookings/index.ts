// pages/api/admin/bookings/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

function toInt(v: string | string[] | undefined, def = 0) {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isFinite(n) && n >= 0 ? n : def;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const {
      q,
      paymentStatus,
      status,
      visitType,
      take = '100',
      skip = '0',
      dateFrom,
      dateTo,
    } = req.query as Record<string, string>;

    const where: any = {};

    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (status) where.status = status;

    // visitType – case-insensitive (Teleporada/Wizyta domowa) + wariacje
    if (visitType) {
      where.visitType = { contains: visitType, mode: 'insensitive' };
    }

    // Zakres dat po polu Booking.date (termin wizyty)
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    if (q) {
      where.OR = [
        { id: { contains: q, mode: 'insensitive' } },
        { fullName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { pesel: { contains: q, mode: 'insensitive' } },
        { paymentRef: { contains: q, mode: 'insensitive' } },
        // adresy (nowe i legacy)
        { address: { contains: q, mode: 'insensitive' } },
        { addressLine1: { contains: q, mode: 'insensitive' } },
        { addressLine2: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
        { postalCode: { contains: q, mode: 'insensitive' } },
        // lekarz
        { doctor: { contains: q, mode: 'insensitive' } },
      ];
    }

    const takeNum = Math.min(Math.max(toInt(take, 100), 1), 500);
    const skipNum = Math.max(toInt(skip, 0), 0);

    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: takeNum,
        skip: skipNum,
      }),
    ]);

    return res.status(200).json({ ok: true, total, bookings });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message ?? 'DB error' });
  }
}
