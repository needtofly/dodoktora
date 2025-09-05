import Link from "next/link";

type SP = { [key: string]: string | string[] | undefined };

export default function ReturnPage({ searchParams }: { searchParams: SP }) {
  const bookingId =
    (searchParams.bookingId as string) ||
    (searchParams.id as string) ||
    "";

  const rawAmount = (searchParams.amount as string) || "0";
  const amountNum = parseFloat(rawAmount);
  const amount = Number.isFinite(amountNum) ? amountNum.toFixed(2) : "0.00";

  const currency = (searchParams.currency as string) || "PLN";
  const status =
    (searchParams.status as string) ||
    (searchParams.tr_status as string) ||
    "success";

  return (
    <div className="mx-auto max-w-xl p-6 bg-white rounded-2xl border shadow-sm space-y-4">
      <h1 className="text-2xl font-semibold">Powrót z płatności (test)</h1>

      <div className="text-sm text-gray-700 space-y-1">
        <div>
          <span className="font-medium text-gray-900">Status:</span> {status}
        </div>
        <div>
          <span className="font-medium text-gray-900">Rezerwacja:</span>{" "}
          {bookingId || "—"}
        </div>
        <div>
          <span className="font-medium text-gray-900">Kwota:</span> {amount}{" "}
          {currency}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Link
          href="/success"
          className="px-4 h-11 rounded-xl border bg-blue-600 text-white hover:bg-blue-700"
        >
          Zakończ
        </Link>
        <Link
          href="/"
          className="px-4 h-11 rounded-xl border bg-white hover:bg-gray-50 text-gray-800"
        >
          Strona główna
        </Link>
      </div>
    </div>
  );
}
