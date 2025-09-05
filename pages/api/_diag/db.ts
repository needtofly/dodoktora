import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const one = await prisma.$queryRaw<{ one: number }[]>`SELECT 1 as one`
    const count = await prisma.booking.count().catch(() => -1)
    res.status(200).json({ ok: true, one, count })
  } catch (e: any) {
    console.error('diag db error', e)
    res.status(500).json({ ok: false, error: e?.message || 'db error' })
  }
}
