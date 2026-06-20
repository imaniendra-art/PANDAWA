import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, hashPassword } from "@/models/User";
import { Angkatan } from "@/models/Angkatan";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { username, password, namaLengkap } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username dan Password wajib diisi." }, { status: 400 });
    }

    const exists = await User.findOne({ username });
    if (exists) {
      return NextResponse.json({ error: "Username (NIM) sudah terdaftar!" }, { status: 400 });
    }

    const activeAngkatan = await Angkatan.findOne({ isActive: true });
    if (!activeAngkatan) {
      return NextResponse.json(
        { error: "Pendaftaran ditutup karena belum ada Angkatan Wisuda yang aktif. Hubungi Admin." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    await User.create({
      username,
      passwordHash,
      namaLengkap: namaLengkap || null,
      role: "mahasiswa",
      angkatanId: activeAngkatan._id,
    });

    return NextResponse.json({ message: "Registrasi berhasil! Silakan login." });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
