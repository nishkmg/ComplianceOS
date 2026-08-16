import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import {
  db,
  users,
  userTenants,
  tenants,
  loginAttempts,
} from "@complianceos/db";
import { and, eq, sql } from "drizzle-orm";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const DEMO_EMAIL = "demo@complianceos.test";

const nextAuth = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: Number(process.env.AUTH_SESSION_MAX_AGE) || 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // sliding refresh every 24h
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email) return null;
        // NextAuth v5 beta passes the request — pull the client IP for
        // per-IP throttling (Vercel: x-forwarded-for).
        const fwd = req?.headers?.get?.("x-forwarded-for");
        const ip = typeof fwd === "string" ? fwd.split(",")[0].trim() : "";

        const [user] = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            passwordHash: users.passwordHash,
          })
          .from(users)
          .where(eq(users.email, String(credentials.email)))
          .limit(1);
        if (!user) return null;

        // Demo shortcut: no password check in demo mode
        if (DEMO_MODE && user.email === DEMO_EMAIL) {
          return { id: user.id, email: user.email, name: user.name };
        }

        if (!credentials.password) return null;

        // DB-backed brute-force guard (serverless-safe; the old in-memory map
        // was per-instance and useless on Vercel).
        const now = new Date();
        const [attemptRow] = await db
          .select()
          .from(loginAttempts)
          .where(
            and(
              eq(loginAttempts.email, String(credentials.email)),
              eq(loginAttempts.ip, ip),
            ),
          )
          .limit(1);
        if (
          attemptRow &&
          attemptRow.attemptCount >= 5 &&
          now.getTime() - new Date(attemptRow.lastAttemptAt).getTime() < 15 * 60 * 1000
        ) {
          throw new Error("Too many attempts. Try again later.");
        }

        let valid = false;
        if (user.passwordHash) {
          valid = await bcrypt.compare(String(credentials.password), user.passwordHash);
        }
        if (!valid) {
          await db
            .insert(loginAttempts)
            .values({ email: String(credentials.email), ip, attemptCount: 1, lastAttemptAt: now })
            .onConflictDoUpdate({
              target: [loginAttempts.email, loginAttempts.ip],
              set: {
                attemptCount: sql`${loginAttempts.attemptCount} + 1`,
                lastAttemptAt: now,
              },
            });
          return null;
        }
        // Success — clear the throttle.
        await db.delete(loginAttempts).where(
          and(
            eq(loginAttempts.email, String(credentials.email)),
            eq(loginAttempts.ip, ip),
          ),
        );
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Re-read membership + onboarding state whenever the session updates
      // (e.g. step 6 calling update()) — otherwise the token keeps
      // onboardingComplete=false forever and /dashboard bounces back to
      // /onboarding until the user re-logs-in.
      const userId = (token.id ?? user?.id) as string | undefined;
      if (user) {
        token.id = user.id;
      }
      if (trigger === "update" || user || !token.tenantId) {
        if (!userId) return token;
        const [ut] = await db
          .select({ tenantId: userTenants.tenantId })
          .from(userTenants)
          .where(eq(userTenants.userId, userId))
          .limit(1);
        if (ut) {
          token.tenantId = ut.tenantId;
          const [t] = await db
            .select({ onboardingStatus: tenants.onboardingStatus })
            .from(tenants)
            .where(eq(tenants.id, ut.tenantId))
            .limit(1);
          token.onboardingComplete = t?.onboardingStatus === "complete";
        } else {
          token.tenantId = undefined;
          token.onboardingComplete = false;
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      session.user.id = token.id;
      session.user.tenantId = token.tenantId;
      session.user.onboardingComplete = token.onboardingComplete;
      return session;
    },
  },
  pages: { signIn: "/login" },
});

export const handlers = nextAuth.handlers as any;
export const auth = nextAuth.auth as any;
export const signIn = nextAuth.signIn as any;
export const signOut = nextAuth.signOut as any;
