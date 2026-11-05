import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // 요청 Host(www.ickoa.org)를 기준으로 리다이렉트한다.
  // AUTH_URL이 Railway 기본 도메인이어도 로그아웃이 그쪽으로 나가지 않게 한다.
  trustHost: true,
  ...authConfig,
});
