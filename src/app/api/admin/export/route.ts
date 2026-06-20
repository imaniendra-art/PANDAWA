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

  const header = "No,NIM/Username,Nama Lengkap (Ijazah),NIK,Tempat Lahir,Tanggal Lahir,Konsentrasi,Judul Skripsi,Ukuran Toga,Ukuran Baju Alumni,Waktu Pendaftaran";
  const rows = mahasiswaList.map((m, idx) => {
    const tanggalLahir = m.tanggalLahir ? m.tanggalLahir.toISOString().split("T")[0] : "-";
    const createdAt = m.createdAt ? m.createdAt.toISOString().replace("T", " ").slice(0, 19) : "-";
    return `${idx + 1},${m.username},${m.namaLengkap || "-"},${m.nik || "-"},${m.tempatLahir || "-"},${tanggalLahir},${m.konsentrasi || "-"},"${m.judulSkripsi || "-"}",${m.ukuranToga || "-"},${m.ukuranKaos || "-"},${createdAt}`;
  });

  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=Lengkap_Data_Calon_Wisudawan.csv",
    },
  });
}
