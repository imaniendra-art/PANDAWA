import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, unauthorized, forbidden } from "@/lib/api-helpers";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  const user = await getUserFromSession();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();

  await connectDB();
  const angkatanId = req.nextUrl.searchParams.get("angkatanId");

  const baseFilter: Record<string, unknown> = { role: "mahasiswa", statusPendaftaran: "Lulus/Cetak Kartu" };
  if (angkatanId) baseFilter.angkatanId = angkatanId;

  const mahasiswaList = await User.find(baseFilter);

  let csv = "No,NIM,Nama Lengkap,NIK,Tempat Lahir,Tanggal Lahir,Konsentrasi,Judul Skripsi,Ukuran Toga,Tanggal Daftar\n";
  mahasiswaList.forEach((m, idx) => {
    const tanggalLahir = m.tanggalLahir ? new Date(m.tanggalLahir).toLocaleDateString("id-ID") : "-";
    const createdAt = m.createdAt ? new Date(m.createdAt).toLocaleDateString("id-ID") : "-";
    csv += `${idx + 1},${m.username},${m.namaLengkap || "-"},${m.nik || "-"},${m.tempatLahir || "-"},${tanggalLahir},${m.konsentrasi || "-"},"${m.judulSkripsi || "-"}",${m.ukuranToga || "-"},${createdAt}\n`;
  });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=Lengkap_Data_Calon_Wisudawan.csv",
    },
  });
}
