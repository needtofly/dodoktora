export const dynamic = 'force-static'
import JsonLd from '@/components/JsonLd'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const NAME = process.env.BUSINESS_NAME || "dodoktora.co"
const ADDRESS = process.env.BUSINESS_ADDRESS || "—"
const EMAIL = process.env.BUSINESS_EMAIL || "—"
const NIP = process.env.BUSINESS_NIP || ""

export default function PrivacyPage() {
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Strona główna", item: APP_URL },
      { "@type": "ListItem", position: 2, name: "Polityka prywatności", item: `${APP_URL}/polityka-prywatnosci` }
    ]
  }

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Polityka prywatności",
    "url": `${APP_URL}/polityka-prywatnosci`,
    "about": { "@id": `${APP_URL}#medical-business` }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 bg-white rounded-2xl shadow-sm border mt-8">
      <JsonLd data={breadcrumbs} />
      <JsonLd data={webPage} />

      <h1 className="text-3xl font-bold mb-6">Polityka prywatności</h1>
      <p className="text-sm text-gray-600 mb-6">
        Obowiązuje od {new Date().toLocaleDateString('pl-PL')}.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Administrator danych</h2>
      <p className="text-gray-700">
        Administratorem jest {NAME}, {ADDRESS}{NIP ? `, NIP: ${NIP}` : ''}. Kontakt: {EMAIL}.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Zakres i cele przetwarzania</h2>
      <ul className="list-disc ml-5 text-gray-700 space-y-2">
        <li>Realizacja rezerwacji i płatności za usługi medyczne (art. 6 ust. 1 lit. b RODO).</li>
        <li>Kontakt w sprawie wizyty i obsługa posprzedażowa (art. 6 ust. 1 lit. b/f RODO).</li>
        <li>Wypełnienie obowiązków prawnych (np. rozliczenia) (art. 6 ust. 1 lit. c RODO).</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Okres przechowywania</h2>
      <p className="text-gray-700">
        Dane przechowujemy przez okres niezbędny do realizacji celu i zgodnie z wymogami prawa (w tym podatkowymi).
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Prawa użytkownika</h2>
      <ul className="list-disc ml-5 text-gray-700 space-y-2">
        <li>Dostęp do danych, sprostowanie, usunięcie, ograniczenie, sprzeciw, przenoszenie danych.</li>
        <li>Prawo wniesienia skargi do PUODO.</li>
        <li>Kontakt w sprawie danych: {EMAIL}.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Odbiorcy danych</h2>
      <p className="text-gray-700">
        Dane mogą być przekazywane m.in. operatorowi płatności (Przelewy24), dostawcom hostingu i usług IT, podmiotom uprawnionym na podstawie przepisów prawa.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Pliki cookies</h2>
      <p className="text-gray-700">
        Serwis wykorzystuje pliki cookies w celach funkcjonalnych i statystycznych. Użytkownik może zarządzać cookies w ustawieniach przeglądarki.
      </p>
    </main>
  )
}
