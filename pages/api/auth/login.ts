// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import * as Cookie from 'cookie'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
  const password = String(body?.password || '')
  const expected = String(process.env.ADMIN_PASSWORD || '')

  if (!expected) return res.status(500).json({ error: 'Brak ADMIN_PASSWORD' })
  if (password !== expected) return res.status(401).json({ error: 'Nieprawidłowe hasło' })

  const name = process.env.ADMIN_COOKIE_NAME || 'admin_auth'
  const host = (req.headers.host || '').split(':')[0]
  const isLocal = host === 'localhost' || host === '127.0.0.1'
  const domainFromEnv = process.env.ADMIN_COOKIE_DOMAIN?.trim()
  const rootDomain = host && host.includes('.') ? host.split('.').slice(-2).join('.') : undefined
  const cookieDomain = isLocal ? undefined : (domainFromEnv || rootDomain)

  const common = {
    httpOnly: true as const,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8, // 8h
  }

  // 1) cookie na BIEŻĄCY host (brak "domain") — zawsze działa tam, gdzie się logujesz
  const c1 = Cookie.serialize(name, 'ok', common)

  // 2) drugie cookie na domenę główną (obejmuje apex + www)
  const c2 = !cookieDomain ? null : Cookie.serialize(name, 'ok', { ...common, domain: cookieDomain })

  res.setHeader('Set-Cookie', c2 ? [c1, c2] : [c1])
  return res.status(200).json({ ok: true })
}
