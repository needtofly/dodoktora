"use client";
import Link from "next/link";

type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="text-sm mb-6 flex flex-wrap items-center gap-1 text-gray-600">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-gray-400">›</span>}
          {it.href ? (
            <Link href={it.href} className="hover:text-blue-700">
              {it.label}
            </Link>
          ) : (
            <span aria-current="page" className="text-gray-800">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
