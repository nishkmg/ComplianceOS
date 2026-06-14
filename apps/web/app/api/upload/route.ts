import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Allowed MIME types and their magic bytes
const ALLOWED_TYPES: Record<string, { mime: string; magic: number[][] }> = {
  jpeg: { mime: "image/jpeg", magic: [[0xff, 0xd8, 0xff]] },
  png: { mime: "image/png", magic: [[0x89, 0x50, 0x4e, 0x47]] },
  webp: { mime: "image/webp", magic: [[0x52, 0x49, 0x46, 0x46]] },
  pdf: { mime: "application/pdf", magic: [[0x25, 0x50, 0x44, 0x46]] },
};

function validateMagicBytes(buffer: Buffer): string | null {
  for (const [ext, { magic }] of Object.entries(ALLOWED_TYPES)) {
    for (const bytes of magic) {
      if (buffer.length >= bytes.length && bytes.every((b, i) => buffer[i] === b)) {
        return ext;
      }
    }
  }
  return null;
}

// ─── In-Memory Rate Limiter ─────────────────────────────────────────────────
// Production: replace with Redis-based rate limiter

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 uploads per minute per tenant

function checkRateLimit(tenantId: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(tenantId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(tenantId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, retryAfterMs: 0 };
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}, 5 * 60 * 1000);

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = (session.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: "No tenant found" }, { status: 400 });
    }

    // Rate limit check
    const { allowed, retryAfterMs } = checkRateLimit(tenantId);
    if (!allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${Math.ceil(retryAfterMs / 1000)}s` },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(retryAfterMs / 1000)),
          },
        }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate actual buffer length matches declared size
    if (buffer.length !== file.size) {
      return NextResponse.json({ error: "File size mismatch" }, { status: 400 });
    }

    // Validate magic bytes
    const ext = validateMagicBytes(buffer);
    if (!ext) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, WEBP, and PDF are allowed." },
        { status: 400 }
      );
    }

    // Sanitize filename
    const sanitized = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/\.{2,}/g, ".")
      .slice(0, 100);

    // Use storage abstraction (local or S3)
    const { uploadFile } = await import("@complianceos/server");
    const result = await uploadFile(buffer, sanitized, tenantId);

    return NextResponse.json({
      fileUrl: result.fileUrl,
      fileSize: result.fileSize,
      fileName: sanitized,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
