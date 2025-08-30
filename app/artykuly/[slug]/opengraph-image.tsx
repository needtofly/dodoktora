// app/artykuly/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og'
import { getPostBySlug } from '@/lib/posts'

export const runtime = 'edge'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }

export default async function OG({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  const title = post?.title ?? 'Artykuł — dodoktora.co'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg,#e6f0ff,#ffffff)',
          fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
          padding: 64,
          color: '#0f172a',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.2, maxWidth: 960 }}>
            {title}
          </div>
          <div style={{ fontSize: 20, opacity: 0.8 }}>dodoktora.co</div>
        </div>
      </div>
    ),
    {
      width: size.width,
      height: size.height,
    }
  )
}
