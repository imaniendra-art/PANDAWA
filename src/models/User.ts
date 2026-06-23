import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "mahasiswa" | "admin" | "keuangan";

export type StatusPendaftaran =
  | "Belum Mendaftar"
  | "Menunggu Validasi Keuangan"
  | "Revisi Pembayaran"
  | "Pembayaran Dikonfirmasi"
  | "Mengisi Biodata"
  | "Menunggu Validasi Admin"
  | "Revisi Berkas"
  | "Revisi Beda Nama"
  | "Lulus/Cetak Kartu"
  | "-";

export interface IUser extends Document {
  username: string;
  passwordHash: string;
  role: UserRole;
  namaLengkap: string | null;

  // Tahap 1
  fileBebasSks: string | null;
  fileBuktiPembayaran: string | null;
  catatanKeuangan: string | null;

  // Tahap 2 - Biodata
  nik: string | null;
  tempatLahir: string | null;
  tanggalLahir: Date | null;
  konsentrasi: string | null;
  judulSkripsi: string | null;
  ukuranToga: string | null;
  ukuranKaos: string | null;
  fileKtp: string | null;
  fileIjazahSma: string | null;
  fileAktaKelahiran: string | null;
  fileFotoUrl: string | null;

  // Admin
  catatanAdmin: string | null;
  fileSuratPernyataan: string | null;

  statusPendaftaran: StatusPendaftaran;
  angkatanId: mongoose.Types.ObjectId | null;

  // Toga
  statusToga: boolean;
  waktuAmbilToga: Date | null;
  qrCodeToken: string | null;

  createdAt: Date;

  checkPassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["mahasiswa", "admin", "keuangan"], default: "mahasiswa" },
    namaLengkap: { type: String, default: null },

    fileBebasSks: { type: String, default: null },
    fileBuktiPembayaran: { type: String, default: null },
    catatanKeuangan: { type: String, default: null },

    nik: { type: String, default: null },
    tempatLahir: { type: String, default: null },
    tanggalLahir: { type: Date, default: null },
    konsentrasi: { type: String, default: null },
    judulSkripsi: { type: String, default: null },
    ukuranToga: { type: String, default: null },
    ukuranKaos: { type: String, default: null },
    fileKtp: { type: String, default: null },
    fileIjazahSma: { type: String, default: null },
    fileAktaKelahiran: { type: String, default: null },
    fileFotoUrl: { type: String, default: null },

    catatanAdmin: { type: String, default: null },
    fileSuratPernyataan: { type: String, default: null },

    statusPendaftaran: {
      type: String,
      enum: [
        "Belum Mendaftar",
        "Menunggu Validasi Keuangan",
        "Revisi Pembayaran",
        "Pembayaran Dikonfirmasi",
        "Mengisi Biodata",
        "Menunggu Validasi Admin",
        "Revisi Berkas",
        "Revisi Beda Nama",
        "Lulus/Cetak Kartu",
        "-",
      ],
      default: "Belum Mendaftar",
    },
    angkatanId: { type: Schema.Types.ObjectId, ref: "Angkatan", default: null },
    statusToga: { type: Boolean, default: false },
    waktuAmbilToga: { type: Date, default: null },
    qrCodeToken: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

UserSchema.methods.checkPassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
