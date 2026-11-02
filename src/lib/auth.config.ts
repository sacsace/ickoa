import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions-client";

const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30일

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

function assignSite(
  token: Record<string, unknown>,
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    loginId?: string | null;
  },
) {
  token.siteId = user.id;
  token.siteName = user.name ?? null;
  token.siteEmail = user.email ?? null;
  token.siteImage = user.image ?? null;
  token.siteRole = user.role ?? "MEMBER";
  token.siteLoginId = user.loginId ?? null;
}

function assignAdmin(
  token: Record<string, unknown>,
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    loginId?: string | null;
  },
) {
  token.adminId = user.id;
  token.adminName = user.name ?? null;
  token.adminEmail = user.email ?? null;
  token.adminImage = user.image ?? null;
  token.adminRole = user.role ?? "MEMBER";
  token.adminLoginId = user.loginId ?? null;
}

function clearSite(token: Record<string, unknown>) {
  delete token.siteId;
  delete token.siteName;
  delete token.siteEmail;
  delete token.siteImage;
  delete token.siteRole;
  delete token.siteLoginId;
}

function clearAdmin(token: Record<string, unknown>) {
  delete token.adminId;
  delete token.adminName;
  delete token.adminEmail;
  delete token.adminImage;
  delete token.adminRole;
  delete token.adminLoginId;
}

function syncLegacyFields(token: Record<string, unknown>) {
  // 사이트 우선(웹 UI), 없으면 관리자
  if (token.siteId) {
    token.id = token.siteId;
    token.name = token.siteName;
    token.email = token.siteEmail;
    token.picture = token.siteImage;
    token.role = token.siteRole ?? "MEMBER";
    token.sessionKind = "site";
  } else if (token.adminId) {
    token.id = token.adminId;
    token.name = token.adminName;
    token.email = token.adminEmail;
    token.picture = token.adminImage;
    token.role = token.adminRole ?? "MEMBER";
    token.sessionKind = "admin";
  } else {
    delete token.id;
    delete token.role;
    delete token.sessionKind;
  }
}

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
    updateAge: 60 * 60 * 24, // 24시간마다 슬라이딩 갱신
  },
  jwt: {
    maxAge: SESSION_MAX_AGE,
  },
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
        const loginId = (credentials.loginId as string | undefined)
          ?.trim()
          .toLowerCase();
        const email = (credentials.email as string | undefined)
          ?.trim()
          .toLowerCase();

        if (!loginId && !email) return null;

        const user = loginId
          ? await prisma.user.findFirst({
              where: { loginId: { equals: loginId, mode: "insensitive" } },
            })
          : await prisma.user.findFirst({
              where: { email: { equals: email!, mode: "insensitive" } },
            });

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
            loginId: user.loginId,
            sessionKind: "admin" as const,
          };
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          loginId: user.loginId,
          sessionKind: "site" as const,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      const t = token as Record<string, unknown>;

      // 구 JWT → 이중 슬롯 마이그레이션
      if (t.id && !t.siteId && !t.adminId) {
        if (t.sessionKind === "admin") {
          assignAdmin(t, {
            id: String(t.id),
            name: (t.name as string | null | undefined) ?? null,
            email: (t.email as string | null | undefined) ?? null,
            image: (t.picture as string | null | undefined) ?? null,
            role: String(t.role ?? "MEMBER"),
          });
        } else {
          assignSite(t, {
            id: String(t.id),
            name: (t.name as string | null | undefined) ?? null,
            email: (t.email as string | null | undefined) ?? null,
            image: (t.picture as string | null | undefined) ?? null,
            role: String(t.role ?? "MEMBER"),
          });
        }
      }

      if (user) {
        const kind =
          (user as { sessionKind?: "site" | "admin" }).sessionKind ??
          (account?.provider === "credentials" ? "site" : "site");
        const payload = {
          id: user.id!,
          name: user.name,
          email: user.email,
          image: user.image,
          role: (user as { role?: string }).role ?? "MEMBER",
          loginId: (user as { loginId?: string | null }).loginId ?? null,
        };
        if (kind === "admin") {
          // 관리자도 동일 계정으로 사이트 기능을 쓰므로 site 슬롯을 함께 채운다.
          // (admin-only면 헤더는 로그인으로 보이는데 /account는 막혀 루프가 난다)
          assignAdmin(t, payload);
          assignSite(t, payload);
        } else {
          assignSite(t, payload);
          // root / SUPER_ADMIN 등이 사이트 로그인만 해도 /admin 진입 가능하게
          if (isAdmin(payload.role)) {
            assignAdmin(t, payload);
          }
        }
      } else if (account && account.provider !== "credentials") {
        // OAuth는 사이트 세션
        if (t.id) {
          const dbUser = await prisma.user.findUnique({
            where: { id: String(t.id) },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              image: true,
              loginId: true,
            },
          });
          if (dbUser) {
            assignSite(t, dbUser);
          } else {
            assignSite(t, {
              id: String(t.id),
              name: (t.name as string | null | undefined) ?? null,
              email: (t.email as string | null | undefined) ?? null,
              image: (t.picture as string | null | undefined) ?? null,
              role: String(t.role ?? "MEMBER"),
            });
          }
        }
      } else if (!t.siteId && !t.adminId && t.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: t.email as string },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            loginId: true,
          },
        });
        if (dbUser) {
          assignSite(t, dbUser);
        }
      }

      // 기존 JWT에 loginId 없을 때 한 번 채움
      if (t.siteId && t.siteLoginId == null) {
        const dbUser = await prisma.user.findUnique({
          where: { id: t.siteId as string },
          select: { loginId: true, role: true },
        });
        if (dbUser) {
          t.siteLoginId = dbUser.loginId ?? null;
          t.siteRole = dbUser.role;
        }
      }
      if (t.adminId && t.adminLoginId == null) {
        const dbUser = await prisma.user.findUnique({
          where: { id: t.adminId as string },
          select: { loginId: true, role: true },
        });
        if (dbUser) {
          t.adminLoginId = dbUser.loginId ?? null;
          t.adminRole = dbUser.role;
        }
      }

      if (trigger === "update") {
        const clearPortal = (session as { clearPortal?: string } | null)
          ?.clearPortal;
        if (clearPortal === "site") clearSite(t);
        if (clearPortal === "admin") clearAdmin(t);

        // 프로필 갱신: 사이트 슬롯 기준
        if (t.siteId) {
          const dbUser = await prisma.user.findUnique({
            where: { id: t.siteId as string },
            select: {
              name: true,
              email: true,
              role: true,
              image: true,
              loginId: true,
            },
          });
          if (dbUser) {
            t.siteName = dbUser.name;
            t.siteEmail = dbUser.email;
            t.siteRole = dbUser.role;
            t.siteImage = dbUser.image || null;
            t.siteLoginId = dbUser.loginId || null;
          }
        }
        if (t.adminId) {
          const dbUser = await prisma.user.findUnique({
            where: { id: t.adminId as string },
            select: {
              name: true,
              email: true,
              role: true,
              image: true,
              loginId: true,
            },
          });
          if (dbUser) {
            t.adminName = dbUser.name;
            t.adminEmail = dbUser.email;
            t.adminRole = dbUser.role;
            t.adminImage = dbUser.image || null;
            t.adminLoginId = dbUser.loginId || null;
          }
        }
      }

      syncLegacyFields(t);
      return token;
    },
    async session({ session, token }) {
      const site =
        token.siteId
          ? {
              id: String(token.siteId),
              name: (token.siteName as string | null | undefined) ?? null,
              email: (token.siteEmail as string | null | undefined) ?? null,
              image: (token.siteImage as string | null | undefined) ?? null,
              role: String(token.siteRole ?? "MEMBER"),
              loginId: (token.siteLoginId as string | null | undefined) ?? null,
            }
          : null;
      const admin =
        token.adminId
          ? {
              id: String(token.adminId),
              name: (token.adminName as string | null | undefined) ?? null,
              email: (token.adminEmail as string | null | undefined) ?? null,
              image: (token.adminImage as string | null | undefined) ?? null,
              role: String(token.adminRole ?? "MEMBER"),
              loginId: (token.adminLoginId as string | null | undefined) ?? null,
            }
          : null;

      session.site = site;
      session.admin = admin;

      const primary = site ?? admin;
      if (primary && session.user) {
        session.user.id = primary.id;
        session.user.name = primary.name || "";
        session.user.email = primary.email || "";
        session.user.image = primary.image || null;
        session.user.role = primary.role;
        session.user.loginId = primary.loginId ?? null;
        session.sessionKind = site ? "site" : "admin";
      }

      return session;
    },
  },
} satisfies NextAuthConfig;
