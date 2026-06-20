import { NextResponse } from "next/server";
import { getUserFromSession, unauthorized, forbidden } from "@/lib/api-helpers";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function POST(req: Request) {
  const user = await getUserFromSession();
  if (!user) return unauthorized();
  if (user.role !== "keuangan") return forbidden();

  await connectDB();
  const { studentId, action, catatanKeuangan } = await req.json();

  if (!studentId || !action) {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }

  const student = await User.findById(studentId);
  if (!student) {
    return NextResponse.json({ error: "Mahasiswa tidak ditemukan." }, { status: 404 });
  }

  if (action === "approve") {
    const shouldLulus = ["Menunggu Validasi Panitia", "Lulus/Cetak Kartu"].includes(student.statusPendaftaran);
    student.statusPendaftaran = shouldLulus ? "Lulus/Cetak Kartu" : "Mengisi Biodata";
    student.catatanKeuangan = catatanKeuangan || null;
  } else if (action === "reject") {
    if (!catatanKeuangan || catatanKeuangan.trim() === "") {
      return NextResponse.json({ error: "Catatan revisi wajib diisi jika menolak dokumen!" }, { status: 400 });
    }
    student.statusPendaftaran = "Revisi Pembayaran";
    student.catatanKeuangan = catatanKeuangan;
  } else {
    return NextResponse.json({ error: "Aksi tidak valid." }, { status: 400 });
  }

  await student.save();
  return NextResponse.json({ message: `Dokumen mahasiswa ${student.namaLengkap || student.username} berhasil diproses.` });
}
