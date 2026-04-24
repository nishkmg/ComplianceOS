import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Credentials from "next-auth/providers/credentials";
import { db } from "@complianceos/db";
import { users, userTenants, tenants } from "@complianceos/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const DEMO_EMAIL = "demo@complianceos.test";
const DEMO_TENANT_ID = process.env.DEMO_TENANT_ID || "demo-tenant-uuid";

async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

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
        
        if (DEMO_MODE && credentials.email === DEMO_EMAIL) {
          const demoUser = await db.select().from(users).where(eq(users.email, DEMO_EMAIL)).limit(1);
          if (demoUser[0]) {
            return { id: demoUser[0].id, email: demoUser[0].email, name: demoUser[0].name };
          }
          return null;
        }
        
        const user = await db.select().from(users).where(eq(users.email, credentials.email)).limit(1);
        if (!user[0]) return null;
        
        if (!credentials.password) return null;
        
        const valid = await verifyPassword(credentials.password, user[0].passwordHash);
        if (!valid) return null;
        
        return { id: user[0].id, email: user[0].email, name: user[0].name };
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
