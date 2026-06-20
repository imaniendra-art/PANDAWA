import { NextResponse } from "next/server";
import { getUserFromSession, unauthorized, forbidden } from "@/lib/api-helpers";

export async function POST() {
  const user = await getUserFromSession();
  if (!user) return unauthorized();
  if (user.role !== "mahasiswa") return forbidden();

  if (user.statusPendaftaran !== "Revisi Beda Nama") {
    return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
  }

  user.fileSuratPernyataan = "AUTO";
  user.statusPendaftaran = "Menunggu Validasi Admin";
  await user.save();

  return NextResponse.json({
    message: "Persetujuan berhasil disimpan! Menunggu validasi tahap akhir dari Admin.",
  });
}
