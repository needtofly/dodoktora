import type { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import Link from 'next/link'

const BASE = 'https://dodoktora.co'

export const metadata: Metadata = {
  title: 'Wizyta domowa — 350 zł',
  description: 'Lekarska wizyta domowa u dorosłych pacjentów — 350 zł. Umów termin online.',
  alternates: { canonical: '/uslugi/wizyta-domowa' },
  openGraph: { url: '/uslugi/wizyta-domowa' }
}

export default function WizytaDomowaPage() {
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalTherapy',
    name: 'Wizyta domowa',
    url: `${BASE}/uslugi/wizyta-domowa`,
    offers: {
      '@type': 'Offer',
      price: '350.00',
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
        name: 'Wizyta domowa',
        item: `${BASE}/uslugi/wizyta-domowa`
      }
    ]
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      {/* JSON-LD: usługa + breadcrumbs */}
      <JsonLd data={serviceJsonLd} />
      <JsonLd data={breadcrumbsJsonLd} />

      <h1 className="text-4xl font-bold tracking-tight mb-4">Wizyta domowa — 350 zł</h1>
      <p className="text-gray-700 mb-6">
        Wizyta domowa u dorosłych pacjentów. Rezerwacja online, płatność z góry. W tym samym terminie mogą odbywać się też inne wizyty (nie blokujemy slotów).
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Zakres</h2>
      <ul className="list-disc pl-6 text-gray-700 space-y-2">
        <li>Badanie fizykalne, wywiad, recepty i zalecenia.</li>
        <li>W razie potrzeby skie
