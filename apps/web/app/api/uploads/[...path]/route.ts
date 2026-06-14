import { NextResponse } from "next/server";
import { resolve, join } from "path";

export const runtime = "nodejs";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/tmp/complianceos/uploads";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;

    // For S3 storage, redirect to the public URL
    if (process.env.STORAGE_DRIVER === "s3" && process.env.S3_PUBLIC_BASE_URL) {
      const key = path.join("/");
      const publicUrl = `${process.env.S3_PUBLIC_BASE_URL}/${key}`;
      return NextResponse.redirect(publicUrl, 302);
    }

    // Local storage: serve from filesystem with path traversal prevention
    const resolvedDir = resolve(UPLOAD_DIR);
    const resolvedPath = resolve(join(UPLOAD_DIR, ...path));
    if (!resolvedPath.startsWith(resolvedDir + "/") && resolvedPath !== resolvedDir) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const { readFile } = await import("fs/promises");
    const data = await readFile(resolvedPath);

    const ext = path[path.length - 1].split(".").pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      pdf: "application/pdf",
    };

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentTypes[ext || ""] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
