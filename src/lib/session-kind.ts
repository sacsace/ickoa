import type { Session } from "next-auth";
import { isAdmin } from "@/lib/permissions-client";

export type SessionKind = "site" | "admin";

export type PortalUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
  loginId?: string | null;
};

export function getSiteUser(
  session: Session | null | undefined,
): PortalUser | null {
  if (session?.site?.id) return session.site;
  // 구 세션 호환
  if (session?.user?.id && session.sessionKind !== "admin") {
    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: session.user.role,
      loginId:
        (session.user as { loginId?: string | null }).loginId ?? null,
    };
  }
  return null;
}

export function getAdminUser(
  session: Session | null | undefined,
): PortalUser | null {
  if (session?.admin?.id && isAdmin(session.admin.role)) {
    return session.admin;
  }
  // 사이트 세션으로 로그인한 관리자(root / SUPER_ADMIN 등)
  if (session?.site?.id && isAdmin(session.site.role)) {
    return session.site;
  }
  // 구 세션 호환: admin only
  if (
    session?.user?.id &&
    session.sessionKind === "admin" &&
    isAdmin(session.user.role)
  ) {
    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: session.user.role,
      loginId:
        (session.user as { loginId?: string | null }).loginId ?? null,
    };
  }
  // 구 세션 호환: site SUPER_ADMIN
  if (session?.user?.id && isAdmin(session.user.role)) {
    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: session.user.role,
      loginId:
        (session.user as { loginId?: string | null }).loginId ?? null,
    };
  }
  return null;
}

export function isSiteSession(session: Session | null | undefined) {
  return !!getSiteUser(session);
}

export function isAdminSession(session: Session | null | undefined) {
  return !!getAdminUser(session);
}

export function adminHasRole(
  session: Session | null | undefined,
  roles: string[],
) {
  const admin = getAdminUser(session);
  return !!admin && roles.includes(admin.role);
}
