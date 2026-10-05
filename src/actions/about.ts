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

export async function createHistoryEntry(data: {
  year: string;
  title: string;
  description?: string;
}) {
  await requireContentAdmin();
  const year = data.year.trim();
  const title = data.title.trim();
  if (!year || !title) throw new Error("연도와 제목을 입력해 주세요.");

  const maxOrder = await prisma.historyEntry.aggregate({ _max: { order: true } });
  const order = (maxOrder._max.order ?? 0) + 1;

  const entry = await prisma.historyEntry.create({
    data: {
      year,
      title,
      description: data.description?.trim() || null,
      order,
    },
  });
  revalidateAbout("/about/history", "/admin/about/history");
  return entry;
}

export async function updateHistoryEntry(
  id: string,
  data: { year: string; title: string; description?: string },
) {
  await requireContentAdmin();
  const year = data.year.trim();
  const title = data.title.trim();
  if (!year || !title) throw new Error("연도와 제목을 입력해 주세요.");

  const entry = await prisma.historyEntry.update({
    where: { id },
    data: {
      year,
      title,
      description: data.description?.trim() || null,
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
