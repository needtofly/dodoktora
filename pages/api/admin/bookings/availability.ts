// pages/api/bookings/availability.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const dateStr = String(req.query.date || '')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return res.status(400).json({ error: 'Nieprawidłowa data' })
  }

  try {
    // Zakładamy, że daty zapisujemy w UTC (tak generatesz po stronie klienta z "Z").
    const start = new Date(`${dateStr}T00:00:00.000Z`)
    const end = new Date(start); end.setUTCDate(end.getUTCDate() + 1)

    const bookings = await prisma.booking.findMany({
      where: { date: { gte: start, lt: end } },
      select: { date: true },
    })

    // Zwróć HH:mm w CZASIE LOKALNYM serwera (spójne z tym, co widzi użytkownik w formularzu):
    const taken = bookings.map(b => {
      const d = new Date(b.date)
      const hh = String(d.getHours()).padStart(2, '0')
      const mm = String(d.getMinutes()).padStart(2, '0')
      return `${hh}:${mm}`
    })

    return res.status(200).json({ taken })
  } catch (e) {
    console.error('availability error:', e)
    return res.status(500).json({ error: 'DB error' })
  }
}
