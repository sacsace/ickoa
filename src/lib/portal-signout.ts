"use client";

import { signOut } from "next-auth/react";

type UpdateFn = (data?: unknown) => Promise<unknown>;

/** 사이트만 로그아웃 (관리자 세션 유지) */
export async function signOutSite(
  update: UpdateFn,
  options?: { callbackUrl?: string },
) {
  await update({ clearPortal: "site" });
  if (options?.callbackUrl) {
    window.location.assign(options.callbackUrl);
    return;
  }
  window.location.reload();
}

/** 관리자만 로그아웃 (사이트 세션 유지) */
export async function signOutAdmin(
  update: UpdateFn,
  options?: { callbackUrl?: string },
) {
  await update({ clearPortal: "admin" });
  if (options?.callbackUrl) {
    window.location.assign(options.callbackUrl);
    return;
  }
  window.location.reload();
}

/** 둘 다 종료 */
export async function signOutAll(callbackUrl = "/") {
  await signOut({ callbackUrl });
}
