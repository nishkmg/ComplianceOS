import { eq } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { emailQueue } from "@complianceos/db";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EmailJob {
  invoiceId: string;
  pdfUrl: string;
  customerEmail: string;
  customerName: string;
  queuedAt: string;
}

export interface EmailQueueStats {
  pending: number;
  processed: number;
}

// ---------------------------------------------------------------------------
// Redis client (lazy init)
// ---------------------------------------------------------------------------

let _redis: import("ioredis").Redis | null = null;

async function getRedis(): Promise<import("ioredis").Redis> {
  if (_redis) return _redis;
  const { default: Redis } = await import("ioredis");
  const url = process.env.REDIS_URL ?? "redis://localhost:6379";
  _redis = new Redis(url);
  return _redis;
}

const QUEUE_KEY = "complianceos:email:queue";
const PROCESSED_KEY = "complianceos:email:processed";

// ---------------------------------------------------------------------------
// Queue email job
// ---------------------------------------------------------------------------

export async function queueEmail(
  invoiceId: string,
  pdfUrl: string,
  customerEmail: string,
  customerName: string,
): Promise<void> {
  const job: EmailJob = {
    invoiceId,
    pdfUrl,
    customerEmail,
    customerName,
    queuedAt: new Date().toISOString(),
  };

  const redis = await getRedis();
  await redis.lpush(QUEUE_KEY, JSON.stringify(job));

  console.log(`[email-queue] Queued email job for invoice ${invoiceId}`, {
    customerEmail,
    customerName,
    pdfUrl,
  });
}

// ---------------------------------------------------------------------------
// Process email queue (stub worker)
// ---------------------------------------------------------------------------

export async function processEmailQueue(): Promise<void> {
  const redis = await getRedis();

  while (true) {
    // Blocking pop with 5-second timeout
    const result = await redis.brpop(QUEUE_KEY, 5);
    if (!result) continue;

    const raw = result[1];
    let job: EmailJob;
    try {
      job = JSON.parse(raw) as EmailJob;
    } catch {
      console.error("[email-queue] Failed to parse job:", raw);
      continue;
    }

    try {
      // Stub: in real impl call SendGrid/Resend API here
      console.log(`[email-queue] Sending email to ${job.customerEmail} for invoice ${job.invoiceId}`);
      console.log(`[email-queue] PDF URL: ${job.pdfUrl}`);

      // Simulate async send delay
      await new Promise((r) => setTimeout(r, 500));

      console.log(`[email-queue] Email sent successfully to ${job.customerEmail}`);

      // Record processed count
      await redis.hincrby(PROCESSED_KEY, "count", 1);
    } catch (err) {
      console.error(`[email-queue] Failed to send email for invoice ${job.invoiceId}:`, err);
      // Re-queue for retry
      await redis.lpush(QUEUE_KEY, raw);
    }
  }
}

// ---------------------------------------------------------------------------
// Queue stats
// ---------------------------------------------------------------------------

export async function getEmailQueueStats(): Promise<EmailQueueStats> {
  const redis = await getRedis();
  const [pending, processedStr] = await Promise.all([
    redis.llen(QUEUE_KEY),
    redis.hget(PROCESSED_KEY, "count"),
  ]);
  return {
    pending,
    processed: parseInt(processedStr ?? "0", 10),
  };
}

// ---------------------------------------------------------------------------
// Persist email job to DB (for audit/history)
// ---------------------------------------------------------------------------

export async function persistEmailJob(db: Database, job: EmailJob): Promise<void> {
  await db.insert(emailQueue).values({
    invoiceId: job.invoiceId,
    customerEmail: job.customerEmail,
    customerName: job.customerName,
    pdfUrl: job.pdfUrl,
    status: "queued",
    queuedAt: new Date(job.queuedAt),
  });
}

export async function updateEmailJobStatus(
  db: Database,
  invoiceId: string,
  status: "queued" | "sent" | "failed",
): Promise<void> {
  await db.update(emailQueue)
    .set({ status, sentAt: status === "sent" ? new Date() : undefined })
    .where(eq(emailQueue.invoiceId, invoiceId));
}
