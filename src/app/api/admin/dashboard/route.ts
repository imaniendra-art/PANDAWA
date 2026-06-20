import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, unauthorized, forbidden } from "@/lib/api-helpers";
import { User } from "@/models/User";
import { Angkatan } from "@/models/Angkatan";
import { getSettings } from "@/models/Settings";

export async function GET(req: NextRequest) {
  const user = await getUserFromSession();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();

  const angkatanId = req.nextUrl.searchParams.get("angkatanId");
  const activeAngkatan = await Angkatan.findOne({ isActive: true });

  const filterAngkatanId = angkatanId || activeAngkatan?._id?.toString();

  const semuaAngkatan = await Angkatan.find().sort({ _id: 1 });

  const baseFilter: Record<string, unknown> = { role: "mahasiswa" };
  if (filterAngkatanId) baseFilter.angkatanId = filterAngkatanId;

  const mahasiswaList = await User.find({ ...baseFilter, statusPendaftaran: "Menunggu Validasi Admin" });
  const validatedCount = await User.countDocuments({ ...baseFilter, statusPendaftaran: "Lulus/Cetak Kartu" });
  const totalPendaftar = await User.countDocuments(baseFilter);

  const settings = await getSettings();

  return NextResponse.json({
    mahasiswaList,
    validatedCount,
    totalPendaftar,
    settings,
    semuaAngkatan,
    angkatanId: filterAngkatanId,
  });
}
