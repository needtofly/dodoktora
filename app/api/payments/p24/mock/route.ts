import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    // Mock jest dozwolony tylko w sandbox i gdy NIE ma jeszcze danych P24
    const isSandbox = process.env.P24_SANDBOX === 'true'
    const hasCreds =
      !!process.env.P24_MERCHANT_ID &&
      !!process.env.P24_POS_ID &&
      !!process.env.P24_CRC &&
      !!process.env.P24_API_KEY

    if (!isSandbox || hasCreds) {
      return NextResponse.json({ error: 'Mock niedostępny.' }, { status: 403 })
    }

    const { bookingId } = await req.json().catch(() => ({}))
    if (!bookingId) {
      return NextResponse.json({ error: 'Brak bookingId' }, { status: 400 })
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'PAID' },
    }).catch(() => null)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[P24 MOCK] error', e)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
