// app/platnosc/p24/mock/page.tsx
"use client";

import { Suspense } from "react";
import Inner from "./view";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<main className="max-w-3xl mx-auto px-4 py-24">Ładowanie…</main>}>
      <Inner />
    </Suspense>
  );
}
