import crypto from 'crypto'

const IS_SANDBOX = process.env.P24_SANDBOX === 'true'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const HAS_CREDS =
  !!process.env.P24_MERCHANT_ID &&
  !!process.env.P24_POS_ID &&
  !!process.env.P24_CRC &&
  !!process.env.P24_API_KEY

const BASE = IS_SANDBOX
  ? 'https://sandbox.przelewy24.pl'
  : 'https://secure.przelewy24.pl'

function authHeader() {
  const login = process.env.P24_MERCHANT_ID!
  const pass = process.env.P24_API_KEY!
  const token = Buffer.from(`${login}:${pass}`).toString('base64')
  return `Basic ${token}`
}

function signRegister({ sessionId, amount, currency }: { sessionId: string; amount: number; currency: string }) {
  const obj = { sessionId, merchantId: Number(process.env.P24_MERCHANT_ID), amount, currency, crc: process.env.P24_CRC! }
  return crypto.createHash('sha384').update(JSON.stringify(obj)).digest('hex')
}

function signVerify({ sessionId, orderId, amount, currency }: { sessionId: string; orderId: number; amount: number; currency: string }) {
  const obj = { sessionId, orderId, amount, currency, crc: process.env.P24_CRC! }
  return crypto.createHash('sha384').update(JSON.stringify(obj)).digest('hex')
}

export async function p24RegisterTransaction(input: {
  sessionId: string
  amount: number
  email: string
  description: string
  urlReturn: string
  urlStatus: string
  client?: string
}) {
  if (IS_SANDBOX && !HAS_CREDS) {
    const redirectUrl = `${APP_URL}/platnosc/p24/mock?bookingId=${encodeURIComponent(input.sessionId)}&amount=${encodeURIComponent(String(input.amount))}`
    return { token: 'mock', redirectUrl }
  }

  const body = {
    merchantId: Number(process.env.P24_MERCHANT_ID),
    posId: Number(process.env.P24_POS_ID),
    sessionId: input.sessionId,
    amount: input.amount,
    currency: 'PLN',
    description: input.description,
    email: input.email,
    country: 'PL',
    urlReturn: input.urlReturn,
    urlStatus: input.urlStatus,
    sign: signRegister({ sessionId: input.sessionId, amount: input.amount, currency: 'PLN' }),
  }

  const res = await fetch(`${BASE}/api/v1/transaction/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: authHeader() },
    body: JSON.stringify(body),
    // @ts-ignore
    cache: 'no-store',
  })

  const data: any = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`P24 register ${res.status}: ${JSON.stringify(data)}`)

  const token: string = data?.data?.token || data?.token
  if (!token) throw new Error('P24 register: brak tokenu')

  const redirectUrl = `${BASE}/trnRequest/${token}`
  return { token, redirectUrl }
}

export async function p24VerifyTransaction(input: { sessionId: string; orderId: number; amount: number; currency?: string }) {
  if (IS_SANDBOX && !HAS_CREDS) {
    return { data: { mock: true } }
  }

  const currency = input.currency || 'PLN'
  const body = {
    merchantId: Number(process.env.P24_MERCHANT_ID),
    posId: Number(process.env.P24_POS_ID),
    sessionId: input.sessionId,
    amount: input.amount,
    currency,
    orderId: input.orderId,
    sign: signVerify({ sessionId: input.sessionId, orderId: input.orderId, amount: input.amount, currency }),
  }

  const res = await fetch(`${BASE}/api/v1/transaction/verify`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: authHeader() },
    body: JSON.stringify(body),
    // @ts-ignore
    cache: 'no-store',
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`P24 verify ${res.status}: ${JSON.stringify(data)}`)
  return data
}
