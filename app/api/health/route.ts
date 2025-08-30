import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ ok: true })
  } catch (e:any) {
    console.error('[HEALTH] prisma error:', e)
    return NextResponse.json({ ok: false, error: 'db' }, { status: 500 })
  }
}
