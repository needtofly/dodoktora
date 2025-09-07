// pages/api/_diag/env.ts
import type { NextApiRequest, NextApiResponse } from 'next'

function mask(v?: string | null) {
  if (!v) return null
  // pokażemy tylko protokół i host bez wrażliwych danych
  try {
    const u = new URL(v)
    return {
      protocol: u.protocol,              // oczekujemy "postgresql:" lub "postgres:"
      host: u.host,                      // host:port
      pathname: u.pathname,              // /nazwa_bazy
      // NIE pokazujemy usera/hasła
    }
  } catch {
    // nie parsuje się jako URL — zwróćmy pierwsze 20 znaków do podpowiedzi
    return { rawPrefix: v.slice(0, 20) }
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = process.env.DATABASE_URL || ''
  const direct = process.env.DIRECT_URL || ''
  const protoOk =
    db.startsWith('postgresql://') || db.startsWith('postgres://')

  res.status(200).json({
    hasDatabaseUrl: !!db,
    hasDirectUrl: !!direct,
    databaseParsed: mask(db),
    directParsed: mask(direct),
    protocolOk: protoOk,
    hint:
      !protoOk
        ? 'DATABASE_URL musi zaczynać się od postgresql:// lub postgres:// (bez cudzysłowów).'
        : 'Wygląda dobrze. Jeśli dalej są błędy, sprawdź czy to Production env w Vercel.',
  })
}
