import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date') // YYYY-MM-DD (lokalnie z formularza)
    if (!date) return NextResponse.json({ error: 'Parametr date jest wymagany (YYYY-MM-DD).' }, { status: 400 })

    // Zakładamy, że zapisujesz daty jako UTC (tak jak w formularzu: `${date}T${time}:00.000Z`)
    // Szukamy w granicach całej doby UTC podanej daty:
    const start = new Date(`${date}T00:00:00.000Z`)
    const end = new Date(`${date}T23:59:59.999Z`)

    const booked = await prisma.booking.findMany({
      where: {
        visitType: 'Teleporada',
        status: { in: ['PENDING', 'PAID'] },
        date: { gte: start, lte: end },
      },
      select: { date: true }
    })

    // Zwróć listę stringów "HH:MM" (UTC), zgodnie z tym jak składamy czasu w formularzu
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
