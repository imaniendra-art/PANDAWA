import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, unauthorized, forbidden } from "@/lib/api-helpers";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Angkatan } from "@/models/Angkatan";

export async function GET(req: NextRequest) {
  const user = await getUserFromSession();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();

  await connectDB();
  const angkatanId = req.nextUrl.searchParams.get("angkatanId");
  const activeAngkatan = await Angkatan.findOne({ isActive: true });
  const filterAngkatanId = angkatanId || activeAngkatan?._id?.toString();

  const semuaAngkatan = await Angkatan.find().sort({ _id: 1 });

  const baseFilter: Record<string, unknown> = { role: "mahasiswa" };
  if (filterAngkatanId) baseFilter.angkatanId = filterAngkatanId;

  const mahasiswaList = await User.find(baseFilter).sort({ _id: -1 });

  return NextResponse.json({
    mahasiswaList,
    semuaAngkatan,
    angkatanId: filterAngkatanId,
  });
}
