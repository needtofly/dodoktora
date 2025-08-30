import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import Breadcrumbs from '@/components/Breadcrumbs'
import { getAllPosts } from '@/lib/posts'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Artykuły',
  description:
    'Rzetelne artykuły medyczne przygotowane i weryfikowane przez lekarza: objawy, diagnostyka, leczenie i profilaktyka. Przejrzyste sekcje, FAQ i linki do rezerwacji teleporady.',
  alternates: { canonical: '/artykuly' },
  openGraph: { url: '/artykuly' }
}

const PER_PAGE = 6

export default function ArticlesPage({
  searchParams
}: { searchParams?: { tag?: string; page?: string } }) {
  const all = getAllPosts()
  const allTags = Array.from(new Set(all.flatMap(p => p.tags))).sort((a,b)=>a.localeCompare(b,'pl'))

  const activeTag = (searchParams?.tag || '').trim()
  const filtered = activeTag ? all.filter(p => p.tags.includes(activeTag)) : all

  const total = filtered.length
  const page = Math.max(1, Number(searchParams?.page || 1) || 1)
  const pages = Math.max(1, Math.ceil(total / PER_PAGE))
  const start = (page - 1) * PER_PAGE
  const posts = filtered.slice(start, start + PER_PAGE)

  const canonical = activeTag ? `/artykuly?tag=${encodeURIComponent(activeTag)}${page>1?`&page=${page}`:''}` : `/artykuly${page>1?`?page=${page}`:''}`

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Strona główna", item: "https://dodoktora.co" },
      { "@type": "ListItem", position: 2, name: "Artykuły", item: `https://dodoktora.co${canonical}` }
    ]
  }

  const buildUrl = (p: number) => {
    const params = new URLSearchParams()
    if (activeTag) params.set('tag', activeTag)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return `/artykuly${qs ? `?${qs}` : ''}`
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <JsonLd data={breadcrumbsJsonLd} />
      <Breadcrumbs items={[{label:'Strona główna', href:'/'},{label:'Artykuły'}]} />

      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Artykuły</h1>
        <p className="text-gray-600 mt-2">
          Rzetelne artykuły medyczne przygotowane i weryfikowane przez lekarza.
        </p>
      </header>

      {/* Filtr tagów */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link href="/artykuly" className={`px-3 py-1 rounded-full border ${!activeTag ? 'bg-blue-600 text-white border-blue-600' : 'hover:border-blue-600'}`}>
          Wszystkie
        </Link>
        {allTags.map(tag => (
          <Link
            key={tag}
            href={`/artykuly?tag=${encodeURIComponent(tag)}`}
            className={`px-3 py-1 rounded-full border ${activeTag===tag ? 'bg-blue-600 text-white border-blue-600' : 'hover:border-blue-600'}`}
          >
            {tag}
          </Link>
        ))}
      </div>

      {/* Lista artykułów */}
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
                <Link key={t} href={buildUrl(1)+`${buildUrl(1).includes('?')?'&':'?'}tag=${encodeURIComponent(t)}`} className="text-xs px-2 py-1 rounded-full border hover:border-blue-600">
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

      {/* Paginacja */}
      {pages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2">
          <Link href={buildUrl(Math.max(1, page-1))} rel="prev" className={`btn ${page===1 ? 'pointer-events-none opacity-50' : ''}`}>‹ Poprzednia</Link>
          <span className="px-3 py-2 rounded border bg-white">{page} / {pages}</span>
          <Link href={buildUrl(Math.min(pages, page+1))} rel="next" className={`btn ${page===pages ? 'pointer-events-none opacity-50' : ''}`}>Następna ›</Link>
        </nav>
      )}

      <div className="mt-12 text-center">
        <Link href="/artykuly/kategorie" className="btn">Przeglądaj kategorie</Link>
      </div>
    </main>
  )
}
