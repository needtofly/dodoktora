// pages/api/admin/export.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // cokolwiek trafi tu (np. z cache'u), przekierujemy na nowy endpoint
  res.redirect(307, '/api/admin/export-csv')
}
