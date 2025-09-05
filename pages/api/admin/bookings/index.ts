// pages/api/admin/bookings/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

// Uwaga: middleware.ts już wymusza autoryzację (cookie admin_auth=ok)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const items = await prisma.booking.findMany({
        orderBy: { date: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          visitType: true,
          doctor: true,
          date: true,
          notes: true,
          status: true,
          priceCents: true,
          createdAt: true,
          realized: true,
          pesel: true,
          // address / noPesel / currency / updatedAt – jeżeli chcesz, dopisz
        },
      })
      return res.status(200).json({ ok: true, items })
    } catch (e: any) {
      console.error('ADMIN LIST ERROR:', e)
      return res.status(500).json({ ok: false, error: 'DB error' })
    }
  }

  res.setHeader('Allow', 'GET')
  return res.status(405).json({ ok: false, error: 'Method not allowed' })
}
