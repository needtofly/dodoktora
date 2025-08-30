import Image from 'next/image'
import JsonLd from '@/components/JsonLd'

export const dynamic = 'force-static'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const NAME = process.env.BUSINESS_NAME || 'dodoktora.co'

const services = [
  {
    category: "Konsultacje online",
    items: [
      {
        title: "Teleporada",
        price: 49,
        desc: "Szybka konsultacja wideo/telefoniczna z lekarzem.",
        img: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=1200&q=80&auto=format",
        href: "/?type=Teleporada#umow",
        cta: "Umów teleporadę",
        sku: "TEL-49"
      },
    ]
  },
  {
    category: "Wizyty domowe",
    items: [
      {
        title: "Wizyta domowa",
        price: 350,
        desc: "Lekarz przyjedzie do pacjenta pod wskazany adres.",
        img: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1200&q=80&auto=format",
        href: "/?type=Wizyta%20domowa#umow",
        cta: "Umów wizytę domową",
        sku: "DOM-350"
      },
    ]
  }
]

export default function ServicesPage(){
  // Breadcrumbs
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Strona główna", item: APP_URL },
      { "@type": "ListItem", position: 2, name: "Usługi", item: `${APP_URL}/uslugi` }
    ]
  }

  // WebPage
  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Usługi i cennik",
    "url": `${APP_URL}/uslugi`,
    "about": { "@id": `${APP_URL}#medical-business` }
  }

  // OfferCatalog
  const offerCatalog = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    "@id": `${APP_URL}/uslugi#oferty`,
    "name": `Oferta usług — ${NAME}`,
    "url": `${APP_URL}/uslugi`,
    "itemListElement": services.flatMap((cat, idxC) => {
      return cat.items.map((it, idxI) => ({
        "@type": "Offer",
        "position": idxI + 1,
        "sku": it.sku,
        "priceCurrency": "PLN",
        "price": String(it.price),
        "availability": "https://schema.org/InStock",
        "url": `${APP_URL}${it.href}`,
        "itemOffered": {
          "@type": "Service",
          "name": it.title,
          "description": it.desc,
          "serviceType": it.title
        }
      }))
    })
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <JsonLd data={breadcrumbs} />
      <JsonLd data={webPage} />
      <JsonLd data={offerCatalog} />

      <h1 className="text-3xl font-bold mb-8 text-center">Usługi i cennik</h1>

      {services.map((cat, idx) => (
        <section key={idx} className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">{cat.category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cat.items.map((s, i) => (
              <article key={i} className="card p-4 group">
                <div className="relative w-full h-48 mb-4">
                  <Image src={s.img} alt={s.title} fill className="rounded-xl object-cover group-hover:scale-105 transition" />
                </div>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold">{s.title}</h3>
                  <div className="text-lg font-semibold">{s.price.toFixed(0)} zł</div>
                </div>
                <p className="text-gray-600 mt-2">{s.desc}</p>
                <a href={s.href} className="btn btn-primary mt-4">{s.cta}</a>
              </article>
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
