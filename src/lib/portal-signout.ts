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

/** 둘 다 종료. 이동 주소는 지금 보고 있는 사이트 도메인만 사용한다. */
export async function signOutAll(callbackUrl = "/") {
  const target = new URL(callbackUrl, window.location.origin);
  try {
    await signOut({ redirect: false, callbackUrl: `${target.pathname}${target.search}` });
  } catch {
    /* 세션 쿠키 삭제가 실패해도 현재 사이트로 돌아간다. */
  }
  window.location.assign(`${target.pathname}${target.search}${target.hash}` || "/");
}
