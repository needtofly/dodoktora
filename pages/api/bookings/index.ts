// pages/api/bookings/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

type Ok = { ok: true; id: string; redirectUrl: string };
type Err = { ok: false; error: string };

const PRICES = {
  Teleporada: 4900,     // 49 zł
  'Wizyta domowa': 35000, // 350 zł
} as const;

function isValidIsoDate(s: string) {
  const d = new Date(s);
  return !isNaN(d.getTime());
}

// prosta walidacja PESEL (11 cyfr) – można rozszerzyć o checksum
function isPesel(s: string) {
  return /^\d{11}$/.test(s);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Ok | Err>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const {
      fullName,
      email,
      phone,
      visitType,
      doctor,
      date, // ISO
      address, // legacy złożony ("Ulica 1, 00-000 Miasto")
      addressLine1,
      addressLine2,
      city,
      postalCode,
      pesel,
      noPesel,
    } = req.body ?? {};

    // Walidacje bazowe
    if (!fullName?.trim()) return res.status(400).json({ ok: false, error: 'Podaj imię i nazwisko.' });
    if (!email?.trim()) return res.status(400).json({ ok: false, error: 'Podaj e-mail.' });
    if (!phone?.trim()) return res.status(400).json({ ok: false, error: 'Podaj numer telefonu.' });

    if (visitType !== 'Teleporada' && visitType !== 'Wizyta domowa') {
      return res.status(400).json({ ok: false, error: 'Nieprawidłowy rodzaj wizyty.' });
    }

    if (!isValidIsoDate(date)) return res.status(400).json({ ok: false, error: 'Nieprawidłowa data.' });
    const when = new Date(date);
    if (when.getTime() <= Date.now()) return res.status(400).json({ ok: false, error: 'Termin musi być w przyszłości.' });

    if (visitType === 'Wizyta domowa') {
      if (!addressLine1?.trim()) return res.status(400).json({ ok: false, error: 'Podaj ulicę i numer.' });
      if (!/^\d{2}-\d{3}$/.test(String(postalCode))) return res.status(400).json({ ok: false, error: 'Kod pocztowy w formacie 00-000.' });
      if (!city?.trim()) return res.status(400).json({ ok: false, error: 'Podaj miasto.' });
    }

    if (!noPesel) {
      if (!isPesel(String(pesel))) return res.status(400).json({ ok: false, error: 'PESEL musi mieć 11 cyfr.' });
    }

    const priceCents = PRICES[visitType as 'Teleporada' | 'Wizyta domowa'];
    const currency = 'PLN';

    // (opcjonalny) konflikt tylko dla teleporad: ten sam timestamp
    if (visitType === 'Teleporada') {
      const conflict = await prisma.booking.findFirst({
        where: {
          date: when,
          visitType: { contains: 'Teleporada', mode: 'insensitive' },
        },
        select: { id: true },
      });
      if (conflict) {
        return res.status(409).json({ ok: false, error: 'Ten termin jest już zajęty. Wybierz inną godzinę.' });
      }
    }

    const created = await prisma.booking.create({
      data: {
        fullName: String(fullName).trim(),
        email: String(email).trim(),
        phone: String(phone).trim(),
        visitType,
        doctor: doctor || null,
        date: when,
        // adres – nowe pola + legacy złożony (dla zgodności z istniejącymi miejscami użycia)
        address: address ?? (visitType === 'Wizyta domowa'
          ? `${String(addressLine1).trim()}, ${String(postalCode).trim()} ${String(city).trim()}`
          : null),
        addressLine1: visitType === 'Wizyta domowa' ? String(addressLine1).trim() : null,
        addressLine2: visitType === 'Wizyta domowa' ? (addressLine2 ? String(addressLine2).trim() : null) : null,
        city: visitType === 'Wizyta domowa' ? String(city).trim() : null,
        postalCode: visitType === 'Wizyta domowa' ? String(postalCode).trim() : null,

        pesel: !noPesel ? String(pesel) : null,
        noPesel: Boolean(noPesel),

        priceCents,
        currency,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
      },
      select: { id: true },
    });

    // TODO: tu możesz wpiąć kreację transakcji P24 i zwrócić faktyczny redirect
    const redirectUrl = '/platnosc/p24/mock';

    return res.status(200).json({ ok: true, id: created.id, redirectUrl });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message ?? 'Server error' });
  }
}
