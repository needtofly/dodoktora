import type { Metadata } from 'next'
import Link from 'next/link'
import { categories } from '@/lib/categories'
import JsonLd from '@/components/JsonLd'
import Breadcrumbs from '@/components/Breadcrumbs'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Kategorie artykułów',
  description: 'Przeglądaj artykuły medyczne według kategorii: kardiologia, diabetologia, laryngologia, urologia, neurologia.',
  alternates: { canonical: '/artykuly/kategorie' },
  openGraph: { url: '/artykuly/kategorie' }
}

export default function CategoriesPage() {
  const BASE = 'https://dodoktora.co'
  const breadcrumbsJsonLd = {
    "@context":"https://schema.org","@type":"BreadcrumbList",
    itemListElement:[
      { "@type":"ListItem", position:1, name:"Strona główna", item:BASE },
      { "@type":"ListItem", position:2, name:"Artykuły", item:`${BASE}/artykuly` },
      { "@type":"ListItem", position:3, name:"Kategorie", item:`${BASE}/artykuly/kategorie` }
    ]
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <JsonLd data={breadcrumbsJsonLd} />
      <Breadcrumbs items={[{label:'Strona główna', href:'/'},{label:'Artykuły', href:'/artykuly'},{label:'Kategorie'}]} />

      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Kategorie artykułów</h1>
        <p className="text-gray-600 mt-2">Wybierz dział tematyczny i czytaj szczegółowe poradniki medyczne.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map(cat => (
          <article key={cat.slug} className="card p-6 flex flex-col">
            <h2 className="text-xl font-semibold mb-2">{cat.name}</h2>
            <p className="text-gray-700 flex-1">{cat.shortDescription}</p>
            <div className="mt-4">
              <Link href={`/artykuly/kategoria/${cat.slug}`} className="btn btn-primary">Zobacz artykuły</Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
