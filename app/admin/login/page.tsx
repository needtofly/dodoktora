// app/admin/login/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp?.get('next') || '/admin';

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setErr(data?.error || `HTTP ${res.status}`);
        setLoading(false);
        return;
      }
      router.replace(next);
    } catch {
      setErr('Błąd sieci.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[70vh] flex items-center justify-center p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white border rounded-2xl shadow-sm p-6 space-y-4"
      >
        <h1 className="text-xl font-semibold text-center">Panel administracyjny</h1>
        <p className="text-sm text-gray-600 text-center">Podaj hasło dostępu.</p>

        {err && (
          <div
            className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm"
            role="alert"
          >
            {err}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hasło</label>
          <input
            type="password"
            className="w-full h-12 px-4 text-base rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full h-12"
          disabled={loading}
        >
          {loading ? 'Logowanie…' : 'Zaloguj'}
        </button>
      </form>
    </main>
  );
}
