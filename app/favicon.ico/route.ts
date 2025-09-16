// app/favicon.ico/route.ts
import { NextResponse } from "next/server";

// Serwujemy favicona jako SVG (biały krzyż, niebieskie tło, obłe rogi)
const SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect x="2" y="2" width="60" height="60" rx="12" fill="#2563eb"/>
  <rect x="29" y="14" width="6" height="36" rx="3" fill="#fff"/>
  <rect x="14" y="29" width="36" height="6" rx="3" fill="#fff"/>
</svg>
`;

export const runtime = "nodejs";         // użyjmy Node, nie Edge
export const dynamic = "force-static";   // statyczny, cachowalny długo

export async function GET() {
  return new NextResponse(SVG, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
