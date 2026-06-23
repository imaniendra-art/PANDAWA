import { NextResponse } from "next/server";
import { getUserFromSession, unauthorized, forbidden } from "@/lib/api-helpers";
import { User } from "@/models/User";
import { getSettings } from "@/models/Settings";

export async function GET() {
  try {
    const user = await getUserFromSession();
    if (!user) return unauthorized();
    if (user.role !== "mahasiswa") return forbidden();

    const nomorUrut =
      user.statusPendaftaran === "Lulus/Cetak Kartu"
        ? await User.countDocuments({
            role: "mahasiswa",
            statusPendaftaran: "Lulus/Cetak Kartu",
            _id: { $lte: user._id },
          })
        : null;

    if (user.statusPendaftaran === "Lulus/Cetak Kartu" && !user.qrCodeToken) {
      user.qrCodeToken = crypto.randomUUID();
      await user.save();
    }

    const settings = await getSettings();

    const data = {
      id: user._id,
      username: user.username,
      namaLengkap: user.namaLengkap,
      statusPendaftaran: user.statusPendaftaran,
      fileBebasSks: user.fileBebasSks,
      fileBuktiPembayaran: user.fileBuktiPembayaran,
      catatanKeuangan: user.catatanKeuangan,
      nik: user.nik,
      tempatLahir: user.tempatLahir,
      tanggalLahir: user.tanggalLahir,
      konsentrasi: user.konsentrasi,
      judulSkripsi: user.judulSkripsi,
      ukuranToga: user.ukuranToga,
      ukuranKaos: user.ukuranKaos,
      fileKtp: user.fileKtp,
      fileIjazahSma: user.fileIjazahSma,
      fileAktaKelahiran: user.fileAktaKelahiran,
      fileFotoUrl: user.fileFotoUrl,
      catatanAdmin: user.catatanAdmin,
      fileSuratPernyataan: user.fileSuratPernyataan,
      statusToga: user.statusToga,
      waktuAmbilToga: user.waktuAmbilToga,
      qrCodeToken: user.qrCodeToken,
      nomorUrut,
      createdAt: user.createdAt,
      ketuaPanitia: settings.ketuaPanitia,
      nidnKetua: settings.nidnKetua,
    };

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("GET mahasiswa me error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
