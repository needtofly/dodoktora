import { ImageResponse } from 'next/server'
import { getPostBySlug } from '@/lib/posts'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OG({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  const title = post?.title ?? 'Artykuł — dodoktora.co'
  return new ImageResponse(
    (
      <div style={{width:'100%',height:'100%',display:'flex',background:'linear-gradient(135deg,#e6f0ff,#ffffff)',fontFamily:'sans-serif',padding:64,color:'#0f172a'}}>
        <div style={{display:'flex',flexDirection:'column',gap:24}}>
          <div style={{fontSize:36,opacity:.8}}>dodoktora.co</div>
          <div style={{fontSize:64,fontWeight:800,lineHeight:1.1,maxWidth:900}}>
            {title.length > 100 ? title.slice(0,97)+'…' : title}
          </div>
          <div style={{marginTop:8,fontSize:28,color:'#2563eb'}}>Poradniki medyczne</div>
        </div>
      </div>
    ),
    { ...size }
  )
}
