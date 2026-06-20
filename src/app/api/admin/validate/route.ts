import { NextResponse } from "next/server";
import { getUserFromSession, unauthorized, forbidden } from "@/lib/api-helpers";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function POST(req: Request) {
  const user = await getUserFromSession();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();

  await connectDB();
  const { studentId, action, catatanAdmin } = await req.json();

  if (!studentId || !action) {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }

  const student = await User.findById(studentId);
  if (!student) {
    return NextResponse.json({ error: "Mahasiswa tidak ditemukan." }, { status: 404 });
  }

  if (action === "approve") {
    student.statusPendaftaran = "Lulus/Cetak Kartu";
    student.catatanAdmin = null;
    if (!student.qrCodeToken) {
      student.qrCodeToken = crypto.randomUUID();
    }
  } else if (action === "reject") {
    student.statusPendaftaran = "Revisi Berkas";
    student.catatanAdmin = catatanAdmin || null;
  } else if (action === "reject_nama") {
    student.statusPendaftaran = "Revisi Beda Nama";
    student.fileSuratPernyataan = null;
    student.catatanAdmin =
      "Terdapat perbedaan nama antara KTP dan Ijazah. Silakan setujui Surat Pernyataan otomatis di dashboard Anda.";
  } else {
    return NextResponse.json({ error: "Aksi tidak valid." }, { status: 400 });
  }

  await student.save();
  return NextResponse.json({ message: `Aksi ${action} berhasil untuk ${student.namaLengkap || student.username}.` });
}
