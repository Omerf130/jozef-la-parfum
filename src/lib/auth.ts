import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { AdminModel } from "@/models/Admin";
import { adminLoginSchema } from "@/lib/validation/admin";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin";
      email: string;
    } & DefaultSession["user"];
  }
  interface User {
    id?: string;
    role?: "admin";
    email?: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: "admin";
    uid?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const parsed = adminLoginSchema.safeParse(credentials);
          if (!parsed.success) {
            console.warn("[auth] schema validation failed", parsed.error.flatten());
            return null;
          }

          await connectDB();
          const admin = await AdminModel.findOne({ email: parsed.data.email }).lean();
          if (!admin) {
            console.warn("[auth] admin not found for email:", parsed.data.email);
            return null;
          }

          const ok = await bcrypt.compare(parsed.data.password, admin.passwordHash);
          if (!ok) {
            console.warn("[auth] password mismatch for:", parsed.data.email);
            return null;
          }

          return {
            id: admin._id.toString(),
            email: admin.email,
            role: "admin" as const,
          };
        } catch (err) {
          console.error("[auth] authorize threw", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: "admin" }).role ?? "admin";
        token.uid = (user as { id?: string }).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) ?? "";
        session.user.role = (token.role as "admin") ?? "admin";
      }
      return session;
    },
  },
});

export async function requireAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return session;
}
