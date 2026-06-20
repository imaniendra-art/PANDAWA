import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBukuKas extends Document {
  jenis: "Pemasukan" | "Pengeluaran";
  tanggal: Date;
  jumlah: number;
  keterangan: string;
  buktiFile: string | null;
  createdBy: mongoose.Types.ObjectId;
  angkatanId: mongoose.Types.ObjectId | null;
  createdAt: Date;
}

const BukuKasSchema = new Schema<IBukuKas>(
  {
    jenis: { type: String, enum: ["Pemasukan", "Pengeluaran"], required: true },
    tanggal: { type: Date, required: true, default: Date.now },
    jumlah: { type: Number, required: true },
    keterangan: { type: String, required: true },
    buktiFile: { type: String, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    angkatanId: { type: Schema.Types.ObjectId, ref: "Angkatan", default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const BukuKas: Model<IBukuKas> =
  mongoose.models.BukuKas || mongoose.model<IBukuKas>("BukuKas", BukuKasSchema);
