import { getDb } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Contact form endpoint — used by the marketing contact + demo pages.
 * Enqueues the message into the email queue (durable, worker-drained).
 * RLS: email_queue is tenant-isolated; anonymous marketing traffic inserts
 * under the zero-UUID tenant inside a transaction that sets app.tenant_id
 * (works for both RLS-enforced and owner-bypass connections).
 */
const ANON_TENANT_ID = "00000000-0000-0000-0000-000000000000";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 200) : "";
    const email = typeof body?.email === "string" ? body.email.trim().slice(0, 200) : "";
    const subject = typeof body?.subject === "string" ? body.subject.trim().slice(0, 200) : "Contact form";
    const message = typeof body?.message === "string" ? body.message.trim().slice(0, 5000) : "";

    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Name and a valid email address are required." }, { status: 400 });
    }
    if (!message) {
      return Response.json({ error: "Please include a message." }, { status: 400 });
    }

    const db = getDb();
    const sql = db.$client;
    const supportEmail = process.env.SUPPORT_EMAIL || "hello@arthvahi.in";

    await sql.begin(async (tx: any) => {
      // SET does not accept bind parameters in Postgres — literal only
      await tx.unsafe(`SET app.tenant_id = '${ANON_TENANT_ID}'`);
      await tx.unsafe(
        `INSERT INTO email_queue (tenant_id, "to", subject, body, attachments, status, retry_count, scheduled_at)
         VALUES ($1, $2, $3, $4, '[]', 'pending', 0, now())`,
        [
          ANON_TENANT_ID,
          supportEmail,
          `[Website] ${subject}`,
          `Name: ${name}\nEmail: ${email}\n\n${message}`,
        ],
      );
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("contact route error:", err);
    return Response.json(
      { error: "Could not send your message. Please email hello@arthvahi.in directly." },
      { status: 500 },
    );
  }
}
