export default function NotFound() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-24 text-center">
      <h1 className="text-4xl font-bold mb-3">Strona nie została znaleziona</h1>
      <p className="text-gray-600 mb-8">Sprawdź adres lub wróć na stronę główną.</p>
      <div className="flex gap-3 justify-center">
        <a href="/" className="btn">Strona główna</a>
        <a href="/#umow" className="btn btn-primary">Umów wizytę</a>
      </div>
    </main>
  )
}
