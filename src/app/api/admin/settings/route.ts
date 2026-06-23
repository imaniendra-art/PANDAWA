import { NextResponse } from "next/server";
import { getUserFromSession, unauthorized, forbidden } from "@/lib/api-helpers";
import { connectDB } from "@/lib/db";
import { Settings, getSettings } from "@/models/Settings";

export async function GET() {
  try {
    const user = await getUserFromSession();
    if (!user) return unauthorized();
    if (user.role !== "admin") return forbidden();

    await connectDB();
    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("GET admin settings error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromSession();
    if (!user) return unauthorized();
    if (user.role !== "admin") return forbidden();

    await connectDB();
    const { ketuaPanitia, nidnKetua, ketuaPt, nidnKetuaPt } = await req.json();

    if (!ketuaPanitia || !nidnKetua) {
      return NextResponse.json({ error: "Field wajib tidak boleh kosong." }, { status: 400 });
    }

    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    settings.ketuaPanitia = ketuaPanitia;
    settings.nidnKetua = nidnKetua;

    settings.ketuaPt = ketuaPt || "Nama Ketua PT";
    settings.nidnKetuaPt = nidnKetuaPt || "NIDN Ketua PT";
    await settings.save();

    return NextResponse.json({ message: "Pengaturan berhasil diperbarui." });
  } catch (error: any) {
    console.error("POST admin settings error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
