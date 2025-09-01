// pages/api/admin/export.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

/**
 * Zwraca CSV wszystkich rezerwacji.
 * To jest Pages API (pages/api), więc Next NIE próbuje tego prerenderować jak stronę.
 */
export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const list = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        fullName: true,
        email: true,
        phone: true,
        visitType: true,
        doctor: true,
        date: true,
        status: true,
        priceCents: true,
        notes: true,
        address: true,
        pesel: true,
        noPesel: true,
      }
    })

    const header = [
      'id','createdAt','fullName','email','phone',
      'visitType','doctor','date','status','priceCents',
      'notes','address','pesel','noPesel'
    ]

    const escape = (v: unknown) => {
      const s = v == null ? '' : String(v)
      // proste ucieczki dla CSV
      if (s.includes('"') || s.includes(',') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`
      }
      return s
    }

    const rows = list.map(b => [
      b.id,
      b.createdAt.toISOString(),
      b.fullName,
      b.email ?? '',
      b.phone ?? '',
      b.visitType,
      b.doctor ?? '',
      b.date.toISOString(),
      b.status,
      String(b.priceCents ?? 0),
      b.notes ?? '',
      b.address ?? '',
      b.pesel ?? '',
      b.noPesel ? 'true' : 'false',
    ].map(escape).join(','))

    const csv = [header.join(','), ...rows].join('\n')

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="bookings.csv"`)
    res.status(200).send(csv)
  } catch (e) {
    console.error('[admin/export] error', e)
    res.status(500).json({ error: 'Export failed' })
  }
}
