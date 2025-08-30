export const dynamic = 'force-static'
import JsonLd from '@/components/JsonLd'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const NAME = process.env.BUSINESS_NAME || "dodoktora.co"
const ADDRESS = process.env.BUSINESS_ADDRESS || "—"
const EMAIL = process.env.BUSINESS_EMAIL || "—"
const NIP = process.env.BUSINESS_NIP || ""

export default function RegulaminPage() {
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Strona główna", item: APP_URL },
      { "@type": "ListItem", position: 2, name: "Regulamin", item: `${APP_URL}/regulamin` }
    ]
  }

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Regulamin świadczenia usług",
    "url": `${APP_URL}/regulamin`,
    "about": { "@id": `${APP_URL}#medical-business` }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 bg-white rounded-2xl shadow-sm border mt-8">
      <JsonLd data={breadcrumbs} />
      <JsonLd data={webPage} />

      <h1 className="text-3xl font-bold mb-6">Regulamin świadczenia usług</h1>
      <p className="text-sm text-gray-600 mb-6">
        Obowiązuje od {new Date().toLocaleDateString('pl-PL')}.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Dane Sprzedawcy</h2>
      <p className="text-gray-700">
        {NAME}, {ADDRESS}{NIP ? `, NIP: ${NIP}` : ''}. Kontakt: {EMAIL}.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Przedmiot regulaminu</h2>
      <p className="text-gray-700">
        Regulamin określa zasady rezerwacji i odpłatnego korzystania z usług medycznych (teleporady, wizyty domowe) za pośrednictwem serwisu internetowego {NAME}.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Zamówienia i płatność</h2>
      <ul className="list-disc ml-5 text-gray-700 space-y-2">
        <li>Rezerwacja odbywa się poprzez formularz na stronie (wymagane pola: imię i nazwisko, kontakt, data i godzina, typ usługi).</li>
        <li>Płatność realizowana online za pośrednictwem operatora płatności (Przelewy24) zgodnie z jego regulaminem.</li>
        <li>Ceny są podane w złotych polskich (PLN) i zawierają podatki.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Realizacja usługi</h2>
      <ul className="list-disc ml-5 text-gray-700 space-y-2">
        <li>Teleporady realizowane są zdalnie o umówionej godzinie.</li>
        <li>Wizyty domowe realizowane są pod adresem podanym w formularzu.</li>
        <li>Usługa uznana jest za zrealizowaną po odbyciu konsultacji.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Odstąpienie, zmiana terminu, reklamacje</h2>
      <ul className="list-disc ml-5 text-gray-700 space-y-2">
        <li>Klient może odstąpić od umowy na zasadach przewidzianych w przepisach prawa konsumenckiego (jeżeli przysługuje).</li>
        <li>Zmiana terminu możliwa najpóźniej 24h przed wizytą, po kontakcie z rejestracją.</li>
        <li>Reklamacje można składać na adres: {EMAIL}. Rozpatrujemy je w ciągu 14 dni.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Postanowienia końcowe</h2>
      <p className="text-gray-700">
        W sprawach nieuregulowanych zastosowanie mają powszechnie obowiązujące przepisy prawa.
      </p>
    </main>
  )
}
