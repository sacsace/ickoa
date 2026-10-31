import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteUser } from "@/lib/session-kind";
import { canManageSiteResource } from "@/lib/site-permissions";

/** 동호회 URL용 — 비ASCII 슬러그는 라우팅 문제가 있어 ASCII만 사용 */
export function slugifyClub(name: string) {
  const ascii = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return ascii || `club-${Date.now()}`;
}

export function revalidateClubPaths(slug?: string) {
  revalidatePath("/clubs");
  if (slug) {
    revalidatePath(`/clubs/${slug}`);
    revalidatePath(`/clubs/${slug}/edit`);
  }
  revalidatePath("/admin/clubs");
}

function normalizeClubSlug(raw: string) {
  let slug = raw.trim();
  try {
    slug = decodeURIComponent(slug);
  } catch {
    // keep raw
  }
  return slug.normalize("NFC");
}

export async function getClubBySlug(slug: string) {
  const normalized = normalizeClubSlug(slug);
  const include = {
    leader: { select: { id: true, name: true } },
  } as const;

  const direct = await prisma.club.findUnique({
    where: { slug: normalized },
    include,
  });
  if (direct) return direct;

  // 예전 한글 슬러그 URL (예: test-2-동화회) → ASCII 슬러그(test-2)로 조회
  const asciiPrefix = normalized
    .replace(/[^a-zA-Z0-9-]+.*$/, "")
    .replace(/-+$/, "");
  if (asciiPrefix.length >= 2 && asciiPrefix !== normalized) {
    return prisma.club.findUnique({
      where: { slug: asciiPrefix },
      include,
    });
  }

  return null;
}

export async function requireSiteUser() {
  const session = await auth();
  const site = getSiteUser(session);
  if (!site) {
    throw new Error("사이트 회원으로 로그인해 주세요.");
  }
  return {
    ...session!,
    user: { ...session!.user, ...site, id: site.id },
  };
}

/** 소개 수정·삭제는 그룹장(등록자) 또는 사이트 최고관리자 */
export async function requireClubLeader(clubId: string) {
  const session = await requireSiteUser();
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { leaderId: true, slug: true },
  });
  if (!club) throw new Error("동호회를 찾을 수 없습니다.");
  if (!canManageSiteResource(session.user, club.leaderId)) {
    throw new Error("동호회 그룹장만 할 수 있습니다.");
  }
  return { session, club };
}
