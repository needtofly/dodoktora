import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";

const BASE = "https://dodoktora.co";

export const metadata: Metadata = {
  title: "Lekarze",
  description: "Poznaj naszego lekarza i umów wizytę online.",
  alternates: { canonical: "/lekarze" },
  openGraph: { url: "/lekarze" },
};

const doctor = {
  name: "Dr. Jan Sowa",
  role: "Lekarz",
  img: "https://picsum.photos/seed/jan-sowa/300/300",
};

export default function DoctorsPage() {
  const doctorJsonLd = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: doctor.name,
    medicalSpecialty: "GeneralPractice",
    url: `${BASE}/lekarze`,
  };

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Strona główna", item: BASE },
      { "@type": "ListItem", position: 2, name: "Lekarze", item: `${BASE}/lekarze` },
    ],
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      {/* JSON-LD: lekarz + breadcrumbs */}
      <JsonLd data={doctorJsonLd} />
      <JsonLd data={breadcrumbsJsonLd} />

      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Lekarze</h1>
        <p className="text-gray-600 mt-2">Umów teleporadę w dogodnym terminie.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card p-6 text-center group">
          <div className="relative w-40 h-40 mx-auto mb-4">
            <Image
              src={doctor.img}
              alt={doctor.name}
              fill
              className="rounded-full object-cover group-hover:scale-105 transition"
            />
          </div>
          <h2 className="text-xl font-semibold group-hover:text-blue-700 transition">{doctor.name}</h2>
          <p className="text-gray-600 mb-4">{doctor.role}</p>

          <Link href={`/?doctor=${encodeURIComponent(doctor.name)}#umow`} className="btn btn-primary">
            Umów wizytę
          </Link>
        </div>
      </div>
    </main>
  );
}
