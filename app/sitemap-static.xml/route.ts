import { NextResponse } from 'next/server'

export async function GET() {
  const base = 'https://dodoktora.co'
  const now = new Date().toISOString()
  const urls = [
    '/', '/lekarze', '/uslugi/teleporada', '/uslugi/wizyta-domowa', '/artykuly', '/artykuly/kategorie'
  ].map(u => `<url><loc>${base}${u}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`).join('')
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
  return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' }})
}
