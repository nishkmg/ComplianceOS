// packages/server/src/lib/password-reset.ts
import { randomBytes, createHash } from "crypto";

// Tokens are stored hashed (SHA-256) — a DB leak never exposes usable reset links.
function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}
import { eq, and, isNull, gt } from "drizzle-orm";
import * as _db from "../../../db/src/index";
const { passwordResetTokens, users } = _db;
import type { Database } from "../../../db/src/index";

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days — long enough for invites

/**
 * Create a one-time token for a user (password reset or team invite).
 * Returns the raw token — the caller emails it / returns it to the UI.
 */
export async function createPasswordResetToken(
  db: Database,
  userId: string,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<string> {
  const token = randomBytes(24).toString("hex");
  await db.insert(passwordResetTokens).values({
    userId,
    token: hashToken(token),
    expiresAt: new Date(Date.now() + ttlMs),
  });
  return token;
}

/**
 * Validate + consume a token. Returns the owning user's id + email, or null
 * when the token is missing, expired, or already used. Consuming is
 * single-use: the row is marked used_at on success.
 */
export async function consumePasswordResetToken(
  db: Database,
  rawToken: string,
): Promise<{ userId: string; email: string } | null> {
  const [row] = await db
    .select({
      id: passwordResetTokens.id,
      userId: passwordResetTokens.userId,
      email: users.email,
    })
    .from(passwordResetTokens)
    .innerJoin(users, eq(users.id, passwordResetTokens.userId))
    .where(
      and(
        eq(passwordResetTokens.token, hashToken(rawToken)),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!row) return null;

  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, row.id));

  return { userId: row.userId, email: row.email };
}

/** Base URL for links embedded in emails (Vercel sets NEXTAUTH_URL/AUTH_URL). */
export function appBaseUrl(): string {
  return (
    process.env.BASE_URL ||
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    "https://arthvahi.in"
  );
}
