import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Credentials from "next-auth/providers/credentials";
import { db } from "@complianceos/db";
import { users } from "@complianceos/db";
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
        return { id: user[0].id, email: user[0].email, name: user[0].name };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }: any) {
      session.user.id = user.id;
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
