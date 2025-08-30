import { NextResponse } from 'next/server'
import { getAllPosts } from '@/lib/posts'

export const dynamic = 'force-static'

export async function GET() {
  const posts = getAllPosts()
  const items = posts.map(p => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>https://dodoktora.co/artykuly/${p.slug}</link>
      <guid>https://dodoktora.co/artykuly/${p.slug}</guid>
      <pubDate>${new Date(p.datePublished).toUTCString()}</pubDate>
      <description><![CDATA[${p.description}]]></description>
    </item>`).join('')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0"><channel>
    <title>dodoktora.co — Artykuły</title>
    <link>https://dodoktora.co/artykuly</link>
    <description>Poradniki medyczne</description>
    ${items}
  </channel></rss>`
  return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' }})
}
