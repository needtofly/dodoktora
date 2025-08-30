import { NextResponse } from 'next/server'

export async function GET() {
  const base = 'https://dodoktora.co'
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${base}/sitemap-static.xml</loc></sitemap>
  <sitemap><loc>${base}/sitemap-posts.xml</loc></sitemap>
</sitemapindex>`
  return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' }})
}
