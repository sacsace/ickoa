"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

async function requireContentAdmin() {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  if (!session?.user || !role || !["SUPER_ADMIN", "CONTENT_ADMIN"].includes(role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

function revalidateAbout(...paths: string[]) {
  revalidatePath("/about");
  revalidatePath("/admin/about");
  for (const p of paths) {
    revalidatePath(p);
  }
}

/* ── 정관 ── */

export async function createBylaw(data: {
  title: string;
  content: string;
  order?: number;
  published?: boolean;
}) {
  await requireContentAdmin();
  const title = data.title.trim();
  const content = data.content.trim();
  if (!title || !content) throw new Error("제목과 내용을 입력해 주세요.");

  const doc = await prisma.aboutDocument.create({
    data: {
      kind: "bylaws",
      title,
      content,
      order: data.order ?? 0,
      published: data.published ?? true,
    },
  });
  revalidateAbout("/about/bylaws", "/admin/about/bylaws");
  return doc;
}

export async function updateBylaw(
  id: string,
  data: { title: string; content: string; order?: number; published?: boolean },
) {
  await requireContentAdmin();
  const title = data.title.trim();
  const content = data.content.trim();
  if (!title || !content) throw new Error("제목과 내용을 입력해 주세요.");

  const doc = await prisma.aboutDocument.update({
    where: { id },
    data: {
      title,
      content,
      order: data.order ?? 0,
      published: data.published ?? true,
    },
  });
  revalidateAbout("/about/bylaws", "/admin/about/bylaws", `/admin/about/bylaws/${id}`);
  return doc;
}

export async function deleteBylaw(id: string) {
  await requireContentAdmin();
  await prisma.aboutDocument.delete({ where: { id } });
  revalidateAbout("/about/bylaws", "/admin/about/bylaws");
  return { ok: true as const };
}

/* ── 연혁 ── */

const HISTORY_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_HISTORY_IMAGE_BYTES = 10 * 1024 * 1024;

async function resolveHistoryImage(
  imageFile: File | null | undefined,
  imageUrlInput: string | null | undefined,
  previousImage?: string | null,
) {
  const urlInput = imageUrlInput?.trim() || "";
  if (imageFile && imageFile.size > 0) {
    if (imageFile.size > MAX_HISTORY_IMAGE_BYTES) {
      throw new Error("사진 크기는 10MB 이하여야 합니다.");
    }
    const mime = imageFile.type || "";
    if (!HISTORY_IMAGE_TYPES.has(mime)) {
      throw new Error("JPEG, PNG, WebP, GIF 이미지만 업로드할 수 있습니다.");
    }
    const { uploadToHistoryFolder } = await import("@/lib/s3");
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    return uploadToHistoryFolder(buffer, imageFile.name, mime);
  }
  if (urlInput) return urlInput;
  return previousImage ?? null;
}

export async function createHistoryEntry(formData: FormData) {
  await requireContentAdmin();
  const year = String(formData.get("year") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "");
  const imageUrl = String(formData.get("imageUrl") ?? "");
  const imageFile = formData.get("image") as File | null;
  if (!year || !title) throw new Error("연도와 제목을 입력해 주세요.");

  const maxOrder = await prisma.historyEntry.aggregate({ _max: { order: true } });
  const order = (maxOrder._max.order ?? 0) + 1;
  const image = await resolveHistoryImage(imageFile, imageUrl, null);

  const entry = await prisma.historyEntry.create({
    data: {
      year,
      title,
      description: description.trim() || null,
      image,
      order,
    },
  });
  revalidateAbout("/about/history", "/admin/about/history");
  return entry;
}

export async function updateHistoryEntry(id: string, formData: FormData) {
  await requireContentAdmin();
  const year = String(formData.get("year") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "");
  const imageUrl = String(formData.get("imageUrl") ?? "");
  const clearImage = String(formData.get("clearImage") ?? "") === "1";
  const imageFile = formData.get("image") as File | null;
  if (!year || !title) throw new Error("연도와 제목을 입력해 주세요.");

  const existing = await prisma.historyEntry.findUnique({ where: { id } });
  if (!existing) throw new Error("연혁을 찾을 수 없습니다.");

  let image: string | null = existing.image;
  if (clearImage && !(imageFile && imageFile.size > 0) && !imageUrl.trim()) {
    image = null;
  } else {
    image = await resolveHistoryImage(imageFile, imageUrl, existing.image);
  }

  const entry = await prisma.historyEntry.update({
    where: { id },
    data: {
      year,
      title,
      description: description.trim() || null,
      image,
    },
  });
  revalidateAbout("/about/history", "/admin/about/history", `/admin/about/history/${id}`);
  return entry;
}

export async function deleteHistoryEntry(id: string) {
  await requireContentAdmin();
  await prisma.historyEntry.delete({ where: { id } });
  const remaining = await prisma.historyEntry.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  await prisma.$transaction(
    remaining.map((entry, index) =>
      prisma.historyEntry.update({
        where: { id: entry.id },
        data: { order: index + 1 },
      }),
    ),
  );
  revalidateAbout("/about/history", "/admin/about/history");
  return { ok: true as const };
}

export async function moveHistoryEntry(id: string, direction: "up" | "down") {
  await requireContentAdmin();

  const entries = await prisma.historyEntry.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  const index = entries.findIndex((entry) => entry.id === id);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= entries.length) return;

  const current = entries[index]!;
  const target = entries[swapIndex]!;

  await prisma.$transaction([
    prisma.historyEntry.update({
      where: { id: current.id },
      data: { order: target.order },
    }),
    prisma.historyEntry.update({
      where: { id: target.id },
      data: { order: current.order },
    }),
  ]);

  revalidateAbout("/about/history", "/admin/about/history");
}

/** 순서 번호를 직접 지정하면 해당 위치로 이동 후 전체 순서를 1..N으로 재정렬합니다. */
export async function setHistoryEntryOrder(id: string, orderInput: number) {
  await requireContentAdmin();

  const entries = await prisma.historyEntry.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  const fromIndex = entries.findIndex((entry) => entry.id === id);
  if (fromIndex === -1) return;

  const max = entries.length;
  const toIndex = Math.min(Math.max(Math.round(orderInput), 1), max) - 1;
  if (toIndex === fromIndex) return;

  const next = [...entries];
  const [moved] = next.splice(fromIndex, 1);
  if (!moved) return;
  next.splice(toIndex, 0, moved);

  await prisma.$transaction(
    next.map((entry, index) =>
      prisma.historyEntry.update({
        where: { id: entry.id },
        data: { order: index + 1 },
      }),
    ),
  );

  revalidateAbout("/about/history", "/admin/about/history");
}

/* ── 활동 보고서 ── */

export async function createActivityReport(data: {
  title: string;
  content: string;
  year?: number | null;
  fileUrl?: string;
  published?: boolean;
  order?: number;
}) {
  await requireContentAdmin();
  const title = data.title.trim();
  const content = data.content.trim();
  if (!title || !content) throw new Error("제목과 내용을 입력해 주세요.");

  const report = await prisma.activityReport.create({
    data: {
      title,
      content,
      year: data.year ?? null,
      fileUrl: data.fileUrl?.trim() || null,
      published: data.published ?? true,
      order: data.order ?? 0,
    },
  });
  revalidateAbout("/about/reports", "/admin/about/reports");
  return report;
}

export async function updateActivityReport(
  id: string,
  data: {
    title: string;
    content: string;
    year?: number | null;
    fileUrl?: string;
    published?: boolean;
    order?: number;
  },
) {
  await requireContentAdmin();
  const title = data.title.trim();
  const content = data.content.trim();
  if (!title || !content) throw new Error("제목과 내용을 입력해 주세요.");

  const report = await prisma.activityReport.update({
    where: { id },
    data: {
      title,
      content,
      year: data.year ?? null,
      fileUrl: data.fileUrl?.trim() || null,
      published: data.published ?? true,
      order: data.order ?? 0,
    },
  });
  revalidateAbout(
    "/about/reports",
    `/about/reports/${id}`,
    "/admin/about/reports",
    `/admin/about/reports/${id}`,
  );
  return report;
}

export async function deleteActivityReport(id: string) {
  await requireContentAdmin();
  await prisma.activityReport.delete({ where: { id } });
  revalidateAbout("/about/reports", "/admin/about/reports");
  return { ok: true as const };
}

/* ── 회장단 ── */

export async function createLeadershipMember(data: {
  name: string;
  nameEn?: string;
  role: string;
  bio?: string;
  image?: string;
  level?: number;
  published?: boolean;
}) {
  await requireContentAdmin();
  const name = data.name.trim();
  const role = data.role.trim();
  if (!name || !role) throw new Error("이름과 직책을 입력해 주세요.");

  const level = Math.min(4, Math.max(1, Number(data.level) || 1));
  const maxOrder = await prisma.leadershipMember.aggregate({
    where: { level },
    _max: { order: true },
  });
  const order = (maxOrder._max.order ?? 0) + 1;

  const member = await prisma.leadershipMember.create({
    data: {
      name,
      nameEn: data.nameEn?.trim() || null,
      role,
      bio: data.bio?.trim() || null,
      image: data.image?.trim() || null,
      level,
      order,
      published: data.published ?? true,
    },
  });
  revalidateAbout("/about/leadership", "/admin/about/leadership");
  return member;
}

export async function updateLeadershipMember(
  id: string,
  data: {
    name: string;
    nameEn?: string;
    role: string;
    bio?: string;
    image?: string;
    level?: number;
    published?: boolean;
  },
) {
  await requireContentAdmin();
  const existing = await prisma.leadershipMember.findUnique({ where: { id } });
  if (!existing) throw new Error("Not found");

  const name = data.name.trim();
  const role = data.role.trim();
  if (!name || !role) throw new Error("이름과 직책을 입력해 주세요.");

  const level = Math.min(4, Math.max(1, Number(data.level) || existing.level || 1));
  let order = existing.order;
  if (level !== existing.level) {
    const maxOrder = await prisma.leadershipMember.aggregate({
      where: { level },
      _max: { order: true },
    });
    order = (maxOrder._max.order ?? 0) + 1;
  }

  const member = await prisma.leadershipMember.update({
    where: { id },
    data: {
      name,
      nameEn: data.nameEn?.trim() || null,
      role,
      bio: data.bio?.trim() || null,
      image: data.image?.trim() || null,
      level,
      order,
      published: data.published ?? true,
    },
  });
  revalidateAbout(
    "/about/leadership",
    "/admin/about/leadership",
    `/admin/about/leadership/${id}`,
  );
  return member;
}

export async function deleteLeadershipMember(id: string) {
  await requireContentAdmin();
  await prisma.leadershipMember.delete({ where: { id } });
  revalidateAbout("/about/leadership", "/admin/about/leadership");
  return { ok: true as const };
}
