"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      router.push("/admin");
    } catch (e: any) {
      setErr(e?.message || "Błąd logowania");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm p-6 bg-white rounded-2xl border shadow-sm mt-10">
      <h1 className="text-xl font-semibold mb-4">Logowanie — panel admina</h1>

      {err && (
        <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Hasło administratora"
          className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl border bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Logowanie…" : "Zaloguj"}
        </button>
      </form>
    </div>
  );
}
