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

  const baseFilter: Record<string, unknown> = {
    role: "mahasiswa",
    statusPendaftaran: { $nin: ["Belum Mendaftar", "-"] },
  };
  if (filterAngkatanId) baseFilter.angkatanId = filterAngkatanId;

  const mahasiswaList = await User.find(baseFilter);

  const lulusStatuses = ["Lulus/Cetak Kartu", "Menunggu Validasi Panitia", "Valid/Lunas"];
  const validatedCount = mahasiswaList.filter((m) => lulusStatuses.includes(m.statusPendaftaran)).length;
  const totalPemasukanPendaftaran = validatedCount * (selectedAngkatan?.biaya || 0);

  return NextResponse.json({
    mahasiswaList,
    semuaAngkatan,
    angkatanId: filterAngkatanId,
    totalPemasukanPendaftaran,
  });
}
