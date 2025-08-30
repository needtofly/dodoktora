import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import Breadcrumbs from '@/components/Breadcrumbs'
import { getPostBySlug, getAllSlugs } from '@/lib/posts'

export const revalidate = 3600

type Props = { params: { slug: string } }

export function generateStaticParams() { return getAllSlugs().map(slug => ({ slug })) }

export function generateMetadata({ params }: Props): Metadata {
  const post = getPostBySlug(params.slug)
  if (!post) return { title: 'Artykuł' }
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/artykuly/${post.slug}` },
    openGraph: { url: `/artykuly/${post.slug}`, title: post.title, description: post.description, images: post.cover ? [post.cover] : undefined }
  }
}

function autoLink(html: string): string {
  const parts = html.split(/(<a\b[^>]*>.*?<\/a>)/gis)
  const rules: { pattern: RegExp; href: string }[] = [
    { pattern: /\bwizyt[a-ząćęłńóśźż]*\s+domow[a-ząćęłńóśźż]*\b/gi, href: '/?type=Wizyta domowa#umow' },
    { pattern: /\bteleporad[a-ząćęłńóśźż]*\b/gi, href: '/?type=Teleporada#umow' },
    { pattern: /\bdr\.?\s*jan\s*sowa\b/gi, href: '/lekarze' },
    { pattern: /\bteleporada\b/gi, href: '/uslugi/teleporada' },
  ]
  const processed = parts.map((part) => {
    if (/^<a\b/i.test(part)) return part
    let t = part
    rules.forEach(({ pattern, href }) => { t = t.replace(pattern, (m) => `<a href="${href}">${m}</a>`) })
    return t
  })
  return processed.join('')
}

export default function ArticlePage({ params }: Props) {
  const post = getPostBySlug(params.slug)
  if (!post) return notFound()

  const BASE = 'https://dodoktora.co'
  const articleJsonLd = {
    "@context": "https://schema.org", "@type": "Article",
    "headline": post.title, "description": post.description,
    "datePublished": post.datePublished, "dateModified": post.dateModified || post.datePublished,
    "author": { "@type": "Organization", "name": "Zespół lekarski dodoktora.co" },
    "reviewer": { "@type": "Physician", "name": "Dr. Jan Sowa" },
    "publisher": { "@type": "MedicalClinic", "name": "dodoktora.co", "url": BASE },
    "mainEntityOfPage": `${BASE}/artykuly/${post.slug}`,
    "image": post.cover ? `${BASE}${post.cover}` : undefined
  }
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Strona główna", "item": BASE },
      { "@type": "ListItem", "position": 2, "name": "Artykuły", "item": `${BASE}/artykuly` },
      { "@type": "ListItem", "position": 3, "name": post.title, "item": `${BASE}/artykuly/${post.slug}` }
    ]
  }

  const linkedHtml = autoLink(post.bodyHtml)

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbsJsonLd} />
      {post.faq?.length ? (
        <JsonLd data={{
          "@context":"https://schema.org","@type":"FAQPage",
          "mainEntity": post.faq.map(f => ({ "@type":"Question","name":f.q, "acceptedAnswer":{ "@type":"Answer","text":f.a } }))
        }}/>
      ) : null}

      <Breadcrumbs items={[{label:'Strona główna', href:'/'},{label:'Artykuły', href:'/artykuly'},{label:post.title}]}/>

      <article>
        <h1 className="text-4xl font-bold tracking-tight mb-2">{post.title}</h1>
        <p className="text-gray-600 mb-4">
          {new Date(post.datePublished).toLocaleDateString('pl-PL')} • Autor: Zespół lekarski dodoktora.co • Recenzja: Dr. Jan Sowa
        </p>

        {post.tags?.length ? (
          <div className="mb-6 flex flex-wrap gap-2">
            {post.tags.map(t => (
              <Link key={t} href={`/artykuly?tag=${encodeURIComponent(t)}`} className="text-xs px-2 py-1 rounded-full border hover:border-blue-600">#{t}</Link>
            ))}
          </div>
        ) : null}

        <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: linkedHtml }} />

        {post.faq?.length ? (
          <section className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">Najczęściej zadawane pytania (FAQ)</h2>
            <div className="space-y-3">
              {post.faq.map((f, i) => (
                <details key={i} className="p-4 rounded-lg border bg-white">
                  <summary className="font-medium cursor-pointer">{f.q}</summary>
                  <p className="mt-2 text-gray-700">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-10">
          <a href="/#umow" className="btn btn-primary">Umów wizytę</a>
        </div>
      </article>
    </main>
  )
}
