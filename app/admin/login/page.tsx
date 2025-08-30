'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error || 'Błędne hasło')
        setLoading(false)
        return
      }
      router.replace('/admin')
    } catch {
      setError('Błąd sieci, spróbuj ponownie.')
      setLoading(false)
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold mb-4">Panel administracyjny</h1>
      <form onSubmit={submit} className="space-y-3 bg-white p-6 rounded-2xl border">
        {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-2 rounded">{error}</div>}
        <div>
          <label className="label">Hasło administratora</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Loguję…' : 'Zaloguj'}
        </button>
      </form>
    </main>
  )
}
