// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";

import HeaderNav from "@/components/HeaderNav";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import Gtag from "@/components/Gtag";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dodoktora.co";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "dodoktora.co — Teleporady i wizyty domowe",
  description:
    "Zarezerwuj teleporadę lub wizytę domową u lekarza. Profesjonalna opieka medyczna dostępna online.",
  keywords: ["teleporada", "wizyta domowa", "lekarz online", "przychodnia", "dodoktora.co"],
  openGraph: {
    title: "dodoktora.co — Teleporady i wizyty domowe",
    description: "Profesjonalna opieka medyczna online i w domu pacjenta.",
    url: "https://dodoktora.co",
    siteName: "dodoktora.co",
    images: [
      {
        url: "/icon-512-maskable.png",
        width: 512,
        height: 512,
        alt: "dodoktora.co logo",
      },
    ],
    locale: "pl_PL",
    type: "website",
  },
  // fallbacki ikon
  icons: {
    icon: [
      { url: "/favicon.ico?v=6", rel: "icon", sizes: "any" },
      { url: "/favicon-32.png?v=6", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16.png?v=6", type: "image/png", sizes: "16x16" },
    ],
    apple: "/apple-touch-icon.png?v=6",
    shortcut: "/favicon.ico?v=6",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb", // Tailwind blue-600
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <head>
        {/* Twardy favicon (data URL SVG) */}
        <link
          rel="icon"
          type="image/svg+xml"
          href={
            "data:image/svg+xml;base64," +
            "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+" +
            "PHJlY3QgeD0iMiIgeT0iMiIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiByeD0iMTIiIGZpbGw9IiMyNTYz" +
            "ZWIiLz48cmVjdCB4PSIyOSIgeT0iMTQiIHdpZHRoPSI2IiBoZWlnaHQ9IjM2IiByeD0iMyIgZmlsbD0i" +
            "I2ZmZiIvPjxyZWN0IHg9IjE0IiB5PSIyOSIgd2lkdGg9IjM2IiBoZWlnaHQ9IjYiIHJ4PSIzIiBmaWxs" +
            "PSIjZmZmIi8+PC9zdmc+"
          }
        />
        {/* Fallbacki plikowe */}
        <link rel="icon" href="/favicon-32.png?v=6" sizes="32x32" type="image/png" />
        <link rel="icon" href="/favicon-16.png?v=6" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon.ico?v=6" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=6" />
      </head>
      <body className="flex min-h-screen flex-col bg-white text-gray-900">
        {/* Google Analytics + Consent Mode */}
        <Gtag />

        {/* Header */}
        <HeaderNav />

        {/* Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <Footer />

        {/* Cookie banner + settings */}
        <CookieConsent />
      </body>
    </html>
  );
}
