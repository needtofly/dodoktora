// pages/api/auth/logout.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import * as Cookie from 'cookie'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
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
    maxAge: 0,
  }

  const c1 = Cookie.serialize(name, '', common)
  const c2 = !cookieDomain ? null : Cookie.serialize(name, '', { ...common, domain: cookieDomain })

  res.setHeader('Set-Cookie', c2 ? [c1, c2] : [c1])
  return res.status(200).json({ ok: true })
}
