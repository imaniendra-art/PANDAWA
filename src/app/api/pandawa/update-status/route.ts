import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

const API_KEY = process.env.PANDAWA_FINARA_SECRET || "pandawa-secret-key-123";

function authorize(request: Request) {
  const key = request.headers.get("x-api-key");
  if (key !== API_KEY) {
    return false;
  }
  return true;
}

export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { nim, status } = data;

    if (!nim || !status) {
      return NextResponse.json({ error: "NIM and status are required" }, { status: 400 });
    }

    await connectDB();

    const mahasiswa = await User.findOne({ username: nim });
    if (!mahasiswa) {
      return NextResponse.json({ error: "Mahasiswa not found" }, { status: 404 });
    }

    if (status === "posted") {
      mahasiswa.statusPendaftaran = "Pembayaran Dikonfirmasi";
      // Auto-validate and move to next step in PANDAWA
      mahasiswa.catatanKeuangan = "Pembayaran telah divalidasi oleh sistem keuangan FINARA.";
      await mahasiswa.save();
    }

    return NextResponse.json({ message: "Status updated successfully in PANDAWA" });
  } catch (error) {
    console.error("PANDAWA Webhook Error:", error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}
