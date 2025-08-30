import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { categories, getCategoryBySlug } from '@/lib/categories'
import { getPostsByCategory } from '@/lib/posts'
import JsonLd from '@/components/JsonLd'
import Breadcrumbs from '@/components/Breadcrumbs'

export const revalidate = 3600

type Props = { params: { slug: string } }

export function generateStaticParams() { return categories.map(c => ({ slug: c.slug })) }

export function generateMetadata({ params }: Props): Metadata {
  const cat = getCategoryBySlug(params.slug)
  if (!cat) return { title: 'Kategoria' }
  return {
    title: cat.name,
    description: cat.longMetaDescription,
    alternates: { canonical: `/artykuly/kategoria/${cat.slug}` },
    openGraph: { url: `/artykuly/kategoria/${cat.slug}` }
  }
}

export default function CategoryPage({ params }: Props) {
  const cat = getCategoryBySlug(params.slug)
  if (!cat) return notFound()
  const posts = getPostsByCategory(cat.slug)

  const BASE = 'https://dodoktora.co'
  const breadcrumbsJsonLd = {
    "@context":"https://schema.org","@type":"BreadcrumbList",
    itemListElement:[
      { "@type":"ListItem", position:1, name:"Strona główna", item:BASE },
      { "@type":"ListItem", position:2, name:"Artykuły", item:`${BASE}/artykuly` },
      { "@type":"ListItem", position:3, name:"Kategorie", item:`${BASE}/artykuly/kategorie` },
      { "@type":"ListItem", position:4, name:cat.name, item:`${BASE}/artykuly/kategoria/${cat.slug}` }
    ]
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <JsonLd data={breadcrumbsJsonLd} />
      <Breadcrumbs items={[
        {label:'Strona główna', href:'/'},
        {label:'Artykuły', href:'/artykuly'},
        {label:'Kategorie', href:'/artykuly/kategorie'},
        {label:cat.name},
      ]} />

      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">{cat.name}</h1>
        <p className="text-gray-600 mt-2">{cat.longMetaDescription}</p>
      </header>

      {posts.length === 0 ? (
        <p className="text-gray-700">Brak artykułów w tej kategorii.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map(post => (
            <article key={post.slug} className="card p-6 flex flex-col">
              <h2 className="text-xl font-semibold mb-2">
                <Link href={`/artykuly/${post.slug}`} className="hover:text-blue-700">
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-600 text-sm mb-2">
                {new Date(post.datePublished).toLocaleDateString('pl-PL')}
              </p>
              <p className="text-gray-700 flex-1">{post.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map(t => (
                  <Link key={t} href={`/artykuly?tag=${encodeURIComponent(t)}`} className="text-xs px-2 py-1 rounded-full border hover:border-blue-600">
                    #{t}
                  </Link>
                ))}
              </div>
              <div className="mt-4">
                <Link href={`/artykuly/${post.slug}`} className="btn btn-primary">Czytaj dalej</Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <Link href="/artykuly/kategorie" className="btn">Wróć do kategorii</Link>
      </div>
    </main>
  )
}
