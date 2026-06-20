import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, unauthorized, forbidden } from "@/lib/api-helpers";
import { connectDB } from "@/lib/db";
import { Angkatan } from "@/models/Angkatan";
import { User } from "@/models/User";
import { BukuKas } from "@/models/BukuKas";

export async function GET() {
  const user = await getUserFromSession();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();

  await connectDB();
  const angkatanList = await Angkatan.find().sort({ _id: 1 });

  const listWithCounts = await Promise.all(
    angkatanList.map(async (a) => ({
      ...a.toObject(),
      totalMahasiswa: await User.countDocuments({ role: "mahasiswa", angkatanId: a._id }),
    }))
  );

  return NextResponse.json(listWithCounts);
}

export async function POST(req: Request) {
  const user = await getUserFromSession();
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();

  await connectDB();
  const { id, nama, tanggalWisuda, biaya, action } = await req.json();

  if (action === "delete") {
    if (!id) return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
    const angkatan = await Angkatan.findById(id);
    if (!angkatan) return NextResponse.json({ error: "Angkatan tidak ditemukan." }, { status: 404 });
    if (angkatan.isActive) return NextResponse.json({ error: "Tidak dapat menghapus Angkatan yang sedang Aktif." }, { status: 400 });

    const userCount = await User.countDocuments({ angkatanId: id });
    const kasCount = await BukuKas.countDocuments({ angkatanId: id });
    if (userCount > 0 || kasCount > 0) {
      return NextResponse.json(
        { error: `Tidak dapat menghapus Angkatan ${angkatan.nama} karena masih memiliki ${userCount} mahasiswa dan ${kasCount} data kas.` },
        { status: 400 }
      );
    }

    await Angkatan.findByIdAndDelete(id);
    return NextResponse.json({ message: `Angkatan ${angkatan.nama} berhasil dihapus.` });
  }

  if (action === "set_active") {
    if (!id) return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
    await Angkatan.updateMany({}, { isActive: false });
    const angkatan = await Angkatan.findById(id);
    if (!angkatan) return NextResponse.json({ error: "Angkatan tidak ditemukan." }, { status: 404 });
    angkatan.isActive = true;
    await angkatan.save();
    return NextResponse.json({ message: `${angkatan.nama} telah di-set sebagai Angkatan Aktif.` });
  }

  // Create or update
  if (!nama || !tanggalWisuda || !biaya || biaya <= 0) {
    return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
  }

  const tanggalWisudaDate = new Date(tanggalWisuda);

  if (id) {
    // Update
    const angkatan = await Angkatan.findById(id);
    if (!angkatan) return NextResponse.json({ error: "Angkatan tidak ditemukan." }, { status: 404 });

    const exists = await Angkatan.findOne({ nama, _id: { $ne: id } });
    if (exists) return NextResponse.json({ error: "Nama Angkatan sudah dipakai!" }, { status: 400 });

    angkatan.nama = nama;
    angkatan.tanggalWisuda = tanggalWisudaDate;
    angkatan.biaya = biaya;
    await angkatan.save();
    return NextResponse.json({ message: "Data Angkatan berhasil diperbarui." });
  } else {
    // Create
    const exists = await Angkatan.findOne({ nama });
    if (exists) return NextResponse.json({ error: "Nama Angkatan sudah ada!" }, { status: 400 });

    const newAngkatan = await Angkatan.create({ nama, tanggalWisuda: tanggalWisudaDate, biaya });

    const totalAngkatan = await Angkatan.countDocuments();
    if (totalAngkatan === 1) {
      newAngkatan.isActive = true;
      await newAngkatan.save();
    }

    return NextResponse.json({ message: "Angkatan berhasil ditambahkan." });
  }
}
