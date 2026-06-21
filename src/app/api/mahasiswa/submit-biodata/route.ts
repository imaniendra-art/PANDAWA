import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, unauthorized, forbidden } from "@/lib/api-helpers";
import { parseForm, saveFile } from "@/lib/upload";
import fs from "fs";
import path from "path";

const toTitleCase = (str: string) => {
  return str.toLowerCase().split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
};

export async function POST(req: NextRequest) {
  console.log("Memulai proses submit biodata...");
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const user = await getUserFromSession();
    if (!user) return unauthorized();
    if (user.role !== "mahasiswa") return forbidden();

    const validStatuses = ["Mengisi Biodata", "Revisi Berkas"];
    if (!validStatuses.includes(user.statusPendaftaran)) {
      return NextResponse.json({ error: "Status tidak valid untuk pengisian biodata." }, { status: 400 });
    }

    const { fields, files } = await parseForm(req);
    console.log("Menerima data:", fields);

    const {
      nama_lengkap,
      nik,
      tempat_lahir,
      tanggal_lahir,
      konsentrasi,
      judul_skripsi,
      ukuran_toga,
    } = fields;

    if (
      !nama_lengkap || !nik || !tempat_lahir || !tanggal_lahir ||
      !konsentrasi || !judul_skripsi || !ukuran_toga
    ) {
      return NextResponse.json(
        { error: "Harap lengkapi semua data biodata." },
        { status: 400 }
      );
    }

    if (!/^\d{16}$/.test(nik)) {
      return NextResponse.json({ error: "NIK harus murni angka dan berjumlah 16 digit." }, { status: 400 });
    }

    const fileKtp = files["file_ktp"];
    const fileIjazahSma = files["file_ijazah_sma"];
    const fileAktaKelahiran = files["file_akta_kelahiran"];

    if (!fileKtp || !fileIjazahSma || !fileAktaKelahiran) {
      return NextResponse.json({ error: "File KTP, Ijazah SMA, dan Akta Kelahiran wajib diunggah." }, { status: 400 });
    }

    const pathKtp = await saveFile(fileKtp, "ktp", `${user.username}_${Date.now()}`);
    const pathIjazah = await saveFile(fileIjazahSma, "ijazah_sma", `${user.username}_${Date.now()}`);
    const pathAkta = await saveFile(fileAktaKelahiran, "akta", `${user.username}_${Date.now()}`);

    if (!pathKtp || !pathIjazah || !pathAkta) {
      return NextResponse.json({ error: "Format file tidak didukung (harus PDF/JPG/PNG)." }, { status: 400 });
    }

    user.namaLengkap = toTitleCase(nama_lengkap);
    user.nik = nik;
    user.tempatLahir = toTitleCase(tempat_lahir);
    user.tanggalLahir = new Date(tanggal_lahir);
    user.konsentrasi = konsentrasi;
    user.judulSkripsi = judul_skripsi;
    user.ukuranToga = ukuran_toga;
    user.fileKtp = pathKtp;
    user.fileIjazahSma = pathIjazah;
    user.fileAktaKelahiran = pathAkta;
    user.statusPendaftaran = "Menunggu Validasi Admin";
    await user.save();

    return NextResponse.json({ message: "Biodata berhasil disimpan! Menunggu validasi dari Admin." });
  } catch (error: any) {
    console.error("Error di API Submit Biodata:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
