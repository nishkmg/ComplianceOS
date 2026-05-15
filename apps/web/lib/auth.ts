import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { hasServiceRoleKey, supabaseRest } from "@/lib/supabase-rest";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const DEMO_EMAIL = "demo@arthvahi.in";

async function sbGet(path: string) {
  const res = await supabaseRest(path);
  if (!res.ok) {
    return null;
  }
  return res.json;
}

function asRows<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

const nextAuth = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !hasServiceRoleKey()) return null;

        if (DEMO_MODE && credentials.email === DEMO_EMAIL) {
          const data = asRows<{ id: string; email: string; name: string }>(
            await sbGet(`users?email=eq.${encodeURIComponent(DEMO_EMAIL)}&select=id,email,name`)
          );
          if (data[0]) return { id: data[0].id, email: data[0].email, name: data[0].name };
          return null;
        }

        if (!credentials.password) return null;
        const data = asRows<{ id: string; email: string; name: string; password_hash?: string | null }>(
          await sbGet(`users?email=eq.${encodeURIComponent(credentials.email)}&select=id,email,name,password_hash`)
        );
        if (!data[0]) return null;

        if (data[0].password_hash) {
          const valid = await bcrypt.compare(credentials.password, data[0].password_hash);
          if (!valid) return null;
        }
        return { id: data[0].id, email: data[0].email, name: data[0].name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user && hasServiceRoleKey()) {
        token.id = user.id;
        const ut = asRows<{ tenant_id: string }>(await sbGet(`user_tenants?user_id=eq.${user.id}&select=tenant_id`));
        if (ut[0]) {
          token.tenantId = ut[0].tenant_id;
          const t = asRows<{ onboarding_status?: string | null }>(
            await sbGet(`tenants?id=eq.${ut[0].tenant_id}&select=onboarding_status`)
          );
          token.onboardingComplete = t[0]?.onboarding_status === "complete";
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
