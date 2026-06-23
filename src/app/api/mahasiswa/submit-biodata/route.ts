import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, unauthorized, forbidden } from "@/lib/api-helpers";
import { promises as fsPromises } from "fs";
import fs from "fs";
import path from "path";

const toTitleCase = (str: string) => {
  return str.toLowerCase().split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
};

async function saveFileNative(file: File, prefix: string, nim: string) {
  const allowed = ["pdf", "png", "jpg", "jpeg"];
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || !allowed.includes(ext)) return null;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = `${nim}_${prefix}_${Date.now()}.${ext}`;
  const uploadDir = path.join(process.cwd(), 'public/uploads', prefix);
  
  await fsPromises.mkdir(uploadDir, { recursive: true });
  
  const filePath = path.join(uploadDir, fileName);
  await fsPromises.writeFile(filePath, buffer);
  return `/uploads/${prefix}/${fileName}`;
}

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

    const formData = await req.formData();
    console.log("Menerima form data entries...");

    const nama_lengkap = formData.get('nama_lengkap') as string;
    const nik = formData.get('nik') as string;
    const tempat_lahir = formData.get('tempat_lahir') as string;
    const tanggal_lahir = formData.get('tanggal_lahir') as string;
    const konsentrasi = formData.get('konsentrasi') as string;
    const judul_skripsi = formData.get('judul_skripsi') as string;
    const ukuran_toga = formData.get('ukuran_toga') as string;

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

    const fileKtp = formData.get('file_ktp') as File | null;
    const fileIjazahSma = formData.get('file_ijazah_sma') as File | null;
    const fileAktaKelahiran = formData.get('file_akta_kelahiran') as File | null;
    const fileFoto = formData.get('file_foto') as File | null;

    if (!fileKtp || !fileIjazahSma || !fileAktaKelahiran || !fileFoto) {
      return NextResponse.json({ error: "File KTP, Ijazah SMA, Akta Kelahiran, dan Pas Foto wajib diunggah." }, { status: 400 });
    }

    const pathKtp = await saveFileNative(fileKtp, "ktp", user.username);
    const pathIjazah = await saveFileNative(fileIjazahSma, "ijazah_sma", user.username);
    const pathAkta = await saveFileNative(fileAktaKelahiran, "akta", user.username);
    const pathFoto = await saveFileNative(fileFoto, "foto", user.username);

    if (!pathKtp || !pathIjazah || !pathAkta || !pathFoto) {
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
    user.fileFotoUrl = pathFoto;
    user.statusPendaftaran = "Menunggu Validasi Admin";
    await user.save();

    return NextResponse.json({ message: "Biodata berhasil disimpan! Menunggu validasi dari Admin." });
  } catch (error: any) {
    console.error("Error di API Submit Biodata:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
