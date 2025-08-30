// components/Footer.tsx
import Link from "next/link"

export default function Footer() {
  // te wartości wczytujemy z .env (serwerowy komponent — OK)
  const NAME = process.env.BUSINESS_NAME || "dodoktora.co"
  const ADDRESS = process.env.BUSINESS_ADDRESS || ""
  const EMAIL = process.env.BUSINESS_EMAIL || ""
  const PHONE = process.env.BUSINESS_PHONE || ""
  const NIP = process.env.BUSINESS_NIP || ""

  return (
    <footer className="mt-16 border-t bg-white">
      {/* górna, smukła belka z danymi firmy */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
        {/* kolumna 1: nazwa i adres */}
        <div className="space-y-1">
          <div className="text-base font-semibold text-gray-900">{NAME}</div>
          {ADDRESS && <div className="text-gray-600">{ADDRESS}</div>}
          {NIP && (
            <div className="text-gray-700">
              <span className="font-medium">NIP:</span> {NIP}
            </div>
          )}
        </div>

        {/* kolumna 2: szybkie linki */}
        <nav className="grid grid-cols-2 gap-x-6 gap-y-2">
          <Link href="/#umow" className="text-gray-700 hover:text-blue-700 transition">Umów wizytę</Link>
          <Link href="/uslugi" className="text-gray-700 hover:text-blue-700 transition">Usługi</Link>
          <Link href="/lekarze" className="text-gray-700 hover:text-blue-700 transition">Lekarze</Link>
          <Link href="/artykuly" className="text-gray-700 hover:text-blue-700 transition">Artykuły</Link>
          <Link href="/regulamin" className="text-gray-700 hover:text-blue-700 transition">Regulamin</Link>
          <Link href="/polityka-prywatnosci" className="text-gray-700 hover:text-blue-700 transition">Polityka prywatności</Link>
        </nav>

        {/* kolumna 3: kontakt + mini social (opcjonalne) */}
        <div className="space-y-2 sm:text-right">
          {EMAIL && (
            <div>
              <span className="text-gray-500 mr-1">E-mail:</span>
              <a href={`mailto:${EMAIL}`} className="text-gray-800 hover:text-blue-700 transition">
                {EMAIL}
              </a>
            </div>
          )}
          {PHONE && (
            <div>
              <span className="text-gray-500 mr-1">Tel.:</span>
              <a href={`tel:${PHONE.replace(/\s+/g, "")}`} className="text-gray-800 hover:text-blue-700 transition">
                {PHONE}
              </a>
            </div>
          )}

          {/* ikony (SVG inline, żeby nie dodawać bibliotek) – usuń, jeśli nie chcesz */}
          <div className="flex sm:justify-end gap-3 pt-1">
            <a aria-label="Facebook" href="#" className="p-2 rounded-md border hover:border-blue-600 hover:text-blue-700 transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.06C22 6.48 17.52 2 11.94 2S2 6.48 2 12.06c0 4.99 3.66 9.13 8.44 9.94v-7.03H7.9v-2.9h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34v7.03C18.34 21.2 22 17.05 22 12.06z"/></svg>
            </a>
            <a aria-label="Instagram" href="#" className="p-2 rounded-md border hover:border-pink-600 hover:text-pink-700 transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2.2A2.8 2.8 0 1 0 12 16.8 2.8 2.8 0 0 0 12 9.2zM18 6.6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>
            </a>
            <a aria-label="LinkedIn" href="#" className="p-2 rounded-md border hover:border-sky-700 hover:text-sky-700 transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6.94 8.5H3.56V21h3.38V8.5zM5.25 3C4.2 3 3.34 3.86 3.34 4.91c0 1.04.86 1.9 1.9 1.9s1.9-.86 1.9-1.9C7.14 3.86 6.3 3 5.25 3zM21 21h-3.38v-6.1c0-1.45-.03-3.32-2.03-3.32-2.03 0-2.34 1.58-2.34 3.22V21H9.86V8.5h3.24v1.71h.05c.45-.86 1.57-1.77 3.24-1.77 3.46 0 4.1 2.28 4.1 5.24V21z"/></svg>
            </a>
          </div>
        </div>
      </div>

      {/* cienka linia oddzielająca */}
      <div className="border-t" />

      {/* dolna, bardzo kompaktowa belka z prawami i mini-menu */}
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
        <div>© {new Date().getFullYear()} {NAME}. Wszelkie prawa zastrzeżone.</div>
        <div className="flex items-center gap-3">
          <Link href="/regulamin" className="hover:text-gray-700">Regulamin</Link>
          <span aria-hidden>•</span>
          <Link href="/polityka-prywatnosci" className="hover:text-gray-700">Polityka prywatności</Link>
          <span aria-hidden>•</span>
          <Link href="/uslugi" className="hover:text-gray-700">Cennik</Link>
        </div>
      </div>
    </footer>
  )
}
