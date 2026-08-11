// packages/server/src/routers/team.ts
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import type { Database } from "../../../db/src/index";
import { eq, and, sql } from "drizzle-orm";
import * as _db from "../../../db/src/index";
const { users, userTenants, tenants } = _db;
import { EmailQueueService } from "../services/email-queue";
import { createPasswordResetToken, appBaseUrl } from "../lib/password-reset";

const RoleSchema = z.enum(["owner", "accountant", "manager", "employee"]);

/** Owner-only guard: invite/role changes are ownership decisions. */
async function assertOwner(ctx: {
  db: Database;
  tenantId: string;
  session: { user: { id: string } } | null;
}): Promise<void> {
  const [me] = await ctx.db
    .select({ role: userTenants.role })
    .from(userTenants)
    .where(and(eq(userTenants.userId, ctx.session!.user.id), eq(userTenants.tenantId, ctx.tenantId)))
    .limit(1);
  if (me?.role !== "owner") throw new Error("Only owners can manage team membership");
}

export const teamRouter = router({
  /** Members of the current tenant with their role + invite state. */
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        userId: users.id,
        name: users.name,
        email: users.email,
        role: userTenants.role,
        joinedAt: userTenants.createdAt,
        active: sql<boolean>`${users.passwordHash} IS NOT NULL`,
      })
      .from(userTenants)
      .innerJoin(users, eq(users.id, userTenants.userId))
      .where(eq(userTenants.tenantId, ctx.tenantId))
      .orderBy(userTenants.createdAt);
  }),

  /**
   * Invite by email. Creates the user row if missing, adds the membership,
   * and issues a set-password link (emailed via the queue; the link is also
   * returned so the inviter can copy it — email delivery needs SMTP config).
   */
  invite: protectedProcedure
    .input(z.object({ email: z.string().email(), role: RoleSchema }))
    .mutation(async ({ ctx, input }) => {
      await assertOwner(ctx);
      const email = input.email.toLowerCase();

      let [user] = await ctx.db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!user) {
        [user] = await ctx.db.insert(users).values({ email }).returning();
      }

      const [existing] = await ctx.db
        .select({ id: userTenants.id })
        .from(userTenants)
        .where(and(eq(userTenants.userId, user.id), eq(userTenants.tenantId, ctx.tenantId)))
        .limit(1);
      if (existing) {
        return { invited: false, alreadyMember: true, inviteLink: null };
      }

      await ctx.db.insert(userTenants).values({
        userId: user.id,
        tenantId: ctx.tenantId,
        role: input.role,
      });

      const token = await createPasswordResetToken(ctx.db, user.id);
      const inviteLink = `${appBaseUrl()}/reset-password?token=${token}`;

      const [tenant] = await ctx.db
        .select({ name: tenants.name })
        .from(tenants)
        .where(eq(tenants.id, ctx.tenantId))
        .limit(1);

      try {
        const mail = new EmailQueueService(ctx.db);
        await mail.enqueue({
          tenantId: ctx.tenantId,
          to: email,
          subject: `You've been invited to ${tenant?.name ?? "a company"} on Arthvahi`,
          body: `Set your password to join: ${inviteLink}`,
          metadata: { kind: "team-invite", role: input.role },
        });
      } catch {
        // Enqueue must never fail the invite — the link is returned to the inviter.
      }

      return { invited: true, alreadyMember: false, inviteLink };
    }),

  updateRole: protectedProcedure
    .input(z.object({ userId: z.string().uuid(), role: RoleSchema }))
    .mutation(async ({ ctx, input }) => {
      await assertOwner(ctx);
      if (input.userId === ctx.session!.user.id) {
        throw new Error("You cannot change your own role");
      }
      const owners = await ctx.db
        .select({ id: userTenants.id })
        .from(userTenants)
        .where(and(eq(userTenants.tenantId, ctx.tenantId), eq(userTenants.role, "owner")));
      const [target] = await ctx.db
        .select({ role: userTenants.role })
        .from(userTenants)
        .where(and(eq(userTenants.userId, input.userId), eq(userTenants.tenantId, ctx.tenantId)))
        .limit(1);
      if (target?.role === "owner" && owners.length <= 1) {
        throw new Error("Cannot demote the last owner");
      }
      await ctx.db
        .update(userTenants)
        .set({ role: input.role })
        .where(and(eq(userTenants.userId, input.userId), eq(userTenants.tenantId, ctx.tenantId)));
      return { ok: true };
    }),

  remove: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const me = ctx.session!.user.id;
      if (me === input.userId) throw new Error("You cannot remove yourself");

      const owners = await ctx.db
        .select({ id: userTenants.id })
        .from(userTenants)
        .where(and(eq(userTenants.tenantId, ctx.tenantId), eq(userTenants.role, "owner")));

      const [target] = await ctx.db
        .select({ role: userTenants.role })
        .from(userTenants)
        .where(and(eq(userTenants.userId, input.userId), eq(userTenants.tenantId, ctx.tenantId)))
        .limit(1);

      if (target?.role === "owner" && owners.length <= 1) {
        throw new Error("Cannot remove the last owner");
      }

      await ctx.db
        .delete(userTenants)
        .where(and(eq(userTenants.userId, input.userId), eq(userTenants.tenantId, ctx.tenantId)));
      return { ok: true };
    }),
});
