// app/sitemap.ts
import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://dodoktora.co";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`,                    lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${SITE}/uslugi`,              lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${SITE}/uslugi/teleporada`,   lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${SITE}/uslugi/wizyta-domowa`,lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${SITE}/lekarze`,             lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/artykuly`,            lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${SITE}/regulamin`,           lastModified: now, changeFrequency: "yearly",  priority: 0.5 },
    { url: `${SITE}/polityka-prywatnosci`,lastModified: now, changeFrequency: "yearly",  priority: 0.5 },
  ];

  return routes;
}
