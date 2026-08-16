import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db, tenants, users, userTenants, passwordResetTokens } from "../../../db/src/index";
import { eq, and, like } from "drizzle-orm";
import { randomUUID, createHash } from "crypto";
import { appRouter } from "../routers";
import { createPasswordResetToken, consumePasswordResetToken } from "../lib/password-reset";
import bcrypt from "bcryptjs";

type Ctx = {
  db: typeof db;
  tenantId: string;
  session: { user: { id: string; tenantId: string } } | null;
};

function makeCtx(tenantId: string, userId: string): Ctx {
  return { db, tenantId, session: { user: { id: userId, tenantId } } };
}

function caller(ctx: Ctx) {
  return appRouter.createCaller(ctx as never);
}

describe("Password reset + team invite flow", () => {
  let tenantId: string;
  let ownerId: string;
  const stamp = randomUUID().slice(0, 8);

  beforeEach(async () => {
    tenantId = randomUUID();
    ownerId = randomUUID();
    await db.insert(tenants).values({
      id: tenantId,
      name: `Reset Test ${stamp}`,
      pan: `AAAPT${stamp.toUpperCase()}P`,
      address: "Test Address",
      state: "karnataka",
    });
    await db.insert(users).values({
      id: ownerId,
      email: `owner-${stamp}@example.com`,
      passwordHash: await bcrypt.hash("ownerpass123", 10),
    });
    await db.insert(userTenants).values({ userId: ownerId, tenantId, role: "owner" });
  });

  afterEach(async () => {
    const rows = await db.select({ id: users.id }).from(users).where(like(users.email, `%${stamp}%`));
    for (const r of rows) {
      await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, r.id));
      await db.delete(userTenants).where(eq(userTenants.userId, r.id));
      await db.delete(users).where(eq(users.id, r.id));
    }
    await db.delete(tenants).where(eq(tenants.id, tenantId));
  });

  it("requestPasswordReset does not enumerate accounts", async () => {
    const res = await caller(makeCtx(tenantId, ownerId)).auth.requestPasswordReset({
      email: `nobody-${stamp}@example.com`,
    });
    expect(res.ok).toBe(true);
    expect(res.link).toBeNull();
  });

  it("requestPasswordReset issues a one-time link for a known email", async () => {
    const res = await caller(makeCtx(tenantId, ownerId)).auth.requestPasswordReset({
      email: `owner-${stamp}@example.com`,
    });
    expect(res.ok).toBe(true);
    expect(res.link).toContain("/reset-password?token=");

    const [row] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, ownerId))
      .limit(1);
    expect(row).toBeDefined();
    expect(row.usedAt).toBeNull();
    expect(row.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("resetPassword updates the hash and is single-use", async () => {
    const token = await createPasswordResetToken(db, ownerId);
    const token2 = await createPasswordResetToken(db, ownerId);

    await caller(makeCtx(tenantId, ownerId)).auth.resetPassword({
      token,
      password: "newpassword456",
    });

    const [user] = await db.select().from(users).where(eq(users.id, ownerId)).limit(1);
    expect(await bcrypt.compare("newpassword456", user.passwordHash)).toBe(true);

    await expect(
      caller(makeCtx(tenantId, ownerId)).auth.resetPassword({ token, password: "anotherpass789" }),
    ).rejects.toThrow(/invalid or has expired|invalid or expired/i);

    // A second unused token still works
    await caller(makeCtx(tenantId, ownerId)).auth.resetPassword({
      token: token2,
      password: "thirdpass000",
    });
    const [user2] = await db.select().from(users).where(eq(users.id, ownerId)).limit(1);
    expect(await bcrypt.compare("thirdpass000", user2.passwordHash)).toBe(true);
  });

  it("resetPassword rejects expired tokens", async () => {
    const token = await createPasswordResetToken(db, ownerId, -1000);
    await expect(
      caller(makeCtx(tenantId, ownerId)).auth.resetPassword({ token, password: "whatever123" }),
    ).rejects.toThrow(/invalid or has expired|invalid or expired/i);
  });

  it("consumePasswordResetToken marks used_at", async () => {
    const token = await createPasswordResetToken(db, ownerId);
    const res = await consumePasswordResetToken(db, token);
    expect(res?.userId).toBe(ownerId);
    // Tokens are stored hashed (SHA-256) — look up by the hash.
    const hashed = createHash("sha256").update(token).digest("hex");
    const [row] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, hashed))
      .limit(1);
    expect(row.usedAt).not.toBeNull();
    expect(await consumePasswordResetToken(db, token)).toBeNull();
  });

  it("team.invite creates membership + link; re-invite reports alreadyMember", async () => {
    const email = `invitee-${stamp}@example.com`;
    const c = caller(makeCtx(tenantId, ownerId));

    const first = await c.team.invite({ email, role: "accountant" });
    expect(first.invited).toBe(true);
    expect(first.inviteLink).toContain("/reset-password?token=");

    const [member] = await db
      .select({ role: userTenants.role })
      .from(userTenants)
      .innerJoin(users, eq(users.id, userTenants.userId))
      .where(and(eq(userTenants.tenantId, tenantId), eq(users.email, email)))
      .limit(1);
    expect(member?.role).toBe("accountant");

    const second = await c.team.invite({ email, role: "manager" });
    expect(second.alreadyMember).toBe(true);

    const list = await c.team.list();
    expect(list).toHaveLength(2);
  });

  it("team.remove guards self-removal and last owner", async () => {
    const c = caller(makeCtx(tenantId, ownerId));
    await expect(c.team.remove({ userId: ownerId })).rejects.toThrow(/last owner|yourself/i);
  });

  it("team.updateRole changes membership role", async () => {
    const email = `role-${stamp}@example.com`;
    const c = caller(makeCtx(tenantId, ownerId));
    await c.team.invite({ email, role: "employee" });
    const list = await c.team.list();
    const target = list.find((m) => m.email === email)!;
    await c.team.updateRole({ userId: target.userId, role: "manager" });
    const after = await c.team.list();
    expect(after.find((m) => m.email === email)?.role).toBe("manager");
  });
});
