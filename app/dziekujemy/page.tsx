export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // nie prerenderuj podczas builda
export const revalidate = 0;

import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function ThanksPage({
  searchParams,
}: {
  searchParams?: { bookingId?: string };
}) {
  const id = searchParams?.bookingId;
  if (!id) redirect('/');

  // odczyt tylko w czasie requestu (runtime=nodejs)
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) redirect('/');

  return (
    <main className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-3">Dziękujemy — płatność przyjęta</h1>
      <p className="text-gray-700 mb-6">
        Wysłaliśmy potwierdzenie na adres <strong>{booking.email}</strong>. Jeśli nie widzisz wiadomości — sprawdź spam.
      </p>
      <div className="inline-block text-left bg-white rounded-2xl border p-6">
        <p><strong>Wizyta:</strong> {booking.visitType}</p>
        <p><strong>Pacjent:</strong> {booking.fullName}</p>
        <p><strong>Termin:</strong> {new Date(booking.date).toLocaleString('pl-PL')}</p>
        {booking.doctor && <p><strong>Lekarz:</strong> {booking.doctor}</p>}
        <p><strong>Cena:</strong> {(booking.priceCents / 100).toFixed(2)} zł</p>
      </div>
      <div className="mt-8">
        <a href="/" className="btn">Strona główna</a>
      </div>
    </main>
  );
}
