import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Usuń wizytę
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.booking.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[admin bookings] DELETE error', e)
    return NextResponse.json({ error: 'Nie udało się usunąć' }, { status: 500 })
  }
}

// Zmień realizację (zrealizowana / niezrealizowana)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}))
    const realized = !!body.realized
    await prisma.booking.update({ where: { id: params.id }, data: { realized } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[admin bookings] PATCH error', e)
    return NextResponse.json({ error: 'Nie udało się zmienić statusu' }, { status: 500 })
  }
}
