import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Credentials from "next-auth/providers/credentials";
import { db } from "@complianceos/db";
import { users, userTenants, tenants } from "@complianceos/db";
import { eq } from "drizzle-orm";

const nextAuth = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        if (!credentials?.email) return null;
        const user = await db.select().from(users).where(eq(users.email, credentials.email)).limit(1);
        if (!user[0]) return null;
        // Demo mode: accept demo user without password verification
        if (user[0].email === "demo@complianceos.test") {
          return { id: user[0].id, email: user[0].email, name: user[0].name };
        }
        // Production: implement proper password verification with bcrypt/argon2
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, user }: any) {
      session.user.id = user.id;

      // Look up tenant + onboarding_status for the user
      const ut = await db
        .select({ tenantId: userTenants.tenantId })
        .from(userTenants)
        .where(eq(userTenants.userId, user.id))
        .limit(1);

      if (ut[0]) {
        session.user.tenantId = ut[0].tenantId;

        const t = await db
          .select({ onboardingStatus: tenants.onboardingStatus })
          .from(tenants)
          .where(eq(tenants.id, ut[0].tenantId))
          .limit(1);

        session.user.onboardingComplete = t[0]?.onboardingStatus === "complete";
      } else {
        session.user.tenantId = undefined;
        session.user.onboardingComplete = false;
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export const handlers = nextAuth.handlers as any;
export const auth = nextAuth.auth as any;
export const signIn = nextAuth.signIn as any;
export const signOut = nextAuth.signOut as any;
