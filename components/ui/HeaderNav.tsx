"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

const SECTIONS = [
  { id: "lekarze", label: "Lekarze" },
  { id: "uslugi", label: "Usługi" },
  { id: "umow", label: "Umów wizytę", primary: true },
];

export default function HeaderNav() {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // wybierz tę sekcję, która ma największy % widoczności
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      {
        root: null,
        rootMargin: "0px 0px -50% 0px", // aktywuj ~po wejściu w środek ekranu
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
      <a href="/" className="flex items-center gap-2">
        <Image
          src="/logo.jpg"
          alt="dodoktora.co"
          width={160}
          height={60}
          priority
        />
      </a>

      <div className="flex gap-3">
        {SECTIONS.map(({ id, label, primary }) => {
          const isActive = active === id;
          const base =
            "btn transition";
          const normal =
            "hover:text-blue-700";
          const activeCls =
            "text-blue-700 ring-1 ring-blue-200";
          const primaryCls =
            "btn btn-primary";

        return (
            <a
              key={id}
              href={`#${id}`}
              className={primary ? primaryCls : `${base} ${isActive ? activeCls : normal}`}
            >
              {label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
