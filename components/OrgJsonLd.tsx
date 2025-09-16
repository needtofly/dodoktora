// components/OrgJsonLd.tsx
"use client";
import React from "react";

export default function OrgJsonLd() {
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://dodoktora.co";
  const NAME = process.env.BUSINESS_NAME || "dodoktora.co";
  const PHONE = process.env.BUSINESS_PHONE || "663 615 909";
  const EMAIL = process.env.BUSINESS_EMAIL || "dcimportusa@gmail.com";
  const ADDRESS = process.env.BUSINESS_ADDRESS || "Rakowiecka 22c/19 02-521 Warszawa";
  const NIP = process.env.BUSINESS_NIP || "5213705980";

  const addressParts = ADDRESS.split(",").map(s => s.trim());
  // Spróbujmy rozbić: "Ulica 1, 00-000 Miasto"
  const streetAddress = addressParts[0] || "";
  const postalCity = (addressParts[1] || "").split(" ");
  const postalCode = postalCity.slice(0,1).join(" ") || "";
  const addressLocality = postalCity.slice(1).join(" ") || "";

  const json = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic", // alternatywnie: LocalBusiness/Organization
    name: NAME,
    url: SITE,
    telephone: PHONE || undefined,
    email: EMAIL || undefined,
    taxID: NIP || undefined,
    address: ADDRESS ? {
      "@type": "PostalAddress",
      streetAddress,
      postalCode: postalCode || undefined,
      addressLocality: addressLocality || undefined,
      addressCountry: "PL",
    } : undefined,
    sameAs: [
      // dodaj linki do sociali (jeśli masz)
    ].filter(Boolean),
    // jeśli masz godziny pracy (przykład):
    openingHoursSpecification: [
      // { "@type":"OpeningHoursSpecification", dayOfWeek:["Monday","Tuesday"...], opens:"07:00", closes:"22:00" }
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
