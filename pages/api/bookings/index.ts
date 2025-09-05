// pages/api/bookings/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';

let prisma: any = null;
try {
  const { prisma: p } = require('@/lib/prisma');
  prisma = p;
} catch {
  prisma = null;
}

type VisitType = 'Teleporada' | 'Wizyta domowa';

function genId() {
  try { return crypto.randomUUID(); } catch {}
  return 'b_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const body = (req.body || {}) as {
      fullName?: string;
      email?: string;
      phone?: string;
      visitType?: VisitType;
      doctor?: string;
      date?: string; // ISO
      notes?: string;
      address?: string;
      pesel?: string;
      noPesel?: boolean;
    };

    const required = ['fullName', 'email', 'phone', 'visitType', 'doctor', 'date'] as const;
    for (const k of required) {
      if (!body[k]) return res.status(400).json({ ok: false, error: `Brak pola: ${k}` });
    }

    const amount = body.visitType === 'Wizyta domowa' ? 350 : 49;

    const data: any = {
      fullName: body.fullName!,
      email: body.email!,
      phone: body.phone!,
      visitType: body.visitType!,
      doctor: body.doctor!,
      date: new Date(body.date!),
      notes: body.notes || null,
      address: body.visitType === 'Wizyta domowa' ? (body.address || null) : null,
      pesel: body.noPesel ? null : (body.pesel || null),
      noPesel: !!body.noPesel,
      amount,
      currency: 'PLN',
      status: 'PENDING',
      createdAt: new Date(),
    };

    let bookingId = genId();
    let dbSaved = false;
    let dbError: string | undefined;

    if (process.env.DATABASE_URL && prisma && prisma.booking?.create) {
      try {
        const rec = await prisma.booking.create({ data });
        bookingId = rec?.id || bookingId;
        dbSaved = true;
      } catch (e: any) {
        dbError = e?.message || String(e);
        console.warn('[POST /api/bookings] DB save failed:', dbError);
      }
    } else {
      dbError = !process.env.DATABASE_URL
        ? 'Missing DATABASE_URL'
        : !prisma
        ? 'No Prisma client'
        : 'Model prisma.booking missing';
    }

    const qs = new URLSearchParams({
      id: bookingId,
      bookingId,
      amount: amount.toFixed(2),
      currency: 'PLN',
    });
    const redirectUrl = `/platnosc/p24/mock?${qs.toString()}`;

    return res.status(200).json({
      ok: true,
      bookingId,
      amount,
      currency: 'PLN',
      redirectUrl,
      dbSaved,
      ...(dbError ? { dbError } : {}),
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'Server error' });
  }
}
