// components/Breadcrumbs.tsx
import Link from "next/link"

type Crumb = { label: string; href?: string }

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (!items?.length) return null
  return (
    <nav aria-label="breadcrumbs" className="text-sm text-gray-600 mb-6">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((it, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={i} className="flex items-center gap-2">
              {it.href && !isLast ? (
                <Link href={it.href} className="hover:underline hover:text-blue-700">
                  {it.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className={isLast ? "text-gray-900" : ""}>
                  {it.label}
                </span>
              )}
              {!isLast && <span className="text-gray-400">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
