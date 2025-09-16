// app/sitemap.ts
import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://dodoktora.co";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  // Statyczne, kluczowe ścieżki — rozszerz, jeśli masz kolejne podstrony
  const routes: Array<{ url: string; changefreq?: "daily"|"weekly"|"monthly"; priority?: number; lastModified?: string; }> = [
    { url: "/", changefreq: "daily", priority: 1.0 },
    { url: "/uslugi", changefreq: "weekly", priority: 0.9 },
    { url: "/uslugi/teleporada", changefreq: "weekly", priority: 0.9 },
    { url: "/uslugi/wizyta-domowa", changefreq: "weekly", priority: 0.9 },
    { url: "/lekarze", changefreq: "monthly", priority: 0.7 },
    { url: "/artykuly", changefreq: "daily", priority: 0.8 },
    { url: "/regulamin", changefreq: "yearly", priority: 0.5 },
    { url: "/polityka-prywatnosci", changefreq: "yearly", priority: 0.5 },
  ].map((r) => ({ ...r, url: SITE + r.url, lastModified: now }));

  return routes;
}
