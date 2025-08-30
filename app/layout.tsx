import './globals.css'
import type { Metadata } from 'next'
import HeaderNav from '@/components/HeaderNav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'dodoktora.co',
  description: 'Profesjonalna opieka medyczna dla pacjentów dorosłych.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <HeaderNav />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
