import type { Metadata, Viewport } from "next";
import "./globals.css";

import HeaderNav from "@/components/HeaderNav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "dodoktora.co — Teleporady i wizyty domowe",
  description: "Zarezerwuj teleporadę lub wizytę domową u lekarza. Profesjonalna opieka medyczna dostępna online.",
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb", // niebieski z Tailwind (blue-600)
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="flex min-h-screen flex-col bg-white text-gray-900">
        {/* Header */}
        <HeaderNav />

        {/* Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
