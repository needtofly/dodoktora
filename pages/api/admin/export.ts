// pages/api/admin/export.ts
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
  amount?: number;   // ← u nas jest amount, nie priceCents
  currency?: string; // ← i currency
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
    } catch {
      // ignorujemy i próbujemy dalej
    }
  }
  return [];
}

function esc(v: any) {
  if (v === null || v === undefined) return '""';
  const s = String(v).replace(/"/g, '""');
  return `"${s}"`;
}

function toCSV(items: Booking[]) {
  const header = [
    'id',
    'fullName',
    'email',
    'phone',
    'visitType',
    'doctor',
    'date',
    'notes',
    'address',
    'pesel',
    'noPesel',
    'amount',
    'currency',
    'status',
    'createdAt',
  ].join(',');

  const rows = items.map((b) =>
    [
      b.id ?? '',
      b.fullName ?? '',
      b.email ?? '',
      b.phone ?? '',
      b.visitType ?? '',
      b.doctor ?? '',
      b.date ?? '',
      b.notes ?? '',
      b.address ?? '',
      b.pesel ?? '',
      b.noPesel ?? '',
      b.amount ?? '',
      b.currency ?? '',
      b.status ?? '',
      b.createdAt ?? '',
    ]
      .map(esc)
      .join(',')
  );

  return [header, ...rows].join('\r\n');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const format = String(req.query.format || 'csv').toLowerCase();

  let items: Booking[] = [];

  // 1) próba z DB
  if (process.env.DATABASE_URL && prisma) {
    try {
      const model: any =
        (prisma as any).booking ??
        (prisma as any).Booking ??
        null;

      if (model) {
        const rows = await model.findMany({
          orderBy: { date: 'desc' },
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            visitType: true,
            doctor: true,
            date: true,
            notes: true,
            address: true,
            pesel: true,
            noPesel: true,
            amount: true,   // ← tu używamy amount, NIE priceCents
            currency: true,
            status: true,
            createdAt: true,
          },
        });

        items = (rows || []).map((r: any) => ({
          ...r,
          date: r.date ? new Date(r.date).toISOString() : r.date,
          createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : r.createdAt,
        }));
      }
    } catch (e: any) {
      // spadamy do fallbacku
      // console.warn('[export] DB error, using JSON fallback:', e?.message || e);
    }
  }

  // 2) fallback JSON
  if (!items.length) items = readFallbackJson();

  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).send(JSON.stringify(items));
  }

  const csv = toCSV(items);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="bookings.csv"');
  return res.status(200).send(csv);
}
