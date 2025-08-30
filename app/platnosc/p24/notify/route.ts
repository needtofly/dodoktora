import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { p24VerifyTransaction } from '@/lib/p24'

export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => ({} as any))

    // P24 wysyła: sessionId, amount, currency, orderId, merchantId, posId, sign...
    const sessionId: string | undefined = payload?.sessionId
    const amount = Number(payload?.amount)
    const orderId = Number(payload?.orderId)
    const currency = (payload?.currency as string) || 'PLN'

    if (!sessionId || !amount || !orderId) {
      console.warn('[P24 notify] Brak wymaganych pól', payload)
      return NextResponse.json({ ok: true }) // odpowiadamy 200, by uniknąć powtórek
    }

    // Weryfikujemy transakcję po stronie P24
    await p24VerifyTransaction({ sessionId, orderId, amount, currency })

    // Jeśli weryfikacja ok — oznaczamy rezerwację jako PAID
    await prisma.booking
      .update({
        where: { id: sessionId },
        data: { status: 'PAID' },
      })
      .catch(() => null)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[P24 notify ERROR]', e)
    // Zwracamy 200 — P24 i tak ponowi w razie błędu; nie chcemy pętli.
    return NextResponse.json({ ok: true })
  }
}
