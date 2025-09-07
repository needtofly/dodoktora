// app/admin/login/page.tsx
'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function LoginInner() {
  const sp = useSearchParams()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>('')

  // Jeżeli już zalogowany, wejdź od razu do /admin (albo ?next=)
  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch('/api/admin/_whoami', { cache: 'no-store', credentials: 'include' })
        if (r.ok) {
          const j = await r.json().catch(() => ({}))
          if (j?.authed) {
            const next = sp?.get('next') ?? '/admin'
            router.replace(next)
          }
        }
      } catch {}
    })()
  }, [router, sp])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include', // httpOnly cookie
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!r.ok) {
        let msg = `HTTP ${r.status}`
        try { const j = await r.json(); if (j?.error) msg = j.error } catch {}
        setError(msg)
        return
      }

      const next = sp?.get('next') ?? '/admin'
      router.replace(next)
    } catch (e: any) {
      setError(e?.message || 'Błąd sieci')
    }
  }

  const debugWhoAmI = async () => {
    try {
      const r = await fetch('/api/admin/_whoami', { cache: 'no-store', credentials: 'include' })
      const j = await r.json().catch(() => ({}))
      alert(JSON.stringify(j, null, 2))
    } catch (e: any) {
      alert(e?.message || 'Błąd')
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-semibold mb-6">Logowanie do panelu</h1>
      {error && <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="password"
          className="w-full h-12 px-4 rounded border border-gray-300"
          placeholder="Hasło administratora"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        <button type="submit" className="btn btn-primary w-full h-12">Zaloguj</button>
      </form>

      <div className="mt-6 text-sm text-gray-600">
        <button onClick={debugWhoAmI} className="underline">Pokaż /api/admin/_whoami</button>
      </div>
    </main>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Ładowanie…</div>}>
      <LoginInner />
    </Suspense>
  )
}
