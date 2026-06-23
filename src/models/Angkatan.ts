import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAngkatan extends Document {
  nama: string;
  tanggalWisuda: Date | null;
  biaya: number;
  isActive: boolean;
  createdAt: Date;
}

const AngkatanSchema = new Schema<IAngkatan>(
  {
    nama: { type: String, required: true, unique: true },
    tanggalWisuda: { type: Date, default: null },
    biaya: { type: Number, required: true },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Angkatan: Model<IAngkatan> =
  mongoose.models.Angkatan || mongoose.model<IAngkatan>("Angkatan", AngkatanSchema);
