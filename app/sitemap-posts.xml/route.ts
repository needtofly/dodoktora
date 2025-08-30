import { NextResponse } from 'next/server'
import { getAllPosts } from '@/lib/posts'

export async function GET() {
  const base = 'https://dodoktora.co'
  const posts = getAllPosts()
  const urls = posts.map(p => {
    const lm = (p.dateModified || p.datePublished)
    return `<url><loc>${base}/artykuly/${p.slug}</loc><lastmod>${new Date(lm).toISOString()}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`
  }).join('')
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
  return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' }})
}
