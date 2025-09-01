import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { buildIcs } from '@/utils/ics'
import { sendBookingEmail } from '@/lib/mailer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST')
      return res.status(405).json({ error: 'Method Not Allowed' })
    }

    const { bookingId } = (req.body ?? {}) as { bookingId?: string }
    if (!bookingId) return res.status(400).json({ error: 'Brak bookingId' })

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'PAID' },
    })

    const when = new Date(booking.date)
    const ics = buildIcs({
      title: `${booking.visitType}${booking.doctor ? ` — ${booking.doctor}` : ''}`,
      start: when,
      durationMinutes: 10,
      description: 'Rezerwacja wizyty — dodoktora.co',
    })

    const text =
      `Dziękujemy za rezerwację!\n\n` +
      `Pacjent: ${booking.fullName}\n` +
      `Wizyta: ${booking.visitType}${booking.doctor ? ` — ${booking.doctor}` : ''}\n` +
      `Termin: ${when.toLocaleString('pl-PL')}\n` +
      `Status płatności: ${booking.status}\n`

    await sendBookingEmail({
      to: booking.email || '',
      subject: 'Potwierdzenie rezerwacji — dodoktora.co',
      text,
      icsContent: ics,
    }).catch(() => {})

    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('[pages/api/payments/test] error:', e)
    return res.status(500).json({ error: 'Błąd serwera' })
  }
}
