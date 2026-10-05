import type { Session } from "next-auth";
import { isAdmin } from "@/lib/permissions-client";

export type SessionKind = "site" | "admin";

export function isSiteSession(session: Session | null | undefined) {
  return !!session?.user && session.sessionKind === "site";
}

export function isAdminSession(session: Session | null | undefined) {
  return (
    !!session?.user &&
    session.sessionKind === "admin" &&
    isAdmin(session.user.role)
  );
}
