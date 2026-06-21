import path from "path";
import fs from "fs";

const ALLOWED_EXTENSIONS = ["pdf", "png", "jpg", "jpeg"];
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function saveNativeFile(
  file: File,
  subfolder: string,
  nimPrefix: string
): Promise<string | null> {
  if (!file || !file.name) return null;

  // Validate MIME Type
  if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
    return null;
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) return null;

  const newFilename = `${nimPrefix}_${subfolder}.${ext}`;
  const dir = path.join(UPLOAD_DIR, subfolder);
  
  try {
    await fs.promises.access(dir);
  } catch {
    await fs.promises.mkdir(dir, { recursive: true });
  }

  const destPath = path.join(dir, newFilename);
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.promises.writeFile(destPath, buffer);

  return `/uploads/${subfolder}/${newFilename}`;
}
