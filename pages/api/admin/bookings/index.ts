// pages/api/admin/bookings/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'node:fs';
import path from 'node:path';

let prisma: any = null;
try {
  const { prisma: p } = require('@/lib/prisma');
  prisma = p;
} catch {
  prisma = null;
}

type Booking = {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  visitType: 'Teleporada' | 'Wizyta domowa';
  doctor: string;
  date: string; // ISO
  notes?: string;
  address?: string;
  pesel?: string;
  noPesel?: boolean;
  amount?: number;
  currency?: string;
  status?: string;
  createdAt?: string;
};

function readFallbackJson(): Booking[] {
  const files = [
    path.join(process.cwd(), 'data', 'appointments.json'),
    path.join(process.cwd(), 'appointments.json'),
  ];
  for (const fp of files) {
    try {
      if (fs.existsSync(fp)) {
        const raw = fs.readFileSync(fp, 'utf8');
        const json = JSON.parse(raw);
        if (Array.isArray(json)) return json as Booking[];
        if (Array.isArray(json?.items)) return json.items as Booking[];
      }
    } catch {}
  }
  return [];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  // Jeśli mamy DB skonfigurowaną – próbujemy i zwracamy błąd, gdy się nie uda,
  // żeby nie mylić panelu pustą listą.
  if (process.env.DATABASE_URL) {
    if (!prisma || !prisma.booking?.findMany) {
      return res.status(500).json({ ok: false, error: 'Brak Prisma lub modelu Booking' });
    }
    try {
      const rows = await prisma.booking.findMany({
        orderBy: { date: 'desc' },
      });
      const items = (rows || []).map((r: any) => ({
        ...r,
        date: r.date ? new Date(r.date).toISOString() : r.date,
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : r.createdAt,
      }));
      return res.status(200).json({ ok: true, items, source: 'db' });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: e?.message || 'Błąd zapytania do DB' });
    }
  }

  // Bez DB – fallback JSON
  const items = readFallbackJson();
  return res.status(200).json({ ok: true, items, source: 'json' });
}
