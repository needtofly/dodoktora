import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const auth = cookies().get('admin_auth')?.value
  if (auth !== 'ok') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const list = await prisma.booking.findMany({ orderBy: { createdAt: 'desc' }})
  const header = ['id','createdAt','fullName','email','phone','visitType','doctor','date','status','price']
  const rows = list.map(b => [
    b.id,
    b.createdAt.toISOString(),
    `"${(b.fullName || '').replace(/"/g,'""')}"`,
    b.email,
    b.phone,
    b.visitType,
    b.doctor ?? '',
    b.date.toISOString(),
    b.status,
    (b.priceCents/100).toFixed(2)
  ].join(','))

  const csv = [header.join(','), ...rows].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="bookings.csv"`
    }
  })
}
