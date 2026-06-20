import { NextRequest, NextResponse } from "next/server";
import { IncomingForm, File as FormidableFile } from "formidable";
import path from "path";
import fs from "fs";
import { Readable } from "stream";

const ALLOWED_EXTENSIONS = ["pdf", "png", "jpg", "jpeg"];
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function parseForm(req: NextRequest): Promise<{
  fields: Record<string, string>;
  files: Record<string, FormidableFile>;
}> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      maxFileSize: 10 * 1024 * 1024,
      keepExtensions: true,
    });

    const body = req.body;
    if (!body) {
      reject(new Error("No body"));
      return;
    }

    // Convert Web ReadableStream to Node Readable
    const nodeStream = Readable.fromWeb(body as unknown as import("stream/web").ReadableStream);

    form.parse(nodeStream as unknown as Parameters<typeof form.parse>[0], (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      // Flatten fields (formidable v3 returns arrays)
      const flatFields: Record<string, string> = {};
      for (const [key, val] of Object.entries(fields)) {
        flatFields[key] = Array.isArray(val) ? (val[0] as string) : (val as unknown as string);
      }
      // Flatten files
      const flatFiles: Record<string, FormidableFile> = {};
      for (const [key, val] of Object.entries(files)) {
        if (Array.isArray(val) && val.length > 0) {
          flatFiles[key] = val[0] as FormidableFile;
        } else if (val && !Array.isArray(val)) {
          flatFiles[key] = val as FormidableFile;
        }
      }
      resolve({ fields: flatFields, files: flatFiles });
    });
  });
}

export async function saveFile(
  file: FormidableFile,
  subfolder: string,
  nimPrefix: string
): Promise<string | null> {
  if (!file || !file.originalFilename) return null;

  // Validate MIME Type
  if (file.mimetype !== "application/pdf" && !file.mimetype?.startsWith("image/")) {
    return null;
  }

  const ext = file.originalFilename.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) return null;

  const newFilename = `${nimPrefix}_${subfolder}.${ext}`;
  const dir = path.join(UPLOAD_DIR, subfolder);
  
  try {
    await fs.promises.access(dir);
  } catch {
    await fs.promises.mkdir(dir, { recursive: true });
  }

  const destPath = path.join(dir, newFilename);
  await fs.promises.rename(file.filepath, destPath);

  return `/uploads/${subfolder}/${newFilename}`;
}
