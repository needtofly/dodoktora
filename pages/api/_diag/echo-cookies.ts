import type { NextApiRequest, NextApiResponse } from 'next'
import { parse as parseCookie } from 'cookie'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = parseCookie(req.headers.cookie || '')
  res.status(200).json({
    host: req.headers.host,
    admin_auth: cookies.admin_auth ?? null,
    all: Object.keys(cookies), // nie zwracamy wartości wrażliwych
  })
}
