"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

const ADMIN_ROLES: Role[] = [
  "SUPER_ADMIN",
  "CONTENT_ADMIN",
  "COMMUNITY_ADMIN",
  "EVENT_ADMIN",
];

async function requireAdmin(roles: Role[]) {
  const session = await auth();
  if (!session?.user || !roles.includes(session.user.role as Role)) {
    throw new Error("Unauthorized");
  }
  return session;
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

export async function createEvent(data: {
  title: string;
  description: string;
  date: Date;
  location: string;
  image?: string;
  maxAttendees: number;
}) {
  await requireAdmin(["SUPER_ADMIN", "EVENT_ADMIN"]);
  const title = data.title.trim();
  const description = data.description.trim();
  const location = data.location.trim();
  if (!title || !description || !location) {
    throw new Error("제목, 설명, 장소를 입력해 주세요.");
  }
  if (!(data.date instanceof Date) || Number.isNaN(data.date.getTime())) {
    throw new Error("올바른 일시를 입력해 주세요.");
  }

  const event = await prisma.event.create({
    data: {
      title,
      description,
      location,
      date: data.date,
      image: data.image?.trim() || null,
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
  if (!title || !description || !location) {
    throw new Error("제목, 설명, 장소를 입력해 주세요.");
  }
  if (!(data.date instanceof Date) || Number.isNaN(data.date.getTime())) {
    throw new Error("올바른 일시를 입력해 주세요.");
  }

  const event = await prisma.event.update({
    where: { id },
    data: {
      title,
      description,
      location,
      date: data.date,
      image: data.image?.trim() || null,
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

export async function createClub(data: {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  order?: number;
}) {
  await requireAdmin(["SUPER_ADMIN", "COMMUNITY_ADMIN", "CONTENT_ADMIN"]);
  const name = data.name.trim();
  if (!name) throw new Error("동호회 이름을 입력해 주세요.");
  const slug = (data.slug?.trim() || slugifyTaxonomy(name) || `club-${Date.now()}`).slice(0, 60);
  const description = data.description?.trim() || null;
  const icon = data.icon?.trim() || null;
  const order = Number.isFinite(data.order) ? Number(data.order) : 0;

  const existing = await prisma.club.findFirst({
    where: { OR: [{ name }, { slug }] },
  });
  if (existing) throw new Error("이미 같은 이름 또는 슬러그의 동호회가 있습니다.");

  const club = await prisma.club.create({
    data: { name, slug, description, icon },
  });
  revalidatePath("/clubs");
  revalidatePath("/admin/clubs");
  return club;
}

export async function updateClub(
  id: string,
  data: { name: string; slug?: string; description?: string; icon?: string; order?: number },
) {
  await requireAdmin(["SUPER_ADMIN", "COMMUNITY_ADMIN", "CONTENT_ADMIN"]);
  const existing = await prisma.club.findUnique({ where: { id } });
  if (!existing) throw new Error("Not found");

  const name = data.name.trim();
  if (!name) throw new Error("동호회 이름을 입력해 주세요.");
  const slug = (data.slug?.trim() || slugifyTaxonomy(name) || existing.slug).slice(0, 60);
  const description = data.description?.trim() || null;
  const icon = data.icon?.trim() || null;

  const conflict = await prisma.club.findFirst({
    where: { id: { not: id }, OR: [{ name }, { slug }] },
  });
  if (conflict) throw new Error("이미 같은 이름 또는 슬러그의 동호회가 있습니다.");

  const club = await prisma.club.update({
    where: { id },
    data: { name, slug, description, icon },
  });
  revalidatePath("/clubs");
  revalidatePath("/admin/clubs");
  return club;
}

export async function deleteClub(id: string) {
  await requireAdmin(["SUPER_ADMIN", "COMMUNITY_ADMIN", "CONTENT_ADMIN"]);
  const existing = await prisma.club.findUnique({ where: { id } });
  if (!existing) throw new Error("Not found");

  const memberCount = await prisma.clubMember.count({ where: { clubId: id } });
  if (memberCount > 0) {
    throw new Error(`이 동호회에 회원 ${memberCount}명이 있어 삭제할 수 없습니다.`);
  }

  await prisma.club.delete({ where: { id } });
  revalidatePath("/clubs");
  revalidatePath("/admin/clubs");
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
  if (!coverImage) {
    throw new Error("표지 이미지 URL 또는 파일을 입력해 주세요.");
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

  const title = String(formData.get("title") ?? "").trim();
  const titleEn = String(formData.get("titleEn") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const category = String(formData.get("category") ?? "ickoa").trim();
  const coverUrl = String(formData.get("coverUrl") ?? "").trim();
  const coverFile = formData.get("cover") as File | null;

  if (!title || !slug) throw new Error("제목과 슬러그를 입력해 주세요.");

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

  revalidateGallery(album.id);
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

  revalidateGallery(albumId);
  return photo;
}

export async function deleteGalleryAlbum(id: string) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  await prisma.galleryAlbum.delete({ where: { id } });
  revalidateGallery(id);
}

export async function deleteGalleryPhoto(id: string) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  const photo = await prisma.galleryPhoto.delete({ where: { id } });
  revalidateGallery(photo.albumId);
}

export async function toggleGalleryAlbumPublished(id: string, published: boolean) {
  await requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]);
  await prisma.galleryAlbum.update({ where: { id }, data: { published } });
  revalidateGallery(id);
}

function revalidateGallery(albumId?: string) {
  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  if (albumId) revalidatePath(`/admin/gallery/${albumId}`);
}
