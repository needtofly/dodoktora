import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export async function POST(req: NextRequest){
  const { bookingId } = await req.json()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
  if (!booking) return NextResponse.json({ error: 'Brak rezerwacji' }, { status: 404 })

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card', 'p24'],
    locale: 'pl',
    line_items: [{
      price_data: {
        currency: 'pln',
        unit_amount: booking.priceCents,
        product_data: {
          name: `${booking.visitType}${booking.doctor ? ' — ' + booking.doctor : ''}`,
          description: `Wizyta: ${booking.date.toLocaleString('pl-PL')}`
        }
      },
      quantity: 1
    }],
    success_url: `${appUrl}/success`,
    cancel_url: `${appUrl}/cancel`,
    metadata: { bookingId: booking.id }
  })

  await prisma.booking.update({ where: { id: booking.id }, data: { stripeSessionId: session.id } })

  return NextResponse.json({ url: session.url })
}