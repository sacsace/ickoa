import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions-client";

const KakaoProvider = {
  id: "kakao",
  name: "Kakao",
  type: "oauth" as const,
  clientId: process.env.KAKAO_CLIENT_ID,
  clientSecret: process.env.KAKAO_CLIENT_SECRET,
  authorization: {
    url: "https://kauth.kakao.com/oauth/authorize",
    params: { scope: "profile_nickname profile_image account_email" },
  },
  token: "https://kauth.kakao.com/oauth/token",
  userinfo: "https://kapi.kakao.com/v2/user/me",
  profile(profile: {
    id: number;
    kakao_account?: {
      email?: string;
      profile?: { nickname?: string; profile_image_url?: string };
    };
  }) {
    return {
      id: String(profile.id),
      name: profile.kakao_account?.profile?.nickname ?? "Kakao User",
      email: profile.kakao_account?.email,
      image: profile.kakao_account?.profile?.profile_image_url,
    };
  },
};

const NaverProvider = {
  id: "naver",
  name: "Naver",
  type: "oauth" as const,
  clientId: process.env.NAVER_CLIENT_ID,
  clientSecret: process.env.NAVER_CLIENT_SECRET,
  authorization: {
    url: "https://nid.naver.com/oauth2.0/authorize",
    params: { response_type: "code" },
  },
  token: "https://nid.naver.com/oauth2.0/token",
  userinfo: "https://openapi.naver.com/v1/nid/me",
  profile(profile: {
    response?: {
      id?: string;
      email?: string;
      name?: string;
      profile_image?: string;
    };
  }) {
    const res = profile.response;
    return {
      id: res?.id ?? "",
      name: res?.name ?? "Naver User",
      email: res?.email,
      image: res?.profile_image,
    };
  },
};

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  providers: [
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    ...(process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET
      ? [KakaoProvider]
      : []),
    ...(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET
      ? [NaverProvider]
      : []),
    Credentials({
      name: "Credentials",
      credentials: {
        loginId: { label: "Login ID", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        portal: { label: "Portal", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.password) return null;

        const portal =
          (credentials.portal as string | undefined)?.trim() === "admin"
            ? "admin"
            : "site";
        const loginId = (credentials.loginId as string | undefined)?.trim().toLowerCase();
        const email = (credentials.email as string | undefined)?.trim().toLowerCase();

        if (!loginId && !email) return null;

        const user = loginId
          ? await prisma.user.findUnique({ where: { loginId } })
          : await prisma.user.findUnique({ where: { email } });

        if (!user?.password) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );
        if (!valid) return null;

        if (portal === "admin") {
          if (!isAdmin(user.role)) return null;
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            sessionKind: "admin" as const,
          };
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          sessionKind: "site" as const,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "MEMBER";
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.sessionKind =
          (user as { sessionKind?: "site" | "admin" }).sessionKind ??
          (account?.provider === "credentials" ? "site" : "site");
      } else if (account && account.provider !== "credentials") {
        token.sessionKind = "site";
      } else if (!token.id && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, name: true, email: true, role: true, image: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.role = dbUser.role;
          token.picture = dbUser.image;
        }
      }

      // 내 정보 저장 후 session.update() → JWT 이름/이메일/사진 즉시 반영
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { name: true, email: true, role: true, image: true },
        });
        if (dbUser) {
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.role = dbUser.role;
          token.picture = dbUser.image;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = (token.name as string | null | undefined) ?? session.user.name;
        session.user.email =
          (token.email as string | null | undefined) ?? session.user.email;
        session.user.image =
          (token.picture as string | null | undefined) ?? session.user.image;
        session.user.role = (token.role as string) ?? "MEMBER";
        session.sessionKind = token.sessionKind ?? "site";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
