import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import {
  db,
  users,
  userTenants,
  tenants,
} from "@complianceos/db";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const DEMO_EMAIL = "demo@complianceos.test";

const nextAuth = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

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
        if (user.passwordHash) {
          const valid = await bcrypt.compare(String(credentials.password), user.passwordHash);
          if (!valid) return null;
        }
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const userId = user.id;
        if (!userId) return token;
        token.id = userId;
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
