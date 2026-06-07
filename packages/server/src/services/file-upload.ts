import { writeFile, mkdir, readFile, unlink } from "fs/promises";
import { join, resolve } from "path";

// ─── Storage Configuration ──────────────────────────────────────────────────

type StorageDriver = "local" | "supabase";

interface StorageConfig {
  driver: StorageDriver;
  local: { uploadDir: string };
  supabase: {
    url: string;
    serviceRoleKey: string;
    bucket: string;
  };
}

function getConfig(): StorageConfig {
  const driver = (process.env.STORAGE_DRIVER || "local") as StorageDriver;
  return {
    driver,
    local: {
      uploadDir: process.env.UPLOAD_DIR || "/tmp/complianceos/uploads",
    },
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      bucket: process.env.S3_BUCKET || "uploads",
    },
  };
}

// ─── Local Driver ───────────────────────────────────────────────────────────

async function localUpload(buffer: Buffer, fileName: string, tenantId: string) {
  const config = getConfig();
  const dir = join(config.local.uploadDir, tenantId);
  await mkdir(dir, { recursive: true });
  const timestamp = Date.now();
  const filePath = join(dir, `${timestamp}-${fileName}`);
  await writeFile(filePath, buffer);
  return { fileUrl: `/uploads/${tenantId}/${timestamp}-${fileName}`, fileSize: buffer.length };
}

async function localRead(fileUrl: string): Promise<Buffer> {
  const config = getConfig();
  const resolvedDir = resolve(config.local.uploadDir);
  const resolvedPath = resolve(join(config.local.uploadDir, fileUrl.replace("/uploads/", "")));
  if (!resolvedPath.startsWith(resolvedDir + "/") && resolvedPath !== resolvedDir) {
    throw new Error("Invalid path");
  }
  return readFile(resolvedPath);
}

async function localDelete(fileUrl: string): Promise<void> {
  const config = getConfig();
  const resolvedDir = resolve(config.local.uploadDir);
  const resolvedPath = resolve(join(config.local.uploadDir, fileUrl.replace("/uploads/", "")));
  if (!resolvedPath.startsWith(resolvedDir + "/")) throw new Error("Invalid path");
  await unlink(resolvedPath);
}

// ─── Supabase Storage Driver ────────────────────────────────────────────────

async function supabaseUpload(buffer: Buffer, fileName: string, tenantId: string) {
  const config = getConfig();
  const path = `${tenantId}/${Date.now()}-${fileName}`;
  const { url, serviceRoleKey, bucket } = config.supabase;

  // Determine MIME type from extension
  const ext = fileName.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    webp: "image/webp", pdf: "application/pdf",
  };
  const contentType = mimeTypes[ext || ""] || "application/octet-stream";

  const response = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${serviceRoleKey}`,
      "Content-Type": contentType,
      "x-upsert": "false",
    },
    body: new Uint8Array(buffer),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase upload failed (${response.status}): ${body}`);
  }

  const fileUrl = `${url}/storage/v1/object/public/${bucket}/${path}`;
  return { fileUrl, fileSize: buffer.length };
}

async function supabaseRead(fileUrl: string): Promise<Buffer> {
  const config = getConfig();
  // Extract path from public URL
  const publicPrefix = `${config.supabase.url}/storage/v1/object/public/${config.supabase.bucket}/`;
  const path = fileUrl.replace(publicPrefix, "");

  const response = await fetch(`${config.supabase.url}/storage/v1/object/${config.supabase.bucket}/${path}`, {
    headers: { "Authorization": `Bearer ${config.supabase.serviceRoleKey}` },
  });

  if (!response.ok) throw new Error(`Supabase read failed: ${response.status}`);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function supabaseDelete(fileUrl: string): Promise<void> {
  const config = getConfig();
  const publicPrefix = `${config.supabase.url}/storage/v1/object/public/${config.supabase.bucket}/`;
  const path = fileUrl.replace(publicPrefix, "");

  const response = await fetch(`${config.supabase.url}/storage/v1/object/${config.supabase.bucket}/${path}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${config.supabase.serviceRoleKey}` },
  });

  if (!response.ok) throw new Error(`Supabase delete failed: ${response.status}`);
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function uploadFile(
  file: Buffer, fileName: string, tenantId: string
): Promise<{ fileUrl: string; fileSize: number }> {
  const config = getConfig();
  if (config.driver === "supabase") return supabaseUpload(file, fileName, tenantId);
  return localUpload(file, fileName, tenantId);
}

export async function readFileContent(fileUrl: string): Promise<Buffer> {
  const config = getConfig();
  if (config.driver === "supabase") return supabaseRead(fileUrl);
  return localRead(fileUrl);
}

export async function deleteFile(fileUrl: string): Promise<void> {
  const config = getConfig();
  if (config.driver === "supabase") return supabaseDelete(fileUrl);
  return localDelete(fileUrl);
}

export function getFilePath(fileUrl: string): string {
  const config = getConfig();
  if (config.driver === "supabase") return fileUrl;
  return join(config.local.uploadDir, fileUrl.replace("/uploads/", ""));
}
