import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, unauthorized, forbidden } from "@/lib/api-helpers";
import { connectDB } from "@/lib/db";
import { BukuKas } from "@/models/BukuKas";
import { User } from "@/models/User";
import { Angkatan } from "@/models/Angkatan";

export async function GET(req: NextRequest) {
  try {
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

    const baseFilter: Record<string, unknown> = {};
    if (filterAngkatanId) baseFilter.angkatanId = filterAngkatanId;

    const transaksiList = await BukuKas.find(baseFilter).sort({ tanggal: -1, createdAt: -1 });

    const userFilter: Record<string, unknown> = { role: "mahasiswa" };
    if (filterAngkatanId) userFilter.angkatanId = filterAngkatanId;

    const validatedCount = await User.countDocuments({
      ...userFilter,
      statusPendaftaran: { $nin: ["Belum Mendaftar", "Revisi Pembayaran", "Menunggu Validasi Keuangan", "-"] },
    });

    const biayaPerMhs = selectedAngkatan?.biaya || 0;
    const pemasukanPendaftaran = validatedCount * biayaPerMhs;
    const pemasukanManual = transaksiList
      .filter((t) => t.jenis === "Pemasukan")
      .reduce((sum, t) => sum + t.jumlah, 0);
    const pengeluaran = transaksiList
      .filter((t) => t.jenis === "Pengeluaran")
      .reduce((sum, t) => sum + t.jumlah, 0);
    const saldoAkhir = pemasukanPendaftaran + pemasukanManual - pengeluaran;

    return NextResponse.json({
      transaksiList,
      pemasukanPendaftaran,
      pemasukanManual,
      pengeluaran,
      saldoAkhir,
      semuaAngkatan,
      angkatanId: filterAngkatanId,
    });
  } catch (error: any) {
    console.error("GET buku-kas error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromSession();
    if (!user) return unauthorized();
    if (user.role !== "keuangan") return forbidden();

    await connectDB();
    const { jenis, jumlah, keterangan, tanggal, angkatanId } = await req.json();

    if (!jenis || !jumlah || jumlah <= 0 || !keterangan) {
      return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
    }

    await BukuKas.create({
      jenis,
      jumlah,
      keterangan,
      tanggal: tanggal ? new Date(tanggal) : new Date(),
      createdBy: user._id,
      angkatanId: angkatanId || null,
    });

    return NextResponse.json({ message: "Transaksi Kas berhasil ditambahkan!" });
  } catch (error: any) {
    console.error("POST buku-kas error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
