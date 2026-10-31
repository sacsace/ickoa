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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminLogin = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminLogin;

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  });

  const adminRole =
    (token?.adminRole as string | undefined) ??
    (token?.sessionKind === "admin"
      ? (token?.role as string | undefined)
      : undefined);

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
