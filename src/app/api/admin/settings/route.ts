import { NextResponse } from "next/server";
import { getUserFromSession, unauthorized, forbidden } from "@/lib/api-helpers";
import { connectDB } from "@/lib/db";
import { Settings, getSettings } from "@/models/Settings";

export async function GET() {
  const user = await getUserFromSession();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();

  await connectDB();
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function POST(req: Request) {
  const user = await getUserFromSession();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();

  await connectDB();
  const { ketuaPanitia, nidnKetua, biayaWisuda, ketuaPt, nidnKetuaPt } = await req.json();

  if (!ketuaPanitia || !nidnKetua || !biayaWisuda) {
    return NextResponse.json({ error: "Field wajib tidak boleh kosong." }, { status: 400 });
  }

  let settings = await Settings.findOne();
  if (!settings) settings = new Settings();

  settings.ketuaPanitia = ketuaPanitia;
  settings.nidnKetua = nidnKetua;
  settings.biayaWisuda = biayaWisuda;
  settings.ketuaPt = ketuaPt || "Nama Ketua PT";
  settings.nidnKetuaPt = nidnKetuaPt || "NIDN Ketua PT";
  await settings.save();

  return NextResponse.json({ message: "Pengaturan berhasil diperbarui." });
}
