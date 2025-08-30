import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildIcs } from '@/utils/ics'
import { sendBookingEmail } from '@/lib/mailer'

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json() as { bookingId?: string }
    if (!bookingId) return NextResponse.json({ error: 'Brak bookingId' }, { status: 400 })

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'PAID' }
    })

    const when = new Date(booking.date)
    const ics = buildIcs({
      title: `${booking.visitType} — ${booking.fullName}`,
      starts: when,
      durationMin: booking.visitType === 'Teleporada' ? 20 : 40
    })
    const text =
`Dziękujemy za rezerwację.
Rodzaj: ${booking.visitType}
Data: ${when.toLocaleString('pl-PL')}
Lekarz: ${booking.doctor || '—'}
Cena: ${(booking.priceCents/100).toFixed(2)} zł`

    await sendBookingEmail({
      to: booking.email,
      subject: `Potwierdzenie wizyty — ${booking.visitType}`,
      text,
      ics: { filename: 'wizyta.ics', content: ics }
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
