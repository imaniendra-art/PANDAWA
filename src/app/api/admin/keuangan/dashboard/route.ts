import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, unauthorized, forbidden } from "@/lib/api-helpers";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  const user = await getUserFromSession();
  if (!user) return unauthorized();
  if (user.role !== "admin" && user.role !== "keuangan") return forbidden();

  const baseFilter: Record<string, unknown> = { role: "mahasiswa" };

  const mahasiswaList = await User.find({ 
    ...baseFilter, 
    statusPendaftaran: "Menunggu Validasi Keuangan" 
  }).select("username namaLengkap fileBuktiPembayaran fileBebasSks statusPendaftaran angkatanId").populate("angkatanId").sort({ createdAt: 1 }).lean();

  const validatedCount = await User.countDocuments({ 
    ...baseFilter, 
    statusPendaftaran: { $in: ["Pembayaran Dikonfirmasi", "Mengisi Biodata", "Menunggu Validasi Admin", "Lulus/Cetak Kartu"] } 
  });
  
  const rejectedCount = await User.countDocuments({
    ...baseFilter,
    statusPendaftaran: "Revisi Pembayaran"
  });

  return NextResponse.json({
    mahasiswaList,
    validatedCount,
    rejectedCount,
    totalMenunggu: mahasiswaList.length
  });
}
