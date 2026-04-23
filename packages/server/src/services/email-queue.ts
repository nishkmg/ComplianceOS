// @ts-nocheck
import { eq, and, lte, sql } from "drizzle-orm";
import { createTransport, type Transporter, type SendMailOptions } from "nodemailer";
import * as _db from "../../../db/src/index";
const { emailQueue } = _db;
import type { Database } from "../../../db/src/index";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EmailQueueItem {
  id: string;
  tenantId: string;
  to: string;
  subject: string;
  body: string;
  attachments?: { filename: string; url: string }[] | null;
  status: "pending" | "sent" | "failed";
  retryCount: number;
  errorMessage?: string | null;
  scheduledAt: Date;
  sentAt?: Date | null;
  createdAt: Date;
}

export interface EnqueueEmailInput {
  tenantId: string;
  to: string;
  subject: string;
  body: string;
  attachments?: { filename: string; url: string }[];
  metadata?: Record<string, unknown>;
  scheduledAt?: Date;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SMTP_CONFIG = {
  host: process.env.MAIL_HOST || "localhost",
  port: parseInt(process.env.MAIL_PORT || "587", 10),
  secure: process.env.MAIL_SECURE === "true",
  auth: process.env.MAIL_USER && process.env.MAIL_PASS
    ? {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      }
    : undefined,
};

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 5000, 15000]; // exponential backoff: 1s, 5s, 15s

// ---------------------------------------------------------------------------
// Email Queue Service Class
// ---------------------------------------------------------------------------

export class EmailQueueService {
  private db: Database;
  private transporter: Transporter;

  constructor(db: Database) {
    this.db = db;
    this.transporter = createTransport({
      host: SMTP_CONFIG.host,
      port: SMTP_CONFIG.port,
      secure: SMTP_CONFIG.secure,
      auth: SMTP_CONFIG.auth,
    });
  }

  /**
   * Enqueue email for background sending
   */
  async enqueue(input: EnqueueEmailInput): Promise<string> {
    const scheduledAt = input.scheduledAt || new Date();

    const [result] = await this.db
      .insert(emailQueue)
      .values({
        tenantId: input.tenantId,
        to: input.to,
        subject: input.subject,
        body: input.body,
        attachments: input.attachments || [],
        status: "pending",
        retryCount: 0,
        scheduledAt,
      })
      .returning();

    return result.id;
  }

  /**
   * Get pending emails for processing
   */
  async getPendingEmails(tenantId: string, limit: number = 50): Promise<EmailQueueItem[]> {
    const now = new Date();

    const items = await this.db
      .select()
      .from(emailQueue)
      .where(
        and(
          eq(emailQueue.tenantId, tenantId),
          eq(emailQueue.status, "pending"),
          lte(emailQueue.scheduledAt, now)
        )
      )
      .limit(limit)
      .orderBy(emailQueue.scheduledAt);

    return items;
  }

  /**
   * Process queue - send pending emails
   */
  async processQueue(tenantId: string, limit: number = 50): Promise<{
    success: number;
    failed: number;
  }> {
    const pending = await this.getPendingEmails(tenantId, limit);
    let success = 0;
    let failed = 0;

    for (const item of pending) {
      try {
        await this.sendEmail(item);
        await this.markSent(item.id);
        success++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const shouldRetry = item.retryCount < MAX_RETRIES;

        if (shouldRetry) {
          const nextRetryAt = new Date(Date.now() + RETRY_DELAYS[item.retryCount]);
          await this.db
            .update(emailQueue)
            .set({
              retryCount: item.retryCount + 1,
              errorMessage,
              scheduledAt: nextRetryAt,
            })
            .where(eq(emailQueue.id, item.id));
        } else {
          await this.markFailed(item.id, errorMessage);
        }
        failed++;
      }
    }

    return { success, failed };
  }

  /**
   * Mark email as sent
   */
  async markSent(queueId: string): Promise<void> {
    await this.db
      .update(emailQueue)
      .set({
        status: "sent",
        sentAt: new Date(),
        errorMessage: null,
      })
      .where(eq(emailQueue.id, queueId));
  }

  /**
   * Mark email as failed
   */
  async markFailed(queueId: string, errorMessage: string): Promise<void> {
    await this.db
      .update(emailQueue)
      .set({
        status: "failed",
        errorMessage,
      })
      .where(eq(emailQueue.id, queueId));
  }

  /**
   * Send email via SMTP
   */
  private async sendEmail(item: EmailQueueItem): Promise<void> {
    const mailOptions: SendMailOptions = {
      from: process.env.MAIL_FROM || "noreply@complianceos.com",
      to: item.to,
      subject: item.subject,
      html: item.body,
      attachments: item.attachments?.map((att) => ({
        filename: att.filename,
        path: att.url,
      })),
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Get queue stats for tenant
   */
  async getStats(tenantId: string): Promise<{
    pending: number;
    sent: number;
    failed: number;
  }> {
    const [pending, sent, failed] = await Promise.all([
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(emailQueue)
        .where(and(eq(emailQueue.tenantId, tenantId), eq(emailQueue.status, "pending")))
        .then((r) => Number(r[0]?.count ?? 0)),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(emailQueue)
        .where(and(eq(emailQueue.tenantId, tenantId), eq(emailQueue.status, "sent")))
        .then((r) => Number(r[0]?.count ?? 0)),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(emailQueue)
        .where(and(eq(emailQueue.tenantId, tenantId), eq(emailQueue.status, "failed")))
        .then((r) => Number(r[0]?.count ?? 0)),
    ]);

    return { pending, sent, failed };
  }
}
