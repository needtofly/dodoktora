import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Limit 10 MB
const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Brak pliku" }, { status: 400 });
    }

    // walidacja typu
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Dozwolone tylko PDF, JPG i PNG" },
        { status: 400 }
      );
    }

    // walidacja rozmiaru
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Plik za duży (max 10 MB)" },
        { status: 400 }
      );
    }

    // wczytanie zawartości
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // katalog uploadów
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // unikalna nazwa
    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const filePath = path.join(uploadDir, uniqueName);

    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ url: `/uploads/${uniqueName}` });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
