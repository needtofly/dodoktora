import type { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import Link from 'next/link'

const BASE = 'https://dodoktora.co'

export const metadata: Metadata = {
  title: 'Teleporada — 49 zł',
  description: 'Szybka teleporada online u Dr. Jana Sowy — już od 49 zł. Umów termin w godzinach 07:00–22:00.',
  alternates: { canonical: '/uslugi/teleporada' },
  openGraph: { url: '/uslugi/teleporada' }
}

export default function TeleporadaPage() {
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalTherapy',
    name: 'Teleporada',
    url: `${BASE}/uslugi/teleporada`,
    offers: {
      '@type': 'Offer',
      price: '49.00',
      priceCurrency: 'PLN',
      availability: 'https://schema.org/InStock'
    },
    provider: {
      '@type': 'MedicalClinic',
      name: 'dodoktora.co',
      url: BASE
    }
  }

  const breadcrumbsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Strona główna',
        item: BASE
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Usługi',
        item: `${BASE}/#uslugi`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Teleporada',
        item: `${BASE}/uslugi/teleporada`
      }
    ]
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      {/* JSON-LD: usługa + breadcrumbs */}
      <JsonLd data={serviceJsonLd} />
      <JsonLd data={breadcrumbsJsonLd} />

      <h1 className="text-4xl font-bold tracking-tight mb-4">Teleporada — 49 zł</h1>
      <p className="text-gray-700 mb-6">
        Teleporada to szybka konsultacja online z lekarzem. Dostępna codziennie w godzinach 07:00–22:00.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Jak to działa?</h2>
      <ul className="list-disc pl-6 text-gray-700 space-y-2">
        <li>Wybierz termin (co 10 minut) i wypełnij formularz.</li>
        <li>Opłać wizytę online.</li>
        <li>Otrzymasz link do połączenia lub telefon od lekarza.</li>
      </ul>

      <div className="mt-8">
        <Link href="/?type=Teleporada#umow" className="btn btn-primary">Umów teleporadę</Link>
      </div>
    </main>
  )
}
