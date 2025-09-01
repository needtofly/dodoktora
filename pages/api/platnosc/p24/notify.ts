import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * Minimalny webhook notify P24 na czas sandboxu.
 * Zwraca 200 OK i niczego nie prerenderuje (jest w pages/api).
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // P24 woła ten endpoint POST-em; ale w sandboxie akceptujemy wszystko „no-op”.
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(200).json({ ok: true })
  }

  try {
    // jeśli potrzebne: const payload = req.body
    // TODO: po włączeniu prawdziwego P24, tu dodamy weryfikację i update statusu.
    return res.status(200).json({ ok: true })
  } catch {
    // Aby nie zatrzymać płatności sandboxowej, i tak zwracamy 200.
    return res.status(200).json({ ok: true })
  }
}
