// pages/api/payments/test.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

// Obsłużymy i GET (z <a href=...>) i POST (z <form method="POST">)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const q = req.query || {};
    const b = (typeof req.body === "string" ? safeParse(req.body) : (req.body || {})) as any;

    const id = (req.method === "POST" ? (b?.id ?? q.id) : q.id) as string | undefined;
    const amountRaw = (req.method === "POST" ? (b?.amount ?? q.amount) : q.amount) as string | undefined;

    // Brak ID → przekieruj na stronę anulowania
    if (!id) {
      res.setHeader("Location", `/cancel?reason=no-id`);
      return res.status(302).end();
    }

    // Czy rezerwacja istnieje?
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      res.setHeader("Location", `/cancel?reason=not-found&id=${encodeURIComponent(id)}`);
      return res.status(302).end();
    }

    // (Opcjonalnie) można porównać kwotę:
    // const amount = amountRaw ? Number(String(amountRaw).replace(",", ".")) : undefined;

    // Oznacz jako opłacone (jeśli jeszcze nie)
    if (booking.status !== "PAID") {
      await prisma.booking.update({
        where: { id },
        data: { status: "PAID" },
      });
    }

    // Sukces → przekieruj na stronę z podziękowaniem
    const redirectUrl = `/success?bookingId=${encodeURIComponent(id)}`;
    res.setHeader("Location", redirectUrl);
    return res.status(302).end();
  } catch (e: any) {
    const msg = encodeURIComponent(e?.message || "unknown");
    res.setHeader("Location", `/cancel?reason=error&msg=${msg}`);
    return res.status(302).end();
  }
}

function safeParse(s: string) {
  try { return JSON.parse(s || "{}"); } catch { return {}; }
}
