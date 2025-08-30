import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "appointments.json");

async function readAppointments() {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeAppointments(appointments: any[]) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(appointments, null, 2));
}

export async function GET() {
  const appointments = await readAppointments();
  return NextResponse.json(appointments);
}

export async function POST(req: Request) {
  const appointment = await req.json();
  const appointments = await readAppointments();
  appointments.push(appointment);
  await writeAppointments(appointments);
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  await writeAppointments([]);
  return NextResponse.json({ success: true });
}
