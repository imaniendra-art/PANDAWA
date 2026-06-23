import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISettings extends Document {
  ketuaPanitia: string;
  nidnKetua: string;

  ketuaPt: string;
  nidnKetuaPt: string;
}

const SettingsSchema = new Schema<ISettings>({
  ketuaPanitia: { type: String, default: "DR. HM. GANTI NAMA, SE., MM." },
  nidnKetua: { type: String, default: "123456789" },

  ketuaPt: { type: String, default: "Prof. Dr. H. Nama Ketua PT, M.Si." },
  nidnKetuaPt: { type: String, default: "987654321" },
});

export const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);

export async function getSettings(): Promise<ISettings> {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
}
