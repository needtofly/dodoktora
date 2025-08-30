import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, phone, type, date, time } = body;

  // konfiguracja płatności Przelewy24
  const merchantId = process.env.P24_MERCHANT_ID!;
  const posId = process.env.P24_POS_ID!;
  const crc = process.env.P24_CRC!;
  const amount = 20000; // kwota w groszach (np. 200 PLN)

  // tutaj normalnie wywołujesz API Przelewy24
  // uproszczenie – zwracamy przykładowy link sandbox
  const paymentUrl = `https://sandbox.przelewy24.pl/trnRequest/${merchantId}?sessionId=${Date.now()}&amount=${amount}&email=${email}`;

  return NextResponse.json({ url: paymentUrl });
}
