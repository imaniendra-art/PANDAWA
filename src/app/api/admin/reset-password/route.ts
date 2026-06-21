import { NextResponse } from "next/server";
import { getUserFromSession, unauthorized, forbidden } from "@/lib/api-helpers";
import { connectDB } from "@/lib/db";
import { User, hashPassword } from "@/models/User";

export async function POST(req: Request) {
  try {
    const user = await getUserFromSession();
    if (!user) return unauthorized();
    if (user.role !== "admin") return forbidden();

    await connectDB();
    const { studentId } = await req.json();

    if (!studentId) return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });

    const student = await User.findById(studentId);
    if (!student) return NextResponse.json({ error: "Mahasiswa tidak ditemukan." }, { status: 404 });
    if (student.role !== "mahasiswa") return NextResponse.json({ error: "Hanya kata sandi mahasiswa yang dapat di-reset." }, { status: 400 });

    student.passwordHash = await hashPassword("123456");
    await student.save();

    return NextResponse.json({
      message: `Kata sandi untuk ${student.namaLengkap || student.username} (${student.username}) berhasil di-reset menjadi "123456".`,
    });
  } catch (error: any) {
    console.error("POST admin reset-password error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
