import type { Role } from "@prisma/client";

const ADMIN_ROLES: Role[] = [
  "SUPER_ADMIN",
  "CONTENT_ADMIN",
  "COMMUNITY_ADMIN",
  "EVENT_ADMIN",
];

export function isAdmin(role: Role) {
  return ADMIN_ROLES.includes(role);
}

export function canManageContent(role: Role) {
  return role === "SUPER_ADMIN" || role === "CONTENT_ADMIN";
}

export function canManageCommunity(role: Role) {
  return role === "SUPER_ADMIN" || role === "COMMUNITY_ADMIN";
}

export function canManageEvents(role: Role) {
  return role === "SUPER_ADMIN" || role === "EVENT_ADMIN";
}

export function canManageAll(role: Role) {
  return role === "SUPER_ADMIN";
}
