// packages/server/src/routers/auth.ts
// Password reset + set-password (also consumed by team invite links).
// Public by design — these run before authentication exists.
import { z } from "zod";
import bcrypt from "bcryptjs";
import { router, publicProcedure } from "../trpc";
import { eq, and } from "drizzle-orm";
import * as _db from "../../../db/src/index";
const { users, userTenants } = _db;
import { EmailQueueService } from "../services/email-queue";
import { createPasswordResetToken, consumePasswordResetToken, appBaseUrl } from "../lib/password-reset";

export const authRouter = router({
  /**
   * Request a reset link for an email. Always returns ok (no account
   * enumeration); the link is returned so the UI can offer copy-fallback
   * when SMTP isn't configured.
   */
  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const email = input.email.toLowerCase();
      const [user] = await ctx.db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!user) return { ok: true, link: null };

      const token = await createPasswordResetToken(ctx.db, user.id, 60 * 60 * 1000); // 1h
      const link = `${appBaseUrl()}/reset-password?token=${token}`;

      const [membership] = await ctx.db
        .select({ tenantId: userTenants.tenantId })
        .from(userTenants)
        .where(eq(userTenants.userId, user.id))
        .limit(1);

      if (membership) {
        try {
          const mail = new EmailQueueService(ctx.db);
          await mail.enqueue({
            tenantId: membership.tenantId,
            to: email,
            subject: "Reset your Arthvahi password",
            body: `Reset your password here: ${link}`,
            metadata: { kind: "password-reset" },
          });
        } catch {
          // Never fail the request — the link is returned for copy-fallback.
        }
      }

      return { ok: true, link };
    }),

  /** Set a new password with a valid one-time token. */
  resetPassword: publicProcedure
    .input(z.object({ token: z.string().min(20), password: z.string().min(8) }))
    .mutation(async ({ ctx, input }) => {
      const res = await consumePasswordResetToken(ctx.db, input.token);
      if (!res) throw new Error("This link is invalid or has expired. Request a new one.");
      const passwordHash = await bcrypt.hash(input.password, 10);
      await ctx.db.update(users).set({ passwordHash }).where(eq(users.id, res.userId));
      return { ok: true };
    }),
});
