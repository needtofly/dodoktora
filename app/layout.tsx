import type { Metadata, Viewport } from "next";
import "./globals.css";

import HeaderNav from "@/components/HeaderNav";
import Footer from "@/components/Footer";

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
        url: "/icon-512-maskable.png?v=7",
        width: 512,
        height: 512,
        alt: "dodoktora.co logo",
      },
    ],
    locale: "pl_PL",
    type: "website",
  },
  // Favikony — wymuszamy PNG 32/16 jako ikonę zakładki, bez .ico
  icons: {
    icon: [
      { url: "/favicon-32.png?v=7", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16.png?v=7", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/apple-touch-icon.png?v=7", sizes: "180x180" }],
    other: [{ rel: "mask-icon", url: "/icon-maskable-512.png?v=7" }],
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
