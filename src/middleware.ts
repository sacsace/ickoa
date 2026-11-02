import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/** Keep middleware free of Prisma/bcrypt — those were bloating Turbopack + RAM. */
const ADMIN_ROLES = new Set([
  "SUPER_ADMIN",
  "CONTENT_ADMIN",
  "COMMUNITY_ADMIN",
  "EVENT_ADMIN",
]);

function isAdminRole(role?: string | null) {
  return !!role && ADMIN_ROLES.has(role);
}

async function readAuthToken(req: NextRequest) {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  // HTTPS(운영)는 `__Secure-authjs.session-token`, 로컬 HTTP는 `authjs.session-token`.
  // secureCookie를 생략하면 항상 비보안 이름만 찾아 운영에서 세션이 있어도 /admin이 튕긴다.
  const secure =
    req.nextUrl.protocol === "https:" ||
    req.headers.get("x-forwarded-proto") === "https";
  const primary = await getToken({ req, secret, secureCookie: secure });
  if (primary) return primary;
  return getToken({ req, secret, secureCookie: !secure });
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminLogin = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminLogin;

  const token = await readAuthToken(req);

  const adminRole =
    (token?.adminRole as string | undefined) ??
    (token?.sessionKind === "admin"
      ? (token?.role as string | undefined)
      : undefined) ??
    // 사이트 슬롯만 채워진 SUPER_ADMIN/root 등도 관리자 라우트 허용
    (token?.siteRole as string | undefined);

  const isAdminLoggedIn = isAdminRole(adminRole);

  if (isAdminLogin && isAdminLoggedIn) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (isAdminRoute && !isAdminLoggedIn) {
    const login = new URL("/admin/login", req.url);
    if (pathname !== "/admin") {
      login.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
