import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

function csvEscape(value: unknown): string {
  const s = value == null ? '' : String(value)
  // jeśli zawiera cudzysłów, przecinek lub nową linię — otocz w cudzysłowy i zdubluj cudzysłowy
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const bookings = await prisma.booking.findMany({
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
        pesel: true,
        // UWAGA: bez noPesel i bez address — jeśli dodasz je do schematu,
        // można je dopisać do select + CSV
      },
    })

    const header = [
      'ID',
      'Utworzono',
      'Imię i nazwisko',
      'Email',
      'Telefon',
      'Typ wizyty',
      'Lekarz',
      'Data wizyty',
      'Status',
      'Cena (gr)',
      'Uwagi',
      'PESEL',
    ]

    const rows = bookings.map(b => [
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
      b.pesel ?? '',
    ])

    const csv = [header, ...rows].map(r => r.map(csvEscape).join(',')).join('\n')

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="bookings.csv"')
    return res.status(200).send(csv)
  } catch (err) {
    console.error('[pages/api/admin/export] error:', err)
    return res.status(500).json({ error: 'Błąd generowania eksportu' })
  }
}
