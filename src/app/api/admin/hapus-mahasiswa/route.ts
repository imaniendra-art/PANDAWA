import { NextResponse } from "next/server";
import { getUserFromSession, unauthorized, forbidden } from "@/lib/api-helpers";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import fs from "fs";
import path from "path";

function deleteFileIfExists(filePath: string | null) {
  if (!filePath || filePath === "AUTO") return;
  const fullPath = path.join(process.cwd(), "public", filePath);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch {
      // ignore
    }
  }
}

export async function POST(req: Request) {
  const user = await getUserFromSession();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();

  await connectDB();
  const { studentId } = await req.json();

  if (!studentId) return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });

  const student = await User.findById(studentId);
  if (!student) return NextResponse.json({ error: "Mahasiswa tidak ditemukan." }, { status: 404 });
  if (student.role !== "mahasiswa") return NextResponse.json({ error: "Hanya akun mahasiswa yang dapat dihapus." }, { status: 400 });

  const namaMhs = student.namaLengkap || student.username;

  deleteFileIfExists(student.fileBebasSks);
  deleteFileIfExists(student.fileBuktiPembayaran);
  deleteFileIfExists(student.fileKtp);
  deleteFileIfExists(student.fileIjazahSma);
  deleteFileIfExists(student.fileAktaKelahiran);
  if (student.fileSuratPernyataan && student.fileSuratPernyataan !== "AUTO") {
    deleteFileIfExists(student.fileSuratPernyataan);
  }

  await User.findByIdAndDelete(studentId);

  return NextResponse.json({
    message: `Akun mahasiswa ${namaMhs} beserta berkas-berkasnya berhasil dihapus permanen.`,
  });
}
