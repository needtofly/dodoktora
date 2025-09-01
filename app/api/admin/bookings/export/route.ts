import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        visitType: true,
        doctor: true,
        date: true,
        notes: true,
        status: true,
        priceCents: true,
        createdAt: true,
        updatedAt: true,
        pesel: true,
        realized: true,
      },
    });

    // Nagłówki CSV
    const header = [
      "id",
      "fullName",
      "email",
      "phone",
      "visitType",
      "doctor",
      "date",
      "notes",
      "status",
      "priceCents",
      "createdAt",
      "updatedAt",
      "pesel",
      "realized",
    ].join(",");

    // Wiersze CSV
    const rows = bookings.map((b) =>
      [
        b.id,
        b.fullName,
        b.email ?? "",
        b.phone ?? "",
        b.visitType,
        b.doctor ?? "",
        b.date.toISOString(),
        b.notes ?? "",
        b.status,
        b.priceCents,
        b.createdAt.toISOString(),
        b.updatedAt.toISOString(),
        b.pesel ?? "",
        b.realized ? "true" : "false",
      ].join(",")
    );

    const csv = [header, ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=bookings.csv",
      },
    });
  } catch (e) {
    console.error("export error:", e);
    return NextResponse.json({ error: "Błąd eksportu" }, { status: 500 });
  }
}
