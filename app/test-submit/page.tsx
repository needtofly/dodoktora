export default function TestSubmit() {
  const today = new Date().toISOString().split('T')[0]
  return (
    <main style={{ maxWidth: 520, margin: '40px auto', fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Test POST → /api/bookings</h1>
      <form action="/api/bookings" method="post" style={{ display: 'grid', gap: 10 }}>
        <input name="fullName" placeholder="Imię i nazwisko" required />
        <input name="email" placeholder="E-mail" type="email" required />
        <input name="phone" placeholder="Telefon" required />
        <select name="visitType">
          <option>Teleporada</option>
          <option>Wizyta domowa</option>
        </select>
        <input name="doctor" placeholder="Lekarz" defaultValue="Dr. Jan Sowa" />
        <input name="date" type="datetime-local" min={`${today}T07:00`} required />
        <button type="submit">Wyślij</button>
      </form>
      <p style={{ marginTop: 12, color: '#666' }}>
        Ten formularz wysyła <b>czysty POST</b> na <code>/api/bookings</code> (bez JavaScript).
      </p>
    </main>
  )
}
