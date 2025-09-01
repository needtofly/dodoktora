// app/api/bookings/availability/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ważne: oznaczamy jako dynamiczne, żeby Next nie próbował tego prerenderować
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date') // YYYY-MM-DD (lokalnie z formularza)
    if (!date) {
      return NextResponse.json(
        { error: 'Parametr date jest wymagany (YYYY-MM-DD).' },
        { status: 400 }
      )
    }

    // Zakładamy zapis UTC (np. `${date}T${time}:00.000Z`)
    const start = new Date(`${date}T00:00:00.000Z`)
    const end   = new Date(`${date}T23:59:59.999Z`)

    const booked = await prisma.booking.findMany({
      where: {
        visitType: 'Teleporada',
        status: { in: ['PENDING', 'PAID'] },
        date: { gte: start, lte: end },
      },
      select: { date: true },
    })

    // Zwróć listę HH:MM (UTC), tak jak składamy czas w formularzu
    const pad = (n: number) => String(n).padStart(2, '0')
    const taken = booked.map(b => {
      const h = b.date.getUTCHours()
      const m = b.date.getUTCMinutes()
      return `${pad(h)}:${pad(m)}`
    })

    return NextResponse.json({ taken })
  } catch (e) {
    console.error('[availability] error:', e)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}