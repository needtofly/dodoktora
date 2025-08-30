import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest){
  const sig = req.headers.get('stripe-signature') as string
  const secret = process.env.STRIPE_WEBHOOK_SECRET!
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

  const text = await req.text()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(text, sig, secret)
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const bookingId = (session.metadata?.bookingId) as string | undefined

    if (bookingId) {
      await prisma.booking.update({ where: { id: bookingId }, data: { status: 'PAID', stripePaymentId: session.payment_intent as string } })

      // opcjonalnie: e‑mail potwierdzający
      const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
      if (booking && process.env.SMTP_HOST) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: false,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        })
        const when = booking.date.toLocaleString('pl-PL')
        await transporter.sendMail({
          from: process.env.FROM_EMAIL,
          to: booking.email,
          subject: 'Potwierdzenie wizyty — Przychodnia Telemed',
          text: `Dziękujemy za opłacenie wizyty. Termin: ${when}. Do zobaczenia!`
        })
        if (process.env.RECEPCJA_EMAIL) {
          await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to: process.env.RECEPCJA_EMAIL,
            subject: `Nowa wizyta (opłacona) — ${booking.fullName}`,
            text: `Typ: ${booking.visitType} | Data: ${when} | Tel: ${booking.phone}`
          })
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}