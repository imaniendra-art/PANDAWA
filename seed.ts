import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";

// Baca .env.local secara manual karena ini skrip mandiri
const envLocal = fs.readFileSync(".env.local", "utf-8");
const match = envLocal.match(/MONGODB_URI=(.*)/);
const MONGODB_URI = match ? match[1].trim() : "";

if (!MONGODB_URI) {
  console.error("MONGODB_URI tidak ditemukan di .env.local");
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const UserSchema = new mongoose.Schema({
      username: String,
      passwordHash: String,
      role: String,
      statusPendaftaran: String,
    }, { strict: false }); // Gunakan strict:false untuk fleksibilitas
    
    const User = mongoose.models.User || mongoose.model("User", UserSchema);
    
    // 1. Hapus semua user
    await User.deleteMany({});
    
    // 2. Buat Super Admin
    const passwordHash = await bcrypt.hash("admin123", 10);
    await User.create({
      username: "admin@pandawa.com",
      passwordHash,
      role: "admin",
      statusPendaftaran: "-",
    });
    
    // 3. Konfirmasi
    console.log("Database bersih. Akun Admin admin@pandawa.com telah berhasil dibuat.");
    process.exit(0);
  } catch (err) {
    console.error("Terjadi kesalahan:", err);
    process.exit(1);
  }
}

seed();
