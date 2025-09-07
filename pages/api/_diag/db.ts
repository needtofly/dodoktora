import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // prosta próba połączenia + zapytanie o aktualny czas
    const now = await prisma.$queryRawUnsafe<{ now: Date }[]>('select now() as now');
    res.status(200).json({
      ok: true,
      now: now?.[0]?.now ?? null,
      db_url_present: Boolean(process.env.DATABASE_URL),
      node_env: process.env.NODE_ENV,
    });
  } catch (e: any) {
    res.status(500).json({
      ok: false,
      error: e?.message ?? String(e),
      db_url_present: Boolean(process.env.DATABASE_URL),
    });
  }
}
