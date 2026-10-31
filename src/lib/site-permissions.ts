/** 사이트(회원) 영역에서 root / SUPER_ADMIN 전역 관리 권한 */

export type SiteActor = {
  id: string;
  role?: string | null;
  loginId?: string | null;
};

export function isSiteSuperuser(
  user: { role?: string | null; loginId?: string | null } | null | undefined,
) {
  if (!user) return false;
  if (user.loginId === "root") return true;
  if (user.role === "SUPER_ADMIN") return true;
  return false;
}

/** 본인 소유이거나 사이트 최고관리자이면 수정·삭제 가능 */
export function canManageSiteResource(
  user: SiteActor | null | undefined,
  ownerId: string | null | undefined,
) {
  if (!user?.id) return false;
  if (isSiteSuperuser(user)) return true;
  return !!ownerId && ownerId === user.id;
}
