import { NextResponse } from "next/server";
import { getUserFromSession, unauthorized, forbidden } from "@/lib/api-helpers";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function GET(req: Request) {
  try {
    const user = await getUserFromSession();
    if (!user) return unauthorized();
    if (user.role !== "admin" && user.role !== "keuangan") return forbidden();

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token tidak diberikan." }, { status: 400 });
    }

    await connectDB();
    const student = await User.findOne({ qrCodeToken: token });

    if (!student) {
      return NextResponse.json({ error: "Data mahasiswa tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({
      id: student._id,
      username: student.username,
      namaLengkap: student.namaLengkap,
      ukuranToga: student.ukuranToga,
      statusToga: student.statusToga,
      waktuAmbilToga: student.waktuAmbilToga,
    });
  } catch (err: any) {
    console.error("Fetch scan error:", err);
    return NextResponse.json({ error: err.message || "Terjadi kesalahan server." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromSession();
    if (!user) return unauthorized();
    if (user.role !== "admin" && user.role !== "keuangan") return forbidden();

    await connectDB();
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token tidak diberikan." }, { status: 400 });
    }

    const student = await User.findOne({ qrCodeToken: token });

    if (!student) {
      return NextResponse.json({ error: "Data mahasiswa tidak ditemukan." }, { status: 404 });
    }

    if (student.statusToga) {
      return NextResponse.json({ error: "Toga sudah diambil." }, { status: 400 });
    }

    student.statusToga = true;
    student.waktuAmbilToga = new Date();
    await student.save();

    return NextResponse.json({ 
      message: "Toga berhasil diserahkan.", 
      waktuAmbilToga: student.waktuAmbilToga 
    });
  } catch (err: any) {
    console.error("Submit scan error:", err);
    return NextResponse.json({ error: err.message || "Terjadi kesalahan server." }, { status: 500 });
  }
}
