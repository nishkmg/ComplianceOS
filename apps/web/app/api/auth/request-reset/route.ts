import { getDb } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users, userTenants } from "@complianceos/db";
import {
  createPasswordResetToken,
  appBaseUrl,
  EmailQueueService,
} from "@complianceos/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || !String(email).includes("@")) {
      return Response.json({ error: "Valid email required" }, { status: 400 });
    }

    const db = getDb();
    const normalized = String(email).toLowerCase();

    const [user] = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
    if (!user) {
      // No account enumeration — same shape as success without a link.
      return Response.json({ ok: true, link: null });
    }

    const token = await createPasswordResetToken(db, user.id, 60 * 60 * 1000); // 1h
    const link = `${appBaseUrl()}/reset-password?token=${token}`;

    const [membership] = await db
      .select({ tenantId: userTenants.tenantId })
      .from(userTenants)
      .where(eq(userTenants.userId, user.id))
      .limit(1);

    if (membership) {
      try {
        const mail = new EmailQueueService(db);
        await mail.enqueue({
          tenantId: membership.tenantId,
          to: normalized,
          subject: "Reset your Arthvahi password",
          body: `Reset your password here: ${link}`,
          metadata: { kind: "password-reset" },
        });
      } catch {
        // Never fail the request — the link is returned for copy-fallback.
      }
    }

    return Response.json({ ok: true, link });
  } catch (e) {
    return Response.json({ error: (e as Error).message ?? "Request failed" }, { status: 500 });
  }
}
