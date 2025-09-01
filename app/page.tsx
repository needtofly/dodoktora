import Image from 'next/image'
import BookingForm from '@/components/BookingForm'
import JsonLd from '@/components/JsonLd'
import { Suspense } from 'react'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const NAME = process.env.BUSINESS_NAME || 'dodoktora.co'
const ADDRESS = process.env.BUSINESS_ADDRESS || '—'
const EMAIL = process.env.BUSINESS_EMAIL || '—'
const PHONE = process.env.BUSINESS_PHONE || '—'
const NIP = process.env.BUSINESS_NIP || ''

const staff = [
  {
    name: "Dr. Jan Sowa",
    role: "Lekarz",
    img: "https://picsum.photos/seed/jan-sowa/300/300"
  },
];

const services = [
  {
    title: "Teleporada — 49 zł",
    type: "Teleporada",
    btn: "Umów teleporadę",
    img: "https://picsum.photos/seed/service-teleporada/1200/800"
  },
  {
    title: "Wizyta domowa — 350 zł",
    type: "Wizyta domowa",
    btn: "Umów wizytę domową",
    img: "https://picsum.photos/seed/service-domowa/1200/800"
  },
] as const;

export default function HomePage() {
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Strona główna", item: APP_URL }
    ]
  };

  // Główna wizytówka firmy (MedicalBusiness)
  const businessJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": `${APP_URL}#medical-business`,
    "name": NAME,
    "url": APP_URL,
    "image": `${APP_URL}/logo-dodoktora.png`,
    "telephone": PHONE,
    "email": EMAIL,
    "priceRange": "PLN",
    "foundingDate": "2024",
    "areaServed": { "@type": "Country", "name": "PL" },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": ADDRESS,
      "addressCountry": "PL"
    },
    "identifier": NIP ? [{ "@type": "PropertyValue", "name": "NIP", "value": NIP }] : undefined,
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"
        ],
        "opens": "07:00",
        "closes": "22:00"
      }
    ],
    "medicalSpecialty": ["PrimaryCare"],
    "makesOffer": [
      {
        "@type": "Offer",
        "priceCurrency": "PLN",
        "price": "49",
        "itemOffered": {
          "@type": "Service",
          "name": "Teleporada",
          "serviceType": "Telemedicine consultation",
          "areaServed": "PL"
        },
        "availability": "https://schema.org/InStock",
        "url": `${APP_URL}/?type=Teleporada#umow`
      },
      {
        "@type": "Offer",
        "priceCurrency": "PLN",
        "price": "350",
        "itemOffered": {
          "@type": "Service",
          "name": "Wizyta domowa",
          "serviceType": "Home visit",
          "areaServed": "PL"
        },
        "availability": "https://schema.org/InStock",
        "url": `${APP_URL}/?type=Wizyta%20domowa#umow`
      }
    ]
  };

  return (
    <main>
      {/* JSON-LD */}
      <JsonLd data={breadcrumbsJsonLd} />
      <JsonLd data={businessJsonLd} />

      {/* Hero */}
      <section className="text-center py-24 bg-gradient-to-b from-blue-50 to-transparent">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          Twoje zdrowie – nasza troska
        </h1>
        <p className="text-lg max-w-xl mx-auto text-gray-600">
          Profesjonalna opieka medyczna dla pacjentów dorosłych.
        </p>
        <div className="mt-8">
          <a href="/#umow" className="btn btn-primary">Umów wizytę</a>
        </div>
      </section>

      {/* Formularz */}
      <section id="umow" className="max-w-3xl mx-auto px-4 scroll-mt-28">
        <h2 className="text-3xl font-bold mb-6 text-center">Umów wizytę</h2>
        <Suspense fallback={<div className="text-center py-10">Ładowanie formularza…</div>}>
          <BookingForm />
        </Suspense>
      </section>

      {/* Lekarze */}
      <section id="lekarze" className="max-w-6xl mx-auto px-4 py-16 scroll-mt-28">
        <h2 className="text-3xl font-bold mb-8 text-center">Lekarze</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {staff.map((p, i) => (
            <div key={i} className="card p-6 text-center group">
              <div className="relative w-40 h-40 mx-auto mb-4">
                <Image
                  src={p.img}
                  alt={p.name}
                  fill
                  className="rounded-full object-cover group-hover:scale-105 transition"
                />
              </div>
              <h3 className="text-xl font-semibold group-hover:text-blue-700 transition">
                {p.name}
              </h3>
              <p className="text-gray-600">{p.role}</p>
              <a
                href={`/?doctor=${encodeURIComponent(p.name)}#umow`}
                className="btn btn-primary mt-4"
              >
                Umów wizytę u {p.name.split(" ")[1]}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Usługi */}
      <section id="uslugi" className="max-w-6xl mx-auto px-4 pb-20 scroll-mt-28">
        <h2 className="text-3xl font-bold mb-8 text-center">Usługi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((s, i) => (
            <div key={i} className="card p-4 text-center group">
              <div className="relative w-full h-48 mb-4">
                <Image
                  src={s.img}
                  alt={s.title}
                  fill
                  className="rounded-xl object-cover group-hover:scale-105 transition"
                />
              </div>
              <h3 className="font-semibold text-lg group-hover:text-blue-700 transition">
                {s.title}
              </h3>
              <a
                href={`/?type=${encodeURIComponent(s.type)}#umow`}
                className="btn btn-primary mt-4"
              >
                {s.btn}
              </a>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
