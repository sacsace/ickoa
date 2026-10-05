import type { Role } from "@prisma/client";

const ADMIN_ROLES: Role[] = [
  "SUPER_ADMIN",
  "CONTENT_ADMIN",
  "COMMUNITY_ADMIN",
  "EVENT_ADMIN",
];

export function isAdmin(role?: string) {
  return !!role && ADMIN_ROLES.includes(role as Role);
}
