'use client'
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <main className="max-w-3xl mx-auto px-4 py-24 text-center">
      <h1 className="text-4xl font-bold mb-3">Coś poszło nie tak</h1>
      <p className="text-gray-600 mb-6">Spróbuj ponownie lub wróć na stronę główną.</p>
      <div className="flex gap-3 justify-center">
        <button onClick={reset} className="btn">Spróbuj ponownie</button>
        <a href="/" className="btn btn-primary">Strona główna</a>
      </div>
      {process.env.NODE_ENV !== 'production' && (
        <pre className="text-xs text-left mt-8 p-4 bg-gray-50 rounded border overflow-auto">{error?.message}</pre>
      )}
    </main>
  )
}
