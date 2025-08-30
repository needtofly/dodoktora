import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "appointments.json");

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");
  const type = searchParams.get("type");
  const date = searchParams.get("date");
  const time = searchParams.get("time");

  const appointment = { name, email, phone, type, date, time };

  let appointments = [];
  if (fs.existsSync(filePath)) {
    appointments = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }
  appointments.push(appointment);
  fs.writeFileSync(filePath, JSON.stringify(appointments, null, 2));

  return NextResponse.json({ success: true, appointment });
}
