import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(bookings)
  } catch (e) {
    console.error('[admin bookings] GET error', e)
    return NextResponse.json({ error: 'Błąd pobierania' }, { status: 500 })
  }
}
