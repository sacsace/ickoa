"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  revalidateClubPaths,
  requireClubLeader,
  requireSiteUser,
  slugifyClub,
} from "@/lib/clubs";
import { prisma } from "@/lib/prisma";
import { plainTextFromHtml, sanitizePostHtml } from "@/lib/sanitize-html";
import { getSiteUser } from "@/lib/session-kind";
import { canManageSiteResource } from "@/lib/site-permissions";

export async function createComment(postId: string, content: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const comment = await prisma.comment.create({
    data: {
      postId,
      authorId: session.user.id,
      content,
    },
    include: { author: { select: { id: true, name: true, image: true } } },
  });

  revalidatePath(`/community`);
  return comment;
}

export async function toggleLike(postId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const existing = await prisma.like.findUnique({
    where: {
      postId_userId: { postId, userId: session.user.id },
    },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    revalidatePath(`/community`);
    return { liked: false };
  }

  await prisma.like.create({
    data: { postId, userId: session.user.id },
  });
  revalidatePath(`/community`);
  return { liked: true };
}

export async function createReport(postId: string, reason: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.report.create({
    data: {
      postId,
      reporterId: session.user.id,
      reason,
    },
  });

  revalidatePath(`/admin/reports`);
  return { success: true };
}

export async function createClubIntro(data: {
  name: string;
  description?: string;
}) {
  const session = await requireSiteUser();

  const name = data.name.trim();
  if (!name) throw new Error("동호회 이름을 입력해 주세요.");
  const descriptionHtml = sanitizePostHtml(data.description?.trim() || "");
  if (!plainTextFromHtml(descriptionHtml)) {
    throw new Error("동호회 소개를 입력해 주세요.");
  }
  const slug = slugifyClub(name);

  const existing = await prisma.club.findFirst({
    where: { OR: [{ name }, { slug }] },
  });
  if (existing) throw new Error("이미 같은 이름 또는 주소의 동호회가 있습니다.");

  const club = await prisma.club.create({
    data: {
      name,
      slug,
      description: descriptionHtml,
      leaderId: session.user.id,
    },
  });

  revalidateClubPaths(club.slug);
  return { id: club.id, slug: club.slug };
}

export async function updateClubIntro(
  clubId: string,
  data: { name: string; description?: string },
) {
  await requireClubLeader(clubId);

  const existing = await prisma.club.findUnique({ where: { id: clubId } });
  if (!existing) throw new Error("동호회를 찾을 수 없습니다.");

  const name = data.name.trim();
  if (!name) throw new Error("동호회 이름을 입력해 주세요.");
  const descriptionHtml = sanitizePostHtml(data.description?.trim() || "");
  if (!plainTextFromHtml(descriptionHtml)) {
    throw new Error("동호회 소개를 입력해 주세요.");
  }
  const slug =
    name === existing.name ? existing.slug : slugifyClub(name);

  const conflict = await prisma.club.findFirst({
    where: { id: { not: clubId }, OR: [{ name }, { slug }] },
  });
  if (conflict) throw new Error("이미 같은 이름 또는 주소의 동호회가 있습니다.");

  const club = await prisma.club.update({
    where: { id: clubId },
    data: { name, slug, description: descriptionHtml },
  });

  revalidateClubPaths(existing.slug);
  revalidateClubPaths(club.slug);
  return { id: club.id, slug: club.slug };
}

export async function deleteClubIntro(clubId: string) {
  await requireClubLeader(clubId);

  const existing = await prisma.club.findUnique({ where: { id: clubId } });
  if (!existing) throw new Error("동호회를 찾을 수 없습니다.");

  await prisma.club.delete({ where: { id: clubId } });
  revalidateClubPaths(existing.slug);
  return { ok: true as const };
}

function revalidateCommunity(boardSlug: string, postId?: string) {
  revalidatePath("/community");
  revalidatePath(`/community/${boardSlug}`);
  if (postId) {
    revalidatePath(`/community/${boardSlug}/${postId}`);
  }
}

export async function createPost(boardSlug: string, title: string, content: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const trimmedTitle = title.trim();
  const cleaned = sanitizePostHtml(content);
  if (!trimmedTitle || !plainTextFromHtml(cleaned)) {
    throw new Error("제목과 내용을 입력해 주세요.");
  }

  const board = await prisma.board.findUnique({ where: { slug: boardSlug } });
  if (!board) throw new Error("Board not found");

  const post = await prisma.post.create({
    data: {
      boardId: board.id,
      authorId: session.user.id,
      title: trimmedTitle,
      content: cleaned,
    },
  });

  revalidateCommunity(boardSlug, post.id);
  return { id: post.id, boardSlug };
}

export async function updatePost(postId: string, title: string, content: string) {
  const session = await auth();
  const siteUser = getSiteUser(session);
  if (!siteUser) throw new Error("Unauthorized");

  const trimmedTitle = title.trim();
  const cleaned = sanitizePostHtml(content);
  if (!trimmedTitle || !plainTextFromHtml(cleaned)) {
    throw new Error("제목과 내용을 입력해 주세요.");
  }

  const existing = await prisma.post.findUnique({
    where: { id: postId },
    include: { board: { select: { slug: true } } },
  });
  if (!existing) throw new Error("Not found");
  if (!canManageSiteResource(siteUser, existing.authorId)) {
    throw new Error("Forbidden");
  }

  await prisma.post.update({
    where: { id: postId },
    data: { title: trimmedTitle, content: cleaned },
  });

  revalidateCommunity(existing.board.slug, postId);
  return { id: postId, boardSlug: existing.board.slug };
}

export async function deleteOwnPost(postId: string) {
  const session = await auth();
  const siteUser = getSiteUser(session);
  if (!siteUser) throw new Error("Unauthorized");

  const existing = await prisma.post.findUnique({
    where: { id: postId },
    include: { board: { select: { slug: true } } },
  });
  if (!existing) throw new Error("Not found");
  if (!canManageSiteResource(siteUser, existing.authorId)) {
    throw new Error("Forbidden");
  }

  await prisma.post.delete({ where: { id: postId } });
  revalidateCommunity(existing.board.slug, postId);
  return { boardSlug: existing.board.slug };
}
