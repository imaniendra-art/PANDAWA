import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

async function check() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const users = await db.collection("users").find({ role: "mahasiswa" }).toArray();
  
  console.log("===============================");
  console.log("SELURUH DATA PENDAFTAR (MAHASISWA):");
  users.forEach(u => {
    console.log(`NIM: ${u.username} | Status: "${u.statusPendaftaran}"`);
  });
  console.log("===============================");
  process.exit(0);
}

check();
