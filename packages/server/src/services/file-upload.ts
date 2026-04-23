// @ts-nocheck
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/tmp/complianceos/uploads";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function uploadFile(
  file: Buffer,
  fileName: string,
  tenantId: string,
): Promise<{ fileUrl: string; fileSize: number }> {
  if (file.length > MAX_FILE_SIZE) {
    throw new Error("File too large");
  }
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const timestamp = Date.now();
  const dir = join(UPLOAD_DIR, tenantId);
  await mkdir(dir, { recursive: true });
  const filePath = join(dir, `${timestamp}-${sanitized}`);
  await writeFile(filePath, file);
  const fileUrl = `/uploads/${tenantId}/${timestamp}-${sanitized}`;
  return { fileUrl, fileSize: file.length };
}

export function getFilePath(fileUrl: string): string {
  return join(UPLOAD_DIR, fileUrl.replace("/uploads/", ""));
}
