import { writeFileSync, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { join, dirname } from "node:path";

// ─── Bucket Constants ──────────────────────────────────────────────────────

export const BUCKETS = {
  INVOICES: "invoices",
  PAYSLIPS: "payslips",
  GST_RETURNS: "gst-returns",
  ITR_RETURNS: "itr-returns",
  REPORTS: "reports",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

// ─── StorageDriver Interface ───────────────────────────────────────────────

export interface StorageDriver {
  upload(bucket: string, path: string, data: Buffer | Uint8Array, contentType: string): Promise<string>;
  signedUrl(bucket: string, path: string, ttlSeconds?: number): Promise<string>;
  delete(bucket: string, path: string): Promise<void>;
  exists(bucket: string, path: string): Promise<boolean>;
}

// ─── Supabase Storage Driver ───────────────────────────────────────────────

export class SupabaseStorageDriver implements StorageDriver {
  constructor(
    private supabaseUrl: string,
    private serviceRoleKey: string,
  ) {}

  async upload(
    bucket: string,
    path: string,
    data: Buffer | Uint8Array,
    contentType: string,
  ): Promise<string> {
    const url = `${this.supabaseUrl}/storage/v1/object/${bucket}/${path}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.serviceRoleKey}`,
        "Content-Type": contentType,
      },
      body: data,
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Supabase upload failed (${res.status}): ${body}`);
    }
    return `${bucket}/${path}`;
  }

  async signedUrl(bucket: string, path: string, ttlSeconds = 3600): Promise<string> {
    const url = `${this.supabaseUrl}/storage/v1/object/sign/${bucket}/${path}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expiresIn: ttlSeconds }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Supabase signed URL failed (${res.status}): ${body}`);
    }
    const data = (await res.json()) as { signedURL: string };
    return data.signedURL;
  }

  async read(bucket: string, path: string): Promise<Buffer> {
    const url = `${this.supabaseUrl}/storage/v1/object/${bucket}/${path}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${this.serviceRoleKey}` },
    });
    if (!res.ok) throw new Error(`Supabase read failed: ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async delete(bucket: string, path: string): Promise<void> {
    const url = `${this.supabaseUrl}/storage/v1/object/${bucket}/${path}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${this.serviceRoleKey}` },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Supabase delete failed (${res.status}): ${body}`);
    }
  }

  async exists(bucket: string, path: string): Promise<boolean> {
    const url = `${this.supabaseUrl}/storage/v1/object/info/${bucket}/${path}`;
    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${this.serviceRoleKey}` },
    });
    return res.ok;
  }
}

// ─── Local Storage Driver (dev only) ───────────────────────────────────────

export class LocalStorageDriver implements StorageDriver {
  constructor(private baseDir: string) {
    if (!existsSync(baseDir)) {
      mkdirSync(baseDir, { recursive: true });
    }
  }

  async upload(
    bucket: string,
    path: string,
    data: Buffer | Uint8Array,
    _contentType: string,
  ): Promise<string> {
    const fullPath = join(this.baseDir, bucket, path);
    const dir = dirname(fullPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(fullPath, data);
    return `${bucket}/${path}`;
  }

  async signedUrl(_bucket: string, _path: string, _ttlSeconds = 3600): Promise<string> {
    return `file://${join(this.baseDir, _bucket, _path)}`;
  }

  async read(bucket: string, path: string): Promise<Buffer> {
    const fullPath = join(this.baseDir, bucket, path);
    if (!existsSync(fullPath)) {
      throw new Error(`Local file not found: ${fullPath}`);
    }
    const { readFileSync } = await import("node:fs");
    return readFileSync(fullPath);
  }

  async delete(bucket: string, path: string): Promise<void> {
    const fullPath = join(this.baseDir, bucket, path);
    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
    }
  }

  async exists(bucket: string, path: string): Promise<boolean> {
    return existsSync(join(this.baseDir, bucket, path));
  }
}

// ─── Factory ───────────────────────────────────────────────────────────────

export function createStorageDriver(): StorageDriver {
  const driver = process.env.STORAGE_DRIVER || "local";
  if (driver === "supabase") {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        "Supabase storage: NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required",
      );
    }
    return new SupabaseStorageDriver(supabaseUrl, serviceRoleKey);
  }
  return new LocalStorageDriver(
    process.env.STORAGE_LOCAL_DIR || process.env.UPLOAD_DIR || "./data/storage",
  );
}
