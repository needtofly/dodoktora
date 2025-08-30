'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function HeaderNav() {
  const pathname = usePathname()

  const linkCls = (href: string) =>
    `px-5 py-2 rounded-lg text-lg font-semibold transition ${
      pathname === href
        ? 'text-blue-700 bg-blue-50'
        : 'text-gray-800 hover:text-blue-700 hover:bg-gray-50'
    }`

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-6xl mx-auto px-4 h-24 flex items-center justify-between">
        {/* LEWO: logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo.png"   // <- plik musi być w /public/logo.png
            alt="dodoktora.co"
            width={240}
            height={70}
            priority
            className="h-16 w-auto"
          />
        </Link>

        {/* PRAWO: nawigacja */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="/#umow" className={linkCls('/#umow')}>Umów wizytę</a>
          <Link href="/uslugi" className={linkCls('/uslugi')}>Usługi</Link>
          <Link href="/lekarze" className={linkCls('/lekarze')}>Lekarze</Link>
          <Link href="/artykuly" className={linkCls('/artykuly')}>Artykuły</Link>
        </nav>

        {/* Mobile - tylko CTA */}
        <div className="md:hidden">
          <a href="/#umow" className="btn btn-primary h-10">Umów wizytę</a>
        </div>
      </div>
    </header>
  )
}
