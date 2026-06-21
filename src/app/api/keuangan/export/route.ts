import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, unauthorized, forbidden } from "@/lib/api-helpers";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromSession();
    if (!user) return unauthorized();
    if (user.role !== "keuangan") return forbidden();

    await connectDB();
    const angkatanId = req.nextUrl.searchParams.get("angkatanId");

    const baseFilter: Record<string, unknown> = {
      role: "mahasiswa",
      statusPendaftaran: { $nin: ["Belum Mendaftar", "-"] },
    };
    if (angkatanId) baseFilter.angkatanId = angkatanId;

    const mahasiswaList = await User.find(baseFilter);

    const header = "No,NIM/Username,Nama Lengkap,Status Pendaftaran,Catatan Pembayaran,Waktu Daftar";
    const rows = mahasiswaList.map((m, idx) => {
      const createdAt = m.createdAt ? m.createdAt.toISOString().replace("T", " ").slice(0, 19) : "-";
      return `${idx + 1},${m.username},${m.namaLengkap || "-"},${m.statusPendaftaran},${m.catatanKeuangan || "-"},${createdAt}`;
    });

    const csv = [header, ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=Laporan_Keuangan_Pendaftaran_Wisuda.csv",
      },
    });
  } catch (error: any) {
    console.error("GET keuangan export error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
