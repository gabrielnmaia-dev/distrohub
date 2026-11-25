import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const useSecureCookies = process.env.NODE_ENV === "production";
const cookiePrefix = useSecureCookies ? "__Secure-" : "";
const hostPrefix = useSecureCookies ? "__Host-" : "";

// `AUTH_SECRET` é o nome usado pelo Auth.js/Vercel; aceitar os dois evita
// quebrar o login quando apenas a variável nova foi configurada.
const resolvedSecret =
  process.env.NEXTAUTH_SECRET?.trim() || process.env.AUTH_SECRET?.trim();

export const isAuthConfigured = Boolean(resolvedSecret);
export const SESSION_COOKIE_NAME = `${cookiePrefix}distrohub.session-token`;
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

export const authOptions: NextAuthOptions = {
  secret: resolvedSecret,
  useSecureCookies,
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
    updateAge: 60 * 60 * 24, // renova o token a cada 24h
  },
  cookies: {
    sessionToken: {
      name: SESSION_COOKIE_NAME,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: SESSION_MAX_AGE,
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}distrohub.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      name: `${hostPrefix}distrohub.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) return null;

        await connectDB();
        const user = await User.findOne({
          email: credentials.email.trim().toLowerCase(),
        }).select("+senha");
        if (!user) return null;

        const senhaOk = await bcrypt.compare(credentials.senha, user.senha);
        if (!senhaOk) return null;

        return {
          id: user._id.toString(),
          name: user.nome,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
