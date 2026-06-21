import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, unauthorized, forbidden } from "@/lib/api-helpers";
import { saveNativeFile } from "@/lib/upload";

export async function POST(req: NextRequest) {
  const user = await getUserFromSession();
  if (!user) return unauthorized();
  if (user.role !== "mahasiswa") return forbidden();

  const validStatuses = ["Belum Mendaftar", "Revisi Pembayaran"];
  if (!validStatuses.includes(user.statusPendaftaran)) {
    return NextResponse.json({ error: "Status tidak valid untuk upload tahap 1." }, { status: 400 });
  }

  try {
    const formData = await req.formData();
    console.log("Data diterima:", Array.from(formData.keys()));
    
    const fileBebasSks = formData.get("file_bebas_sks") as File | null;
    const fileBuktiPembayaran = formData.get("file_bukti_pembayaran") as File | null;

    if (!fileBebasSks || !fileBuktiPembayaran || typeof fileBebasSks === "string" || typeof fileBuktiPembayaran === "string") {
      return NextResponse.json({ error: "Kedua file wajib diunggah." }, { status: 400 });
    }

    const pathSks = await saveNativeFile(fileBebasSks, "bukti_bebas_sks", user.username);
    const pathBayar = await saveNativeFile(fileBuktiPembayaran, "bukti_pembayaran", user.username);

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

    // Trigger webhook ke FINARA secara asynchronous (tidak perlu await)
    const finaraUrl = process.env.FINARA_API_URL || "http://localhost:3000/api/finara/keuangan-wisuda";
    console.log("Mengirim data ke FINARA untuk NIM:", user.username);
    console.log("Mencoba kirim ke:", finaraUrl);
    
    const payload = {
      nim: user.username,
      nama: user.namaLengkap || user.username,
      wisuda_ke: (user.angkatanId as any)?.nama || "Semua",
      status_pembayaran: user.statusPendaftaran,
    };
    
    console.log("Request Body yang dikirim:", JSON.stringify(payload, null, 2));
    
    fetch(finaraUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.PANDAWA_FINARA_SECRET || "pandawa-secret-key-123",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        console.log("Status Respon dari FINARA:", response.status);
      })
      .catch((err) => console.error("Gagal webhook ke FINARA:", err));

    return NextResponse.json({ message: "Dokumen awal berhasil diunggah! Menunggu validasi dari bagian Keuangan." });
  } catch (err) {
    console.error("Upload tahap 1 error:", err);
    return NextResponse.json({ error: "Gagal mengunggah file. Silakan coba lagi." }, { status: 500 });
  }
}
