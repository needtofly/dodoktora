// app/api/appointments/upload/route.ts
import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
}

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as unknown as File | null
    if (!file) return NextResponse.json({ error: 'Brak pliku w polu "file".' }, { status: 400 })

    const buf = Buffer.from(await file.arrayBuffer())
    const safe = sanitizeFilename(file.name || 'upload.bin')
    const target = path.join('/tmp', `${Date.now()}-${safe}`)
    await writeFile(target, buf)

    return NextResponse.json({ ok: true, name: file.name, type: file.type, size: buf.length, path: target })
  } catch (err) {
    console.error('UPLOAD ERROR:', err)
    return NextResponse.json({ error: 'Błąd podczas przesyłania pliku.' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, hint: 'Wyślij POST multipart/form-data z polem "file".' })
}
