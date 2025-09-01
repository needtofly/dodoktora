import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: '' }))
  const ok = password && process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD
  if (!ok) {
    return NextResponse.json({ error: 'Nieprawidłowe hasło' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_auth', 'ok', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8, // 8h
  })
  return res
}
