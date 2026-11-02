"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { slugifyClub } from "@/lib/clubs";
import { prisma } from "@/lib/prisma";
import { resolveMapsUrlCoords } from "@/lib/google-maps-url";
import { firstImageSrcFromHtml } from "@/lib/sanitize-html";
import { getAdminUser } from "@/lib/session-kind";
import type { Role } from "@prisma/client";

const ADMIN_ROLES: Role[] = [
  "SUPER_ADMIN",
  "CONTENT_ADMIN",
  "COMMUNITY_ADMIN",
  "EVENT_ADMIN",
];

async function requireAdmin(roles: Role[]) {
  const session = await auth();
  const admin = getAdminUser(session);
  if (!admin || !roles.includes(admin.role as Role)) {
    throw new Error("Unauthorized");
  }
  return { ...session!, user: { ...session!.user, ...admin, id: admin.id } };
}

export async function createNews(data: {
  title: string;
  content: string;
  category: string;
  region: string;
  image?: string;
}) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  const title = data.title.trim();
  const content = data.content.trim();
  if (!title || !content) throw new Error("제목과 내용을 입력해 주세요.");

  const news = await prisma.news.create({
    data: {
      title,
      content,
      category: data.category.trim() || "일반",
      region: data.region.trim() || "Chennai",
      image: data.image?.trim() || null,
    },
  });
  revalidatePath("/news");
  revalidatePath("/");
  revalidatePath("/admin/news");
  return news;
}

export async function updateNews(
  id: string,
  data: {
    title: string;
    content: string;
    category: string;
    region: string;
    image?: string;
  },
) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  const existing = await prisma.news.findUnique({ where: { id } });
  if (!existing) throw new Error("Not found");

  const title = data.title.trim();
  const content = data.content.trim();
  if (!title || !content) throw new Error("제목과 내용을 입력해 주세요.");

  const news = await prisma.news.update({
    where: { id },
    data: {
      title,
      content,
      category: data.category.trim() || "일반",
      region: data.region.trim() || "Chennai",
      image: data.image?.trim() || null,
    },
  });
  revalidatePath("/news");
  revalidatePath("/");
  revalidatePath("/admin/news");
  revalidatePath(`/admin/news/${id}`);
  revalidatePath(`/news/${id}`);
  return news;
}

export async function deleteNews(id: string) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  await prisma.news.delete({ where: { id } });
  revalidatePath("/news");
  revalidatePath("/");
  revalidatePath("/admin/news");
  revalidatePath(`/admin/news/${id}`);
  revalidatePath(`/news/${id}`);
}

function normalizeEventMapsUrl(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export async function createEvent(data: {
  title: string;
  description: string;
  date: Date;
  location: string;
  mapsUrl?: string;
  image?: string;
  maxAttendees: number;
}) {
  await requireAdmin(["SUPER_ADMIN", "EVENT_ADMIN"]);
  const title = data.title.trim();
  const description = data.description.trim();
  const location = data.location.trim();
  const mapsUrl = normalizeEventMapsUrl(data.mapsUrl);
  if (!title || !description || !location) {
    throw new Error("제목, 설명, 장소를 입력해 주세요.");
  }
  if (!(data.date instanceof Date) || Number.isNaN(data.date.getTime())) {
    throw new Error("올바른 일시를 입력해 주세요.");
  }

  const coords = mapsUrl ? await resolveMapsUrlCoords(mapsUrl) : null;
  const image =
    data.image?.trim() || firstImageSrcFromHtml(description) || null;

  const event = await prisma.event.create({
    data: {
      title,
      description,
      location,
      mapsUrl,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      date: data.date,
      image,
      maxAttendees: Math.max(1, Number(data.maxAttendees) || 50),
    },
  });
  revalidatePath("/events");
  revalidatePath("/");
  revalidatePath("/admin/events");
  return event;
}

export async function updateEvent(
  id: string,
  data: {
    title: string;
    description: string;
    date: Date;
    location: string;
    mapsUrl?: string;
    image?: string;
    maxAttendees: number;
  },
) {
  await requireAdmin(["SUPER_ADMIN", "EVENT_ADMIN"]);
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) throw new Error("Not found");

  const title = data.title.trim();
  const description = data.description.trim();
  const location = data.location.trim();
  const mapsUrl = normalizeEventMapsUrl(data.mapsUrl);
  if (!title || !description || !location) {
    throw new Error("제목, 설명, 장소를 입력해 주세요.");
  }
  if (!(data.date instanceof Date) || Number.isNaN(data.date.getTime())) {
    throw new Error("올바른 일시를 입력해 주세요.");
  }

  const coords = mapsUrl ? await resolveMapsUrlCoords(mapsUrl) : null;
  const image =
    data.image?.trim() || firstImageSrcFromHtml(description) || null;

  const event = await prisma.event.update({
    where: { id },
    data: {
      title,
      description,
      location,
      mapsUrl,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      date: data.date,
      image,
      maxAttendees: Math.max(1, Number(data.maxAttendees) || 50),
    },
  });
  revalidatePath("/events");
  revalidatePath("/");
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${id}`);
  revalidatePath(`/events/${id}`);
  return event;
}

export async function updateUserRole(userId: string, role: Role) {
  await requireAdmin(["SUPER_ADMIN"]);
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function deleteUser(userId: string) {
  try {
    const session = await requireAdmin(["SUPER_ADMIN"]);
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, loginId: true, role: true, name: true, email: true },
    });
    if (!target) return { error: "회원을 찾을 수 없습니다." };
    if (target.loginId === "root" || target.role === "SUPER_ADMIN") {
      return { error: "Root 관리자는 삭제할 수 없습니다." };
    }
    if (target.id === session.user.id) {
      return { error: "본인 계정은 삭제할 수 없습니다." };
    }

    await prisma.user.delete({ where: { id: userId } });
    revalidatePath("/admin/users");
    return {};
  } catch (err) {
    const message =
      err instanceof Error && err.message === "Unauthorized"
        ? "권한이 없습니다."
        : "회원 삭제에 실패했습니다.";
    return { error: message };
  }
}

export async function createAdminUser(data: {
  loginId: string;
  name: string;
  password: string;
  role: Role;
}) {
  await requireAdmin(["SUPER_ADMIN"]);

  const loginId = data.loginId.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(loginId)) {
    throw new Error("아이디는 3~20자의 영문 소문자, 숫자, 밑줄만 사용할 수 있습니다.");
  }
  if (data.password.length < 6) {
    throw new Error("비밀번호는 6자 이상이어야 합니다.");
  }
  if (!ADMIN_ROLES.includes(data.role)) {
    throw new Error("관리자 역할만 지정할 수 있습니다.");
  }

  const existing = await prisma.user.findUnique({ where: { loginId } });
  if (existing) {
    throw new Error("이미 사용 중인 아이디입니다.");
  }

  const hashed = await bcrypt.hash(data.password, 10);
  await prisma.user.create({
    data: {
      loginId,
      name: data.name.trim(),
      password: hashed,
      role: data.role,
    },
  });
  revalidatePath("/admin/users");
}

export async function resolveReport(reportId: string) {
  await requireAdmin(["SUPER_ADMIN", "COMMUNITY_ADMIN"]);
  await prisma.report.update({
    where: { id: reportId },
    data: { resolved: true },
  });
  revalidatePath("/admin/reports");
  revalidatePath(`/admin/reports/${reportId}`);
}

export async function createBanner(data: {
  title: string;
  image: string;
  link?: string;
  active?: boolean;
}) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  const banner = await prisma.banner.create({ data });
  revalidatePath("/admin/banners");
  return banner;
}

export async function togglePopup(id: string, active: boolean) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  await prisma.popup.update({ where: { id }, data: { active } });
  revalidatePath("/admin/popups");
}

export async function createGuide(data: {
  category: string;
  region: string;
  title: string;
  content: string;
}) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  const guide = await prisma.guide.create({ data });
  revalidatePath("/guide");
  revalidatePath("/admin/guides");
  return guide;
}

function slugifyGuideCategory(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9가-힣-_]/g, "")
    .slice(0, 60);
}

export async function createGuideCategory(data: {
  name: string;
  nameEn?: string;
  slug?: string;
  order?: number;
}) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  const name = data.name.trim();
  if (!name) throw new Error("카테고리 이름을 입력해 주세요.");

  const slug = (data.slug?.trim() || slugifyGuideCategory(name) || `cat-${Date.now()}`).slice(0, 60);
  const nameEn = data.nameEn?.trim() || null;
  const order = Number.isFinite(data.order) ? Number(data.order) : 0;

  const existing = await prisma.guideCategory.findFirst({
    where: { OR: [{ name }, { slug }] },
  });
  if (existing) throw new Error("이미 같은 이름 또는 슬러그의 카테고리가 있습니다.");

  const category = await prisma.guideCategory.create({
    data: { name, nameEn, slug, order },
  });
  revalidatePath("/guide");
  revalidatePath("/admin/guides");
  revalidatePath("/admin/guides/categories");
  return category;
}

export async function updateGuideCategory(
  id: string,
  data: { name: string; nameEn?: string; slug?: string; order?: number },
) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  const existing = await prisma.guideCategory.findUnique({ where: { id } });
  if (!existing) throw new Error("Not found");

  const name = data.name.trim();
  if (!name) throw new Error("카테고리 이름을 입력해 주세요.");
  const slug = (data.slug?.trim() || slugifyGuideCategory(name) || existing.slug).slice(0, 60);
  const nameEn = data.nameEn?.trim() || null;
  const order = Number.isFinite(data.order) ? Number(data.order) : existing.order;

  const conflict = await prisma.guideCategory.findFirst({
    where: {
      id: { not: id },
      OR: [{ name }, { slug }],
    },
  });
  if (conflict) throw new Error("이미 같은 이름 또는 슬러그의 카테고리가 있습니다.");

  const oldName = existing.name;
  const category = await prisma.guideCategory.update({
    where: { id },
    data: { name, nameEn, slug, order },
  });

  if (oldName !== name) {
    await prisma.guide.updateMany({
      where: { category: oldName },
      data: { category: name },
    });
  }

  revalidatePath("/guide");
  revalidatePath("/admin/guides");
  revalidatePath("/admin/guides/categories");
  return category;
}

export async function deleteGuideCategory(id: string) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  const existing = await prisma.guideCategory.findUnique({ where: { id } });
  if (!existing) return { error: "카테고리를 찾을 수 없습니다." };

  await prisma.$transaction([
    prisma.guide.deleteMany({ where: { category: existing.name } }),
    prisma.guideCategory.delete({ where: { id } }),
  ]);
  revalidatePath("/guide");
  revalidatePath("/admin/guides");
  revalidatePath("/admin/guides/categories");
  return {};
}

function slugifyTaxonomy(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9가-힣-_]/g, "")
    .slice(0, 60);
}


export async function createGalleryCategory(data: {
  name: string;
  nameEn?: string;
  slug?: string;
  order?: number;
}) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  const name = data.name.trim();
  if (!name) throw new Error("카테고리 이름을 입력해 주세요.");
  const slug = (data.slug?.trim() || slugifyTaxonomy(name) || `gal-${Date.now()}`).slice(0, 60);
  const nameEn = data.nameEn?.trim() || null;
  const order = Number.isFinite(data.order) ? Number(data.order) : 0;

  const existing = await prisma.galleryCategory.findFirst({
    where: { OR: [{ name }, { slug }] },
  });
  if (existing) throw new Error("이미 같은 이름 또는 슬러그의 카테고리가 있습니다.");

  const category = await prisma.galleryCategory.create({
    data: { name, nameEn, slug, order },
  });
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  revalidatePath("/admin/gallery/categories");
  return category;
}

export async function updateGalleryCategory(
  id: string,
  data: { name: string; nameEn?: string; slug?: string; order?: number },
) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  const existing = await prisma.galleryCategory.findUnique({ where: { id } });
  if (!existing) throw new Error("Not found");

  const name = data.name.trim();
  if (!name) throw new Error("카테고리 이름을 입력해 주세요.");
  const slug = (data.slug?.trim() || slugifyTaxonomy(name) || existing.slug).slice(0, 60);
  const nameEn = data.nameEn?.trim() || null;
  const order = Number.isFinite(data.order) ? Number(data.order) : existing.order;

  const conflict = await prisma.galleryCategory.findFirst({
    where: { id: { not: id }, OR: [{ name }, { slug }] },
  });
  if (conflict) throw new Error("이미 같은 이름 또는 슬러그의 카테고리가 있습니다.");

  const oldSlug = existing.slug;
  const category = await prisma.galleryCategory.update({
    where: { id },
    data: { name, nameEn, slug, order },
  });

  if (oldSlug !== slug) {
    await prisma.galleryAlbum.updateMany({
      where: { category: oldSlug },
      data: { category: slug },
    });
  }

  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  revalidatePath("/admin/gallery/categories");
  return category;
}

export async function deleteGalleryCategory(id: string) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  const existing = await prisma.galleryCategory.findUnique({ where: { id } });
  if (!existing) throw new Error("Not found");

  const albumCount = await prisma.galleryAlbum.count({
    where: { category: existing.slug },
  });
  if (albumCount > 0) {
    throw new Error(`이 카테고리에 앨범 ${albumCount}건이 있어 삭제할 수 없습니다.`);
  }

  await prisma.galleryCategory.delete({ where: { id } });
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  revalidatePath("/admin/gallery/categories");
}

export async function createBoard(data: {
  name: string;
  slug?: string;
  icon?: string;
  order?: number;
}) {
  await requireAdmin(["SUPER_ADMIN", "COMMUNITY_ADMIN", "CONTENT_ADMIN"]);
  const name = data.name.trim();
  if (!name) throw new Error("게시판 이름을 입력해 주세요.");
  const slug = (data.slug?.trim() || slugifyTaxonomy(name) || `board-${Date.now()}`).slice(0, 60);
  const icon = data.icon?.trim() || null;
  const order = Number.isFinite(data.order) ? Number(data.order) : 0;

  const existing = await prisma.board.findFirst({
    where: { OR: [{ name }, { slug }] },
  });
  if (existing) throw new Error("이미 같은 이름 또는 슬러그의 게시판이 있습니다.");

  const board = await prisma.board.create({ data: { name, slug, icon } });
  revalidatePath("/community");
  revalidatePath("/admin/boards");
  return board;
}

export async function updateBoard(
  id: string,
  data: { name: string; slug?: string; icon?: string; order?: number },
) {
  await requireAdmin(["SUPER_ADMIN", "COMMUNITY_ADMIN", "CONTENT_ADMIN"]);
  const existing = await prisma.board.findUnique({ where: { id } });
  if (!existing) throw new Error("Not found");

  const name = data.name.trim();
  if (!name) throw new Error("게시판 이름을 입력해 주세요.");
  const slug = (data.slug?.trim() || slugifyTaxonomy(name) || existing.slug).slice(0, 60);
  const icon = data.icon?.trim() || null;

  const conflict = await prisma.board.findFirst({
    where: { id: { not: id }, OR: [{ name }, { slug }] },
  });
  if (conflict) throw new Error("이미 같은 이름 또는 슬러그의 게시판이 있습니다.");

  const board = await prisma.board.update({
    where: { id },
    data: { name, slug, icon },
  });
  revalidatePath("/community");
  revalidatePath(`/community/${existing.slug}`);
  revalidatePath(`/community/${slug}`);
  revalidatePath("/admin/boards");
  return board;
}

export async function deleteBoard(id: string) {
  await requireAdmin(["SUPER_ADMIN", "COMMUNITY_ADMIN", "CONTENT_ADMIN"]);
  const existing = await prisma.board.findUnique({ where: { id } });
  if (!existing) throw new Error("Not found");

  const postCount = await prisma.post.count({ where: { boardId: id } });
  if (postCount > 0) {
    throw new Error(`이 게시판에 글 ${postCount}건이 있어 삭제할 수 없습니다.`);
  }

  await prisma.board.delete({ where: { id } });
  revalidatePath("/community");
  revalidatePath("/admin/boards");
}

async function resolveClubLeaderId(leaderEmail?: string | null) {
  const email = leaderEmail?.trim().toLowerCase();
  if (!email) return null;
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true },
  });
  if (!user) throw new Error("그룹장으로 지정할 회원을 찾을 수 없습니다. (이메일 확인)");
  return user.id;
}

async function ensureClubLeaderMembership(clubId: string, leaderId: string) {
  await prisma.clubMember.upsert({
    where: { clubId_userId: { clubId, userId: leaderId } },
    update: { role: "leader", status: "APPROVED" },
    create: {
      clubId,
      userId: leaderId,
      role: "leader",
      status: "APPROVED",
    },
  });
}

export async function createClub(data: {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  order?: number;
  leaderEmail?: string;
}) {
  await requireAdmin(["SUPER_ADMIN", "COMMUNITY_ADMIN", "CONTENT_ADMIN"]);
  const name = data.name.trim();
  if (!name) throw new Error("동호회 이름을 입력해 주세요.");
  const slug = (data.slug?.trim() || slugifyClub(name)).slice(0, 60);
  const description = data.description?.trim() || null;
  const icon = data.icon?.trim() || null;
  const order = Number.isFinite(data.order) ? Number(data.order) : 0;
  const leaderId = await resolveClubLeaderId(data.leaderEmail);
  if (!leaderId) throw new Error("그룹장 이메일을 입력해 주세요.");

  const existing = await prisma.club.findFirst({
    where: { OR: [{ name }, { slug }] },
  });
  if (existing) throw new Error("이미 같은 이름 또는 슬러그의 동호회가 있습니다.");

  const club = await prisma.club.create({
    data: { name, slug, description, icon, order, leaderId },
  });
  await ensureClubLeaderMembership(club.id, leaderId);
  revalidatePath("/clubs");
  revalidatePath(`/clubs/${club.slug}`);
  revalidatePath("/admin/clubs");
  return club;
}

export async function updateClub(
  id: string,
  data: {
    name: string;
    slug?: string;
    description?: string;
    icon?: string;
    order?: number;
    leaderEmail?: string;
  },
) {
  await requireAdmin(["SUPER_ADMIN", "COMMUNITY_ADMIN", "CONTENT_ADMIN"]);
  const existing = await prisma.club.findUnique({
    where: { id },
    include: { leader: { select: { email: true } } },
  });
  if (!existing) throw new Error("Not found");

  const name = data.name.trim();
  if (!name) throw new Error("동호회 이름을 입력해 주세요.");
  const slug = (data.slug?.trim() || slugifyClub(name) || existing.slug).slice(0, 60);
  const description = data.description?.trim() || null;
  const icon = data.icon?.trim() || null;
  const leaderEmail =
    data.leaderEmail?.trim() || existing.leader?.email || undefined;
  const leaderId = await resolveClubLeaderId(leaderEmail);
  if (!leaderId) throw new Error("그룹장 이메일을 입력해 주세요.");

  const conflict = await prisma.club.findFirst({
    where: { id: { not: id }, OR: [{ name }, { slug }] },
  });
  if (conflict) throw new Error("이미 같은 이름 또는 슬러그의 동호회가 있습니다.");

  if (existing.leaderId && existing.leaderId !== leaderId) {
    await prisma.clubMember.updateMany({
      where: { clubId: id, userId: existing.leaderId, role: "leader" },
      data: { role: "member" },
    });
  }

  const club = await prisma.club.update({
    where: { id },
    data: { name, slug, description, icon, leaderId },
  });
  await ensureClubLeaderMembership(club.id, leaderId);
  revalidatePath("/clubs");
  revalidatePath(`/clubs/${club.slug}`);
  revalidatePath("/admin/clubs");
  return club;
}

export async function deleteClub(id: string) {
  try {
    await requireAdmin(["SUPER_ADMIN", "COMMUNITY_ADMIN", "CONTENT_ADMIN"]);
    const existing = await prisma.club.findUnique({ where: { id } });
    if (!existing) return { error: "동호회를 찾을 수 없습니다." };

    // Members/notices cascade via Prisma relations — admin delete is intentional.
    await prisma.club.delete({ where: { id } });
    revalidatePath("/clubs");
    revalidatePath(`/clubs/${existing.slug}`);
    revalidatePath("/admin/clubs");
    return {};
  } catch (err) {
    const message =
      err instanceof Error && err.message === "Unauthorized"
        ? "권한이 없습니다."
        : "동호회 삭제에 실패했습니다.";
    return { error: message };
  }
}

export async function approveClubRequest(id: string) {
  await requireAdmin(["SUPER_ADMIN", "COMMUNITY_ADMIN", "CONTENT_ADMIN"]);
  const request = await prisma.clubRequest.findUnique({ where: { id } });
  if (!request) throw new Error("요청을 찾을 수 없습니다.");
  if (request.status !== "PENDING") throw new Error("이미 처리된 요청입니다.");

  const name = request.name.trim();
  const slug = slugifyClub(name).slice(0, 60);
  const existing = await prisma.club.findFirst({
    where: { OR: [{ name }, { slug }] },
  });
  if (existing) throw new Error("이미 같은 이름 또는 슬러그의 동호회가 있습니다.");

  const club = await prisma.club.create({
    data: {
      name,
      slug,
      description: request.description,
      leaderId: request.userId,
    },
  });
  await prisma.clubMember.upsert({
    where: { clubId_userId: { clubId: club.id, userId: request.userId } },
    update: { role: "leader", status: "APPROVED" },
    create: {
      clubId: club.id,
      userId: request.userId,
      role: "leader",
      status: "APPROVED",
    },
  });
  await prisma.clubRequest.update({
    where: { id },
    data: { status: "APPROVED", reviewedAt: new Date() },
  });
  revalidatePath("/clubs");
  revalidatePath(`/clubs/${club.slug}`);
  revalidatePath(`/clubs/${club.slug}/members`);
  revalidatePath(`/clubs/${club.slug}/notices`);
  revalidatePath("/admin/clubs");
  revalidatePath("/admin/club-requests");
}

export async function rejectClubRequest(id: string) {
  await requireAdmin(["SUPER_ADMIN", "COMMUNITY_ADMIN", "CONTENT_ADMIN"]);
  const request = await prisma.clubRequest.findUnique({ where: { id } });
  if (!request) throw new Error("요청을 찾을 수 없습니다.");
  if (request.status !== "PENDING") throw new Error("이미 처리된 요청입니다.");

  await prisma.clubRequest.update({
    where: { id },
    data: { status: "REJECTED", reviewedAt: new Date() },
  });
  revalidatePath("/admin/club-requests");
}

function parseOptionalFloat(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

export async function createBusinessCategory(data: {
  name: string;
  nameEn?: string;
  slug?: string;
  order?: number;
}) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN", "COMMUNITY_ADMIN"]);
  const name = data.name.trim();
  if (!name) throw new Error("업종 이름을 입력해 주세요.");
  const slug = (data.slug?.trim() || slugifyTaxonomy(name) || `biz-${Date.now()}`).slice(0, 60);
  const nameEn = data.nameEn?.trim() || null;
  const order = Number.isFinite(data.order) ? Number(data.order) : 0;

  const existing = await prisma.businessCategory.findFirst({
    where: { OR: [{ name }, { slug }] },
  });
  if (existing) throw new Error("이미 같은 이름 또는 슬러그의 업종이 있습니다.");

  const category = await prisma.businessCategory.create({
    data: { name, nameEn, slug, order },
  });
  revalidatePath("/business");
  revalidatePath("/admin/businesses");
  revalidatePath("/admin/businesses/categories");
  return category;
}

export async function updateBusinessCategory(
  id: string,
  data: { name: string; nameEn?: string; slug?: string; order?: number },
) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN", "COMMUNITY_ADMIN"]);
  const existing = await prisma.businessCategory.findUnique({ where: { id } });
  if (!existing) throw new Error("Not found");

  const name = data.name.trim();
  if (!name) throw new Error("업종 이름을 입력해 주세요.");
  const slug = (data.slug?.trim() || slugifyTaxonomy(name) || existing.slug).slice(0, 60);
  const nameEn = data.nameEn?.trim() || null;
  const order = Number.isFinite(data.order) ? Number(data.order) : existing.order;

  const conflict = await prisma.businessCategory.findFirst({
    where: { id: { not: id }, OR: [{ name }, { slug }] },
  });
  if (conflict) throw new Error("이미 같은 이름 또는 슬러그의 업종이 있습니다.");

  const category = await prisma.businessCategory.update({
    where: { id },
    data: { name, nameEn, slug, order },
  });

  if (existing.name !== name) {
    await prisma.business.updateMany({
      where: { category: existing.name },
      data: { category: name },
    });
  }

  revalidatePath("/business");
  revalidatePath("/admin/businesses");
  revalidatePath("/admin/businesses/categories");
  return category;
}

export async function deleteBusinessCategory(id: string) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN", "COMMUNITY_ADMIN"]);
  const existing = await prisma.businessCategory.findUnique({ where: { id } });
  if (!existing) throw new Error("Not found");

  const businessCount = await prisma.business.count({
    where: { category: existing.name },
  });
  if (businessCount > 0) {
    throw new Error(`이 업종에 기업 ${businessCount}곳이 있어 삭제할 수 없습니다.`);
  }

  await prisma.businessCategory.delete({ where: { id } });
  revalidatePath("/business");
  revalidatePath("/admin/businesses");
  revalidatePath("/admin/businesses/categories");
}

type BusinessInput = {
  name: string;
  nameEn?: string;
  category: string;
  products?: string;
  region: string;
  address: string;
  phone?: string;
  website?: string;
  parentCompany?: string;
  ceoName?: string;
  ceoTitle?: string;
  contactName?: string;
  contactTitle?: string;
  contactPhone?: string;
  contactEmail?: string;
  mapsUrl?: string;
  lat?: string;
  lng?: string;
  description?: string;
  hideParentCompany?: boolean;
  hideCeo?: boolean;
  hideContactPerson?: boolean;
  hideContactPhone?: boolean;
  hideContactEmail?: boolean;
  hideWebsite?: boolean;
  hideAddress?: boolean;
  hideMapsUrl?: boolean;
};

function normalizeBusinessMapsUrl(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

async function prepareBusinessData(data: BusinessInput) {
  const name = data.name.trim();
  const category = data.category.trim();
  const region = data.region.trim() || "Chennai";
  const address = data.address.trim();
  if (!name || !category || !address) {
    throw new Error("한글 법인명, 업태, 주소를 입력해 주세요.");
  }
  const contactPhone = data.contactPhone?.trim() || data.phone?.trim() || null;
  const mapsUrl = normalizeBusinessMapsUrl(data.mapsUrl);
  let lat = parseOptionalFloat(data.lat);
  let lng = parseOptionalFloat(data.lng);
  if ((lat == null || lng == null) && mapsUrl) {
    const coords = await resolveMapsUrlCoords(mapsUrl);
    lat = coords?.lat ?? null;
    lng = coords?.lng ?? null;
  }
  return {
    name,
    nameEn: data.nameEn?.trim() || null,
    category,
    products: data.products?.trim() || null,
    region,
    address,
    parentCompany: data.parentCompany?.trim() || null,
    ceoName: data.ceoName?.trim() || null,
    ceoTitle: data.ceoTitle?.trim() || null,
    contactName: data.contactName?.trim() || null,
    contactTitle: data.contactTitle?.trim() || null,
    contactPhone,
    contactEmail: data.contactEmail?.trim() || null,
    phone: contactPhone,
    website: data.website?.trim().replace(/^https?:\/\//, "") || null,
    mapsUrl,
    lat,
    lng,
    description: data.description?.trim() || data.products?.trim() || null,
    hideParentCompany: !!data.hideParentCompany,
    hideCeo: !!data.hideCeo,
    hideContactPerson: !!data.hideContactPerson,
    hideContactPhone: !!data.hideContactPhone,
    hideContactEmail: !!data.hideContactEmail,
    hideWebsite: !!data.hideWebsite,
    hideAddress: !!data.hideAddress,
    hideMapsUrl: !!data.hideMapsUrl,
  };
}

export async function createBusiness(data: BusinessInput) {
  const session = await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN", "COMMUNITY_ADMIN"]);
  const prepared = await prepareBusinessData(data);

  const business = await prisma.business.create({
    data: {
      ...prepared,
      ownerId: session.user.id,
    },
  });
  revalidatePath("/business");
  revalidatePath("/");
  revalidatePath("/admin/businesses");
  return business;
}

export async function updateBusiness(id: string, data: BusinessInput) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN", "COMMUNITY_ADMIN"]);
  const existing = await prisma.business.findUnique({ where: { id } });
  if (!existing) throw new Error("Not found");

  const prepared = await prepareBusinessData(data);
  const business = await prisma.business.update({
    where: { id },
    data: prepared,
  });
  revalidatePath("/business");
  revalidatePath(`/business/${id}`);
  revalidatePath("/");
  revalidatePath("/admin/businesses");
  return business;
}

export async function deleteBusiness(id: string) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN", "COMMUNITY_ADMIN"]);
  const existing = await prisma.business.findUnique({ where: { id } });
  if (!existing) throw new Error("Not found");
  await prisma.business.delete({ where: { id } });
  revalidatePath("/business");
  revalidatePath("/");
  revalidatePath("/admin/businesses");
}

export type BusinessBulkRow = {
  name: string;
  category: string;
  region: string;
  address: string;
  phone?: string;
  website?: string;
  lat?: string;
  lng?: string;
  description?: string;
};

export async function createBusinessesBulk(rows: BusinessBulkRow[]) {
  const session = await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN", "COMMUNITY_ADMIN"]);
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("등록할 기업이 없습니다.");
  }
  if (rows.length > 500) {
    throw new Error("한 번에 최대 500곳까지 등록할 수 있습니다.");
  }

  const prepared: {
    name: string;
    category: string;
    region: string;
    address: string;
    phone: string | null;
    website: string | null;
    lat: number | null;
    lng: number | null;
    description: string | null;
    ownerId: string;
  }[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();

  rows.forEach((row, index) => {
    const line = index + 2; // header + 1-based
    const name = String(row.name ?? "").trim();
    const category = String(row.category ?? "").trim();
    const region = String(row.region ?? "").trim();
    const address = String(row.address ?? "").trim();
    if (!name || !category || !region || !address) {
      errors.push(`${line}행: 기업명·업종·지역·주소는 필수입니다.`);
      return;
    }
    const key = `${name.toLowerCase()}|${address.toLowerCase()}`;
    if (seen.has(key)) {
      errors.push(`${line}행: 파일 안에 같은 기업명·주소가 중복됩니다.`);
      return;
    }
    seen.add(key);
    prepared.push({
      name,
      category,
      region,
      address,
      phone: String(row.phone ?? "").trim() || null,
      website: String(row.website ?? "").trim().replace(/^https?:\/\//, "") || null,
      lat: parseOptionalFloat(row.lat),
      lng: parseOptionalFloat(row.lng),
      description: String(row.description ?? "").trim() || null,
      ownerId: session.user.id,
    });
  });

  if (prepared.length === 0) {
    throw new Error(errors[0] || "유효한 행이 없습니다.");
  }

  const existing = await prisma.business.findMany({
    where: {
      OR: prepared.map((p) => ({ name: p.name, address: p.address })),
    },
    select: { name: true, address: true },
  });
  const existingKeys = new Set(
    existing.map((e) => `${e.name.toLowerCase()}|${e.address.toLowerCase()}`),
  );

  const toCreate = prepared.filter((p) => {
    const key = `${p.name.toLowerCase()}|${p.address.toLowerCase()}`;
    if (existingKeys.has(key)) {
      errors.push(`건너뜀: 이미 등록된 「${p.name}」`);
      return false;
    }
    return true;
  });

  if (toCreate.length > 0) {
    await prisma.business.createMany({ data: toCreate });
  }

  revalidatePath("/business");
  revalidatePath("/");
  revalidatePath("/admin/businesses");

  return {
    created: toCreate.length,
    skipped: prepared.length - toCreate.length,
    errors: errors.slice(0, 20),
  };
}

export async function deletePost(postId: string) {
  await requireAdmin(["SUPER_ADMIN", "COMMUNITY_ADMIN"]);
  await prisma.post.delete({ where: { id: postId } });
  revalidatePath("/community");
  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${postId}`);
}

export async function createMagazineIssue(formData: FormData) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);

  const volume = parseInt(String(formData.get("volume")), 10);
  const publishedAt = String(formData.get("publishedAt") ?? "").trim();
  const title = String(formData.get("title") ?? "다이나믹 코리안").trim();
  const subtitle = String(formData.get("subtitle") ?? "재인도 첸나이 한인회보").trim();
  const editorNote = String(formData.get("editorNote") ?? "").trim() || null;
  const pdfFile = formData.get("pdf") as File | null;
  const coverFile = formData.get("cover") as File | null;
  const coverUrlInput = String(formData.get("coverUrl") ?? "").trim();

  if (!volume || Number.isNaN(volume)) {
    throw new Error("호수(volume)를 입력해 주세요.");
  }
  if (!publishedAt) {
    throw new Error("발행일(YYYY-MM)을 입력해 주세요.");
  }
  if (!pdfFile || pdfFile.size === 0) {
    throw new Error("PDF 파일을 선택해 주세요.");
  }
  if (pdfFile.type !== "application/pdf") {
    throw new Error("PDF 파일만 업로드할 수 있습니다.");
  }

  const existing = await prisma.magazineIssue.findUnique({ where: { volume } });
  if (existing) {
    throw new Error(`Vol.${volume}은(는) 이미 등록되어 있습니다.`);
  }

  const { uploadMagazineFile } = await import("@/lib/s3");
  const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
  const pdfUrl = await uploadMagazineFile(pdfBuffer, pdfFile.name, pdfFile.type);

  let coverImage = coverUrlInput;
  if (coverFile && coverFile.size > 0) {
    const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
    coverImage = await uploadMagazineFile(coverBuffer, coverFile.name, coverFile.type);
  }
  // Cover is optional — site UI renders PDF page 1 as the main image when pdfUrl exists.
  if (!coverImage) {
    coverImage = "/magazine/dynamic-korean-cover-vol17.png";
  }

  const slug = `vol-${volume}`;
  const issue = await prisma.magazineIssue.create({
    data: {
      slug,
      volume,
      title,
      subtitle,
      publishedAt,
      coverImage,
      pdfUrl,
      editorNote,
      published: true,
    },
  });

  revalidatePath("/magazine");
  revalidatePath("/");
  revalidatePath("/admin/magazine");
  revalidatePath(`/magazine/${slug}`);
  revalidatePath(`/magazine/${slug}/read`);

  return issue;
}

export async function toggleMagazinePublished(id: string, published: boolean) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  const issue = await prisma.magazineIssue.update({
    where: { id },
    data: { published },
  });
  revalidatePath("/magazine");
  revalidatePath("/");
  revalidatePath("/admin/magazine");
  revalidatePath(`/magazine/${issue.slug}`);
  return issue;
}

export async function deleteMagazineIssue(id: string) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  const issue = await prisma.magazineIssue.delete({ where: { id } });
  revalidatePath("/magazine");
  revalidatePath("/");
  revalidatePath("/admin/magazine");
  revalidatePath(`/admin/magazine/${id}`);
  revalidatePath(`/magazine/${issue.slug}`);
}

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const MAX_HERO_BYTES = 25 * 1024 * 1024;

const IMAGE_EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

const VIDEO_EXT_MIME: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

function resolveHeroMimeType(file: File, mediaType: "IMAGE" | "VIDEO") {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const map = mediaType === "VIDEO" ? VIDEO_EXT_MIME : IMAGE_EXT_MIME;
  return map[ext] ?? "";
}

export async function submitHeroSlide(
  _prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null; resetKey?: number }> {
  try {
    await createHeroSlide(formData);
    return { error: null, resetKey: Date.now() };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "등록에 실패했습니다.",
    };
  }
}

export async function createHeroSlide(formData: FormData) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);

  const mediaType = String(formData.get("mediaType") ?? "IMAGE").toUpperCase();
  const caption = String(formData.get("caption") ?? "").trim() || null;
  const captionEn = String(formData.get("captionEn") ?? "").trim() || null;
  const link = String(formData.get("link") ?? "").trim() || null;
  const mediaUrlInput = String(formData.get("mediaUrl") ?? "").trim();
  const mediaFile = formData.get("media") as File | null;

  if (mediaType !== "IMAGE" && mediaType !== "VIDEO") {
    throw new Error("미디어 유형은 IMAGE 또는 VIDEO여야 합니다.");
  }

  let mediaUrl = mediaUrlInput;

  if (mediaFile && mediaFile.size > 0) {
    if (mediaFile.size > MAX_HERO_BYTES) {
      throw new Error("파일 크기는 25MB 이하여야 합니다.");
    }
    const allowed = mediaType === "VIDEO" ? VIDEO_TYPES : IMAGE_TYPES;
    const mimeType = resolveHeroMimeType(mediaFile, mediaType as "IMAGE" | "VIDEO");
    if (!mimeType || !allowed.has(mimeType)) {
      throw new Error(
        mediaType === "VIDEO"
          ? "MP4, WebM, MOV 동영상만 업로드할 수 있습니다."
          : "JPEG, PNG, WebP, GIF 이미지만 업로드할 수 있습니다.",
      );
    }
    const { uploadHeroFile } = await import("@/lib/s3");
    const buffer = Buffer.from(await mediaFile.arrayBuffer());
    mediaUrl = await uploadHeroFile(buffer, mediaFile.name, mimeType);
  }

  if (!mediaUrl) {
    throw new Error("미디어 파일 또는 URL을 입력해 주세요.");
  }

  const maxOrder = await prisma.heroSlide.aggregate({ _max: { order: true } });
  const order = (maxOrder._max.order ?? -1) + 1;

  const slide = await prisma.heroSlide.create({
    data: { mediaType, mediaUrl, caption, captionEn, link, order, active: true },
  });

  revalidatePath("/");
  revalidatePath("/admin/hero");
  return slide;
}

export async function toggleHeroSlideActive(id: string, active: boolean) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  await prisma.heroSlide.update({ where: { id }, data: { active } });
  revalidatePath("/");
  revalidatePath("/admin/hero");
}

export async function deleteHeroSlide(id: string) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  await prisma.heroSlide.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/hero");
}

export async function moveHeroSlide(id: string, direction: "up" | "down") {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);

  const slides = await prisma.heroSlide.findMany({ orderBy: { order: "asc" } });
  const index = slides.findIndex((s) => s.id === id);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= slides.length) return;

  const current = slides[index]!;
  const target = slides[swapIndex]!;

  await prisma.$transaction([
    prisma.heroSlide.update({
      where: { id: current.id },
      data: { order: target.order },
    }),
    prisma.heroSlide.update({
      where: { id: target.id },
      data: { order: current.order },
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/admin/hero");
}

export async function deleteEvent(id: string) {
  await requireAdmin(["SUPER_ADMIN", "EVENT_ADMIN"]);
  await prisma.event.delete({ where: { id } });
  revalidatePath("/events");
  revalidatePath("/");
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${id}`);
  revalidatePath(`/events/${id}`);
}

export async function deleteGuide(id: string) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  await prisma.guide.delete({ where: { id } });
  revalidatePath("/guide");
  revalidatePath("/admin/guides");
  revalidatePath(`/admin/guides/${id}`);
}

export async function toggleBannerActive(id: string, active: boolean) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  await prisma.banner.update({ where: { id }, data: { active } });
  revalidatePath("/admin/banners");
}

export async function deleteBanner(id: string) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  await prisma.banner.delete({ where: { id } });
  revalidatePath("/admin/banners");
  revalidatePath(`/admin/banners/${id}`);
}

export async function createGalleryAlbum(formData: FormData) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);

  const { slugifyGallery } = await import("@/lib/gallery-data");
  const title = String(formData.get("title") ?? "").trim();
  const titleEn = String(formData.get("titleEn") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const category = String(formData.get("category") ?? "ickoa").trim();
  const coverUrl = String(formData.get("coverUrl") ?? "").trim();
  const coverFile = formData.get("cover") as File | null;

  if (!title) throw new Error("제목을 입력해 주세요.");

  let baseSlug = slugifyGallery(rawSlug || titleEn || title);
  let slug = baseSlug;
  let n = 2;
  for (;;) {
    const clash = await prisma.galleryAlbum.findUnique({ where: { slug }, select: { id: true } });
    if (!clash) break;
    slug = `${baseSlug}-${n++}`;
  }

  let cover = coverUrl;
  if (coverFile && coverFile.size > 0) {
    if (!IMAGE_TYPES.has(coverFile.type)) throw new Error("이미지 파일만 업로드할 수 있습니다.");
    const { uploadGalleryFile } = await import("@/lib/s3");
    cover = await uploadGalleryFile(
      Buffer.from(await coverFile.arrayBuffer()),
      coverFile.name,
      coverFile.type,
    );
  }
  if (!cover) throw new Error("표지 이미지를 업로드하거나 URL을 입력해 주세요.");

  const maxOrder = await prisma.galleryAlbum.aggregate({ _max: { order: true } });

  const album = await prisma.galleryAlbum.create({
    data: {
      slug,
      title,
      titleEn: titleEn || title,
      cover,
      category,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  revalidateGallery(album.id, album.slug);
  return album;
}

export async function updateGalleryAlbum(
  id: string,
  data: {
    title: string;
    titleEn?: string;
    slug?: string;
    description?: string;
    descriptionEn?: string;
    category?: string;
  },
) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);

  const { slugifyGallery, isSafeGallerySlug } = await import("@/lib/gallery-data");
  const title = data.title.trim();
  if (!title) throw new Error("제목을 입력해 주세요.");

  const existing = await prisma.galleryAlbum.findUnique({ where: { id } });
  if (!existing) throw new Error("앨범을 찾을 수 없습니다.");

  const titleEn = (data.titleEn ?? "").trim() || title;
  const description = (data.description ?? "").trim();
  const descriptionEn = (data.descriptionEn ?? "").trim();
  const category = (data.category ?? existing.category).trim() || existing.category;

  let slug = existing.slug;
  const rawSlug = (data.slug ?? "").trim();
  if (rawSlug) {
    const next = slugifyGallery(rawSlug);
    if (!isSafeGallerySlug(next)) throw new Error("슬러그는 영문·숫자·하이픈만 사용할 수 있습니다.");
    if (next !== existing.slug) {
      const clash = await prisma.galleryAlbum.findFirst({
        where: { slug: next, NOT: { id } },
        select: { id: true },
      });
      if (clash) throw new Error("이미 사용 중인 슬러그입니다.");
      slug = next;
    }
  } else if (!isSafeGallerySlug(existing.slug)) {
    slug = slugifyGallery(titleEn || title);
  }

  const album = await prisma.galleryAlbum.update({
    where: { id },
    data: { title, titleEn, slug, description, descriptionEn, category },
  });

  revalidateGallery(album.id, album.slug);
  if (existing.slug !== album.slug) revalidateGallery(album.id, existing.slug);
  return album;
}

export async function addGalleryPhoto(formData: FormData) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);

  const albumId = String(formData.get("albumId") ?? "");
  const caption = String(formData.get("caption") ?? "").trim();
  const photoUrl = String(formData.get("photoUrl") ?? "").trim();
  const photoFile = formData.get("photo") as File | null;

  let src = photoUrl;
  if (photoFile && photoFile.size > 0) {
    if (!IMAGE_TYPES.has(photoFile.type)) throw new Error("이미지 파일만 업로드할 수 있습니다.");
    const { uploadGalleryFile } = await import("@/lib/s3");
    src = await uploadGalleryFile(
      Buffer.from(await photoFile.arrayBuffer()),
      photoFile.name,
      photoFile.type,
    );
  }
  if (!src) throw new Error("사진 파일 또는 URL을 입력해 주세요.");

  const maxOrder = await prisma.galleryPhoto.aggregate({
    where: { albumId },
    _max: { order: true },
  });

  const photo = await prisma.galleryPhoto.create({
    data: {
      albumId,
      src,
      caption,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  const album = await prisma.galleryAlbum.findUnique({
    where: { id: albumId },
    include: { photos: { select: { id: true } } },
  });
  // First photo (or missing cover) → use uploaded image as cover.
  if (album && (!album.cover?.trim() || album.photos.length <= 1)) {
    await prisma.galleryAlbum.update({ where: { id: albumId }, data: { cover: src } });
  }

  const { ensureSafeGallerySlug } = await import("@/lib/gallery-data");
  const repaired = await ensureSafeGallerySlug(albumId);

  revalidateGallery(albumId, repaired?.slug ?? album?.slug);
  return photo;
}

export async function deleteGalleryAlbum(id: string) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  const album = await prisma.galleryAlbum.findUnique({ where: { id }, select: { slug: true } });
  await prisma.galleryAlbum.delete({ where: { id } });
  revalidateGallery(id, album?.slug);
}

export async function deleteGalleryPhoto(id: string) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  const photo = await prisma.galleryPhoto.delete({ where: { id } });
  const album = await prisma.galleryAlbum.findUnique({
    where: { id: photo.albumId },
    select: { slug: true },
  });
  revalidateGallery(photo.albumId, album?.slug);
}

export async function toggleGalleryAlbumPublished(id: string, published: boolean) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  const { ensureSafeGallerySlug } = await import("@/lib/gallery-data");
  const repaired = await ensureSafeGallerySlug(id);
  await prisma.galleryAlbum.update({ where: { id }, data: { published } });
  revalidateGallery(id, repaired?.slug);
}

function revalidateGallery(albumId?: string, slug?: string) {
  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  if (albumId) {
    revalidatePath(`/admin/gallery/${albumId}`);
    revalidatePath(`/gallery/${albumId}`);
  }
  if (slug) revalidatePath(`/gallery/${slug}`);
}
