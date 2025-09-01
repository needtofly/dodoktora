// pages/api/admin/export.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

// Uwaga: pages/api zawsze działa dynamicznie – nie jest prerenderowane.
// Dzięki temu znika błąd z "Failed to collect page data".

function csvEscape(s: string) {
  if (!s) return ''
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).end('Method Not Allowed')
  }

  // Prosta autoryzacja jak w app-routes: sprawdzamy ciastko 'admin_auth'
  const auth = req.cookies?.['admin_auth']
  if (auth !== 'ok') {
    return res.status(401).send('Unauthorized')
  }

  const list = await prisma.booking.findMany({ orderBy: { createdAt: 'desc' } })

  const header = [
    'id',
    'createdAt',
    'fullName',
    'email',
    'phone',
    'visitType',
    'doctor',
    'date',
    'status',
    'priceCents',
    'address',
    'pesel',
    'noPesel',
  ]

  const rows = list.map((b) => {
    // Pola opcjonalne czytamy ostrożnie (nie wszędzie są w schemacie)
    const anyB = b as any
    const address = anyB?.address ?? ''
    const pesel = anyB?.pesel ?? ''
    const noPesel = anyB?.noPesel ? 'true' : 'false'

    return [
      b.id,
      b.createdAt.toISOString(),
      csvEscape(b.fullName),
      b.email ?? '',
      b.phone ?? '',
      b.visitType,
      b.doctor ?? '',
      b.date.toISOString(),
      b.status,
      String(b.priceCents ?? 0),
      address,
      pesel,
      noPesel,
    ].join(',')
  })

  const csv = [header.join(','), ...rows].join('\n')

  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Content-Disposition', 'attachment; filename="bookings.csv"')
  return res.status(200).send(csv)
}
