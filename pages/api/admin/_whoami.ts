// pages/api/admin/_whoami.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import * as Cookie from 'cookie'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const parsed = Cookie.parse(req.headers.cookie || '')
  const name = process.env.ADMIN_COOKIE_NAME || 'admin_auth'
  res.status(200).json({
    host: req.headers.host || null,
    cookieNameExpected: name,
    cookieSeenValue: parsed[name] ?? null,
    rawCookieKeys: Object.keys(parsed),
    authed: parsed[name] === 'ok',
  })
}
