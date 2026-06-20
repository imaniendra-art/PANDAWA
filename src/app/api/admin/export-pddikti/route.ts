import { NextResponse } from "next/server";
import { getUserFromSession, unauthorized, forbidden } from "@/lib/api-helpers";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function GET() {
  const user = await getUserFromSession();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();

  try {
    await connectDB();
    const students = await User.find({ role: "mahasiswa", statusPendaftaran: "Lulus/Cetak Kartu" });

    // Header CSV
    const headers = [
      "NIM",
      "NIK",
      "Nama Lengkap",
      "Tempat Lahir",
      "Tanggal Lahir",
      "Program Studi",
      "Judul Skripsi"
    ];

    const escapeCsv = (str: string | null | undefined) => {
      if (!str) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = students.map((s) => [
      escapeCsv(s.username),
      escapeCsv(s.nik),
      escapeCsv(s.namaLengkap),
      escapeCsv(s.tempatLahir),
      s.tanggalLahir ? escapeCsv(new Date(s.tanggalLahir).toLocaleDateString("id-ID")) : '""',
      escapeCsv(s.konsentrasi),
      escapeCsv(s.judulSkripsi)
    ]);

    // Using semicolon delimiter to be safe for Indonesian Excel format
    const csvContent = [
      headers.join(";"),
      ...rows.map(r => r.join(";"))
    ].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="PDDikti_Export.csv"',
      },
    });
  } catch (err) {
    console.error("Export PDDikti error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan saat mengekspor data." }, { status: 500 });
  }
}
