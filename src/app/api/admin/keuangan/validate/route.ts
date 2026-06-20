import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, unauthorized, forbidden } from "@/lib/api-helpers";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  const user = await getUserFromSession();
  if (!user) return unauthorized();
  if (user.role !== "keuangan") return NextResponse.json({ error: "Hanya Admin Keuangan yang dapat memvalidasi pembayaran" }, { status: 403 });

  try {
    const { studentId, action, catatanKeuangan } = await req.json();

    if (!studentId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const mahasiswa = await User.findById(studentId);
    if (!mahasiswa) {
      return NextResponse.json({ error: "Mahasiswa not found" }, { status: 404 });
    }

    if (action === "approve") {
      mahasiswa.statusPendaftaran = "Mengisi Biodata"; // Pindah ke tahap 2
      mahasiswa.catatanKeuangan = "Validasi pembayaran berhasil oleh Admin Keuangan.";
    } else if (action === "reject") {
      mahasiswa.statusPendaftaran = "Revisi Pembayaran";
      mahasiswa.catatanKeuangan = catatanKeuangan || "Mohon unggah ulang bukti pembayaran yang valid.";
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await mahasiswa.save();
    return NextResponse.json({ message: "Status mahasiswa berhasil diperbarui" });
  } catch (error: any) {
    console.error("Validasi Keuangan Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
