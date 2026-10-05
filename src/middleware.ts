import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/permissions-client";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAdminLogin = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminLogin;
  const isLoggedIn = !!req.auth;
  const sessionKind = req.auth?.sessionKind;
  const role = req.auth?.user?.role;
  const isAdminLoggedIn =
    isLoggedIn && sessionKind === "admin" && role && isAdmin(role);

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
});

export const config = {
  matcher: ["/admin/:path*"],
};
