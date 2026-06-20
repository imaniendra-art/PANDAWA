import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, unauthorized, forbidden } from "@/lib/api-helpers";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Angkatan } from "@/models/Angkatan";

export async function GET(req: NextRequest) {
  const user = await getUserFromSession();
  if (!user) return unauthorized();
  if (user.role !== "keuangan") return forbidden();

  await connectDB();
  const angkatanId = req.nextUrl.searchParams.get("angkatanId");
  const activeAngkatan = await Angkatan.findOne({ isActive: true });
  const filterAngkatanId = angkatanId || activeAngkatan?._id?.toString();

  const semuaAngkatan = await Angkatan.find().sort({ _id: 1 });
  const selectedAngkatan = filterAngkatanId
    ? await Angkatan.findById(filterAngkatanId)
    : activeAngkatan;

  const baseFilter: Record<string, unknown> = { role: "mahasiswa" };
  if (filterAngkatanId) baseFilter.angkatanId = filterAngkatanId;

  const mahasiswaList = await User.find({ ...baseFilter, statusPendaftaran: "Menunggu Validasi Keuangan" });

  const validatedCount = await User.countDocuments({
    ...baseFilter,
    statusPendaftaran: { $nin: ["Belum Mendaftar", "Revisi Pembayaran", "Menunggu Validasi Keuangan", "-"] },
  });

  const biayaPerMhs = selectedAngkatan?.biaya || 0;
  const totalPemasukanPendaftaran = validatedCount * biayaPerMhs;

  return NextResponse.json({
    mahasiswaList,
    validatedCount,
    totalPemasukanPendaftaran,
    semuaAngkatan,
    angkatanId: filterAngkatanId,
    biayaPerMhs,
  });
}
