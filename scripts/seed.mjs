import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/pandawa";

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  passwordHash: String,
  role: String,
  namaLengkap: String,
  statusPendaftaran: { type: String, default: "-" },
  angkatanId: { type: mongoose.Schema.Types.ObjectId, ref: "Angkatan" },
}, { timestamps: { createdAt: true, updatedAt: false } });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const accounts = [
    { username: "admin", password: "admin123", role: "admin", namaLengkap: "Administrator PANDAWA" },
    { username: "keuangan", password: "keuangan123", role: "keuangan", namaLengkap: "Staff Keuangan PANDAWA" },
  ];

  for (const acc of accounts) {
    const exists = await User.findOne({ username: acc.username });
    if (exists) {
      console.log(`User "${acc.username}" already exists, skipping.`);
      continue;
    }
    const passwordHash = await bcrypt.hash(acc.password, 10);
    await User.create({ ...acc, passwordHash });
    console.log(`Created ${acc.role}: username="${acc.username}", password="${acc.password}"`);
  }

  console.log("\nDone! You can now login.");
  await mongoose.disconnect();
}

seed().catch(console.error);
