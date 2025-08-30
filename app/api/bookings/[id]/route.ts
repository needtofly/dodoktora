import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: params.id } })
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(booking)
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
