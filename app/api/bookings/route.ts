import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { p24RegisterTransaction } from '@/lib/p24'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type VisitType = 'Teleporada' | 'Wizyta domowa'

async function parseBody(req: Request) {
  const ct = req.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    const b = await req.json().catch(() => ({}))
    return b as any
  }
  const fd = await req.formData()
  const obj: any = {}
  fd.forEach((v, k) => { obj[k] = String(v) })
  return obj
}

export async function POST(req: Request) {
  try {
    const body = await parseBody(req)

    const fullName = String(body.fullName || '')
    const email = String(body.email || '')
    const phone = String(body.phone || '')
    const visitType = (body.visitType as VisitType) || 'Teleporada'
    const doctor = body.doctor ? String(body.doctor) : undefined
    const dateStr = String(body.date || '')
    const notes = body.notes ? String(body.notes) : ''
    const address = body.address ? String(body.address) : undefined
    const pesel = body.pesel ? String(body.pesel) : undefined
    const noPesel = String(body.noPesel || '').toLowerCase() === 'true'

    if (!fullName || !email || !phone || !visitType || !dateStr) {
      return NextResponse.json({ error: 'Brak wymaganych pól' }, { status: 400 })
    }

    const dt = new Date(dateStr)
    if (isNaN(dt.getTime())) {
      return NextResponse.json({ error: 'Nieprawidłowa data' }, { status: 400 })
    }
    if (dt.getTime() <= Date.now()) {
      return NextResponse.json({ error: 'Nie można rezerwować terminu w przeszłości.' }, { status: 400 })
    }

    const minutes = dt.getUTCMinutes()
    if (minutes % 10 !== 0) {
      return NextResponse.json({ error: 'Wybierz pełne 10 minut (…:00,10,20,30,40,50).' }, { status: 400 })
    }
    const hour = dt.getUTCHours()
    if (hour < 7 || hour >= 22) {
      return NextResponse.json({ error: 'Rezerwacje możliwe w godzinach 07:00–22:00.' }, { status: 400 })
    }

    // Adres dla wizyty domowej obowiązkowy
    let finalNotes = notes
    if (visitType === 'Wizyta domowa') {
      if (!address || !address.trim()) {
        return NextResponse.json({ error: 'Adres wizyty domowej jest wymagany.' }, { status: 400 })
      }
      finalNotes = `Adres wizyty domowej: ${address.trim()}${finalNotes ? `\n\n${finalNotes}` : ''}`
    }

    // PESEL wymagany dla obu typów, o ile nie zaznaczono "nie mam" (sprawdzamy wyłącznie 11 cyfr)
    let peselToSave: string | undefined = undefined
    if (!noPesel) {
      if (!pesel || !/^\d{11}$/.test(pesel)) {
        return NextResponse.json({ error: 'PESEL musi składać się z 11 cyfr.' }, { status: 400 })
      }
      peselToSave = pesel
    }

    const priceCents = visitType === 'Teleporada' ? 4900 : 35000

    // Blokowanie slotów tylko dla teleporad
    if (visitType === 'Teleporada') {
      const conflict = await prisma.booking.findFirst({
        where: { date: dt, visitType: 'Teleporada', status: { in: ['PENDING', 'PAID'] } },
        select: { id: true },
      })
      if (conflict) {
        return NextResponse.json({ error: 'Ten termin jest już zajęty. Wybierz inny.' }, { status: 409 })
      }
    }

    const booking = await prisma.booking.create({
      data: {
        fullName,
        email,
        phone,
        visitType,
        doctor,
        date: dt,
        notes: finalNotes,
        status: 'PENDING',
        priceCents,
        pesel: peselToSave,
      },
    })

    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const { redirectUrl } = await p24RegisterTransaction({
      sessionId: booking.id,
      amount: priceCents,
      email,
      description: `${visitType} – ${doctor || 'lekarz'} – ${booking.fullName}`,
      urlReturn: `${APP_URL}/platnosc/p24/return?bookingId=${booking.id}`,
      urlStatus: `${APP_URL}/api/payments/p24/notify`,
      client: fullName,
    })

    const wantsHtmlRedirect =
      !(req.headers.get('content-type') || '').includes('application/json')

    if (wantsHtmlRedirect) {
      return NextResponse.redirect(redirectUrl, 303)
    }

    return NextResponse.json({ ok: true, bookingId: booking.id, redirectUrl })
  } catch (e) {
    console.error('[BOOKINGS POST] error:', e)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
