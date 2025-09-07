// pages/api/admin/bookings/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const idRaw = req.query.id as string;

  if (!idRaw) {
    return res.status(400).json({ ok: false, error: 'Missing booking id' });
  }

  // Jeśli u Ciebie id jest numberem, a nie stringiem – zmień tutaj na Number(idRaw)
  const where = { id: idRaw };

  if (req.method === 'PATCH') {
    try {
      const { status, paymentStatus, paymentRef } = req.body ?? {};

      const data: any = {};
      if (status) data.status = status;
      if (paymentStatus) data.paymentStatus = paymentStatus;
      // paymentRef może być '', wtedy zapiszemy null
      if (paymentRef !== undefined) data.paymentRef = paymentRef || null;

      // Automatyczne ustawienie completedAt przy oznaczeniu jako COMPLETED
      if (status === 'COMPLETED') {
        data.completedAt = new Date();
      }

      const updated = await prisma.booking.update({ where, data });
      return res.status(200).json({ ok: true, booking: updated });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: e?.message ?? 'DB error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.booking.delete({ where });
      return res.status(200).json({ ok: true });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: e?.message ?? 'DB error' });
    }
  }

  res.setHeader('Allow', 'PATCH, DELETE');
  res.status(405).json({ ok: false, error: 'Method Not Allowed' });
}
