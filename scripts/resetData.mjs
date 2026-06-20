import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define MONGODB_URI in .env.local");
  process.exit(1);
}

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model("User", UserSchema, "users");

async function reset() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB PANDAWA");

    // The test student is usually one with role "mahasiswa" and perhaps we just wipe their document uploads.
    // For safety, let's update all users with role 'mahasiswa' to clear their uploads 
    // OR we can just reset everything for the demo.
    const result = await User.updateMany(
      { role: "mahasiswa" },
      { 
        $set: { statusPendaftaran: "Belum Mendaftar" },
        $unset: { fileBebasSks: 1, fileBuktiPembayaran: 1, catatanKeuangan: 1, catatanAdmin: 1 } 
      }
    );

    console.log(`Reset ${result.modifiedCount} mahasiswa in PANDAWA`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

reset();
