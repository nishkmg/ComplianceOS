import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Credentials from "next-auth/providers/credentials";
import { db } from "@complianceos/db";
import { users, userTenants, tenants } from "@complianceos/db";
import { eq } from "drizzle-orm";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const DEMO_EMAIL = "demo@complianceos.test";
const DEMO_TENANT_ID = process.env.DEMO_TENANT_ID || "demo-tenant-uuid";

const nextAuth = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
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
        
        // TODO: Add password column to users table and implement proper verification
        // For now, accept any non-empty password for authenticated users
        if (!credentials.password) return null;
        
        return { id: user[0].id, email: user[0].email, name: user[0].name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;

        // Look up tenant + onboarding_status (runs on server, not middleware)
        const ut = await db
          .select({ tenantId: userTenants.tenantId })
          .from(userTenants)
          .where(eq(userTenants.userId, user.id))
          .limit(1);

        if (ut[0]) {
          token.tenantId = ut[0].tenantId;
          const t = await db
            .select({ onboardingStatus: tenants.onboardingStatus })
            .from(tenants)
            .where(eq(tenants.id, ut[0].tenantId))
            .limit(1);
          token.onboardingComplete = t[0]?.onboardingStatus === "complete";
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
  pages: {
    signIn: "/login",
  },
});

export const handlers = nextAuth.handlers as any;
export const auth = nextAuth.auth as any;
export const signIn = nextAuth.signIn as any;
export const signOut = nextAuth.signOut as any;
