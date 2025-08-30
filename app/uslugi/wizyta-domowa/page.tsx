import type { Metadata } from 'next'
import Image from 'next/image'
import JsonLd from '@/components/JsonLd'
import Breadcrumbs from '@/components/Breadcrumbs'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Wizyta domowa — dodoktora.co',
  description: 'Lekarz przyjedzie do pacjenta pod wskazany adres. Cena 350 zł. Umów wizytę domową online.',
}

export default function WizytaDomowaPage() {
  // JSON-LD: opis usługi
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Wizyta domowa",
    "serviceType": "Home visit",
    "provider": { "@type": "MedicalBusiness", "name": "dodoktora.co", "url": BASE },
    "areaServed": "PL",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "PLN",
      "price": "350",
      "availability": "https://schema.org/InStock",
      "url": `${BASE}/uslugi/wizyta-domowa`
    }
  }

  // JSON-LD: breadcrumbs
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", position: 1, name: "Strona główna", item: BASE },
      { "@type": "ListItem", position: 2, name: "Usługi", item: `${BASE}/uslugi` },
      { "@type": "ListItem", position: 3, name: "Wizyta domowa", item: `${BASE}/uslugi/wizyta-domowa` }
    ]
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      {/* JSON-LD */}
      <JsonLd data={serviceJsonLd} />
      <JsonLd data={breadcrumbsJsonLd} />

      <Breadcrumbs
        items={[
          { label: 'Strona główna', href: '/' },
          { label: 'Usługi', href: '/uslugi' },
          { label: 'Wizyta domowa' },
        ]}
      />

      <header className="mb-6">
        <h1 className="text-3xl font-bold">Wizyta domowa — 350 zł</h1>
        <p className="text-gray-600 mt-2">
          Lekarz przyjedzie do pacjenta pod wskazany adres. Badanie, zalecenia, recepty.
        </p>
      </header>

      <div className="relative w-full h-56 mb-6">
        <Image
          src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1200&q=80&auto=format"
          alt="Wizyta domowa"
          fill
          className="rounded-xl object-cover"
        />
      </div>

      <section className="prose prose-gray max-w-none">
        <h2>Zakres wizyty</h2>
        <ul>
          <li>Badanie podmiotowe i przedmiotowe</li>
          <li>Zalecenia terapeutyczne</li>
          <li>Wystawienie e-recepty / e-skierowania (jeśli wskazane)</li>
        </ul>

        <h2>Jak umówić?</h2>
        <p>
          Skorzystaj z formularza rezerwacji — wybierz <strong>Wizyta domowa</strong>, uzupełnij
          dane oraz <strong>adres wizyty</strong>, a następnie wybierz termin.
        </p>
      </section>

      <div className="mt-8">
        <a href="/?type=Wizyta%20domowa#umow" className="btn btn-primary">
          Umów wizytę domową
        </a>
      </div>
    </main>
  )
}
