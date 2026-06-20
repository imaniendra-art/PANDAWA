import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, unauthorized, forbidden } from "@/lib/api-helpers";
import { parseForm, saveFile } from "@/lib/upload";

export async function POST(req: NextRequest) {
  const user = await getUserFromSession();
  if (!user) return unauthorized();
  if (user.role !== "mahasiswa") return forbidden();

  const validStatuses = ["Belum Mendaftar", "Revisi Pembayaran"];
  if (!validStatuses.includes(user.statusPendaftaran)) {
    return NextResponse.json({ error: "Status tidak valid untuk upload tahap 1." }, { status: 400 });
  }

  try {
    const { files } = await parseForm(req);

    const fileBebasSks = files["file_bebas_sks"];
    const fileBuktiPembayaran = files["file_bukti_pembayaran"];

    if (!fileBebasSks || !fileBuktiPembayaran) {
      return NextResponse.json({ error: "Kedua file wajib diunggah." }, { status: 400 });
    }

    const pathSks = saveFile(fileBebasSks, "bukti_bebas_sks", user.username);
    const pathBayar = saveFile(fileBuktiPembayaran, "bukti_pembayaran", user.username);

    if (!pathSks || !pathBayar) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Harap unggah gambar atau PDF." },
        { status: 400 }
      );
    }

    user.fileBebasSks = pathSks;
    user.fileBuktiPembayaran = pathBayar;
    user.statusPendaftaran = "Menunggu Validasi Keuangan";
    user.catatanKeuangan = null;
    await user.save();

    return NextResponse.json({ message: "Dokumen awal berhasil diunggah! Menunggu validasi dari bagian Keuangan." });
  } catch (err) {
    console.error("Upload tahap 1 error:", err);
    return NextResponse.json({ error: "Gagal mengunggah file." }, { status: 500 });
  }
}
