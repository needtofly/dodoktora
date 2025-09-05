// pages/api/admin/bookings/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

// Autoryzację robi middleware.ts

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string
  if (!id) return res.status(400).json({ ok: false, error: 'Brak ID' })

  try {
    if (req.method === 'PATCH') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
      const realized = !!body?.realized
      const updated = await prisma.booking.update({
        where: { id },
        data: { realized },
        select: { id: true, realized: true },
      })
      return res.status(200).json({ ok: true, realized: updated.realized })
    }

    if (req.method === 'DELETE') {
      await prisma.booking.delete({ where: { id } })
      return res.status(200).json({ ok: true })
    }

    res.setHeader('Allow', 'PATCH, DELETE')
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  } catch (e: any) {
    console.error('ADMIN ITEM ERROR:', e)
    return res.status(500).json({ ok: false, error: 'DB error' })
  }
}
