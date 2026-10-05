"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { plainTextFromHtml, sanitizePostHtml } from "@/lib/sanitize-html";

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

export async function joinClub(clubId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.clubMember.upsert({
    where: {
      clubId_userId: { clubId, userId: session.user.id },
    },
    update: {},
    create: { clubId, userId: session.user.id },
  });

  revalidatePath(`/clubs`);
  return { success: true };
}

export async function requestClub(data: {
  name: string;
  description?: string;
  reason?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("로그인이 필요합니다.");

  const name = data.name.trim();
  if (!name) throw new Error("동호회 이름을 입력해 주세요.");

  const existingClub = await prisma.club.findFirst({ where: { name } });
  if (existingClub) throw new Error("이미 같은 이름의 동호회가 있습니다.");

  const pending = await prisma.clubRequest.findFirst({
    where: { name, status: "PENDING" },
  });
  if (pending) throw new Error("같은 이름의 등록 요청이 이미 대기 중입니다.");

  await prisma.clubRequest.create({
    data: {
      name,
      description: data.description?.trim() || null,
      reason: data.reason?.trim() || null,
      userId: session.user.id,
    },
  });

  revalidatePath("/clubs");
  revalidatePath("/admin/club-requests");
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
  if (!session?.user) throw new Error("Unauthorized");

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
  if (existing.authorId !== session.user.id) throw new Error("Forbidden");

  await prisma.post.update({
    where: { id: postId },
    data: { title: trimmedTitle, content: cleaned },
  });

  revalidateCommunity(existing.board.slug, postId);
  return { id: postId, boardSlug: existing.board.slug };
}

export async function deleteOwnPost(postId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const existing = await prisma.post.findUnique({
    where: { id: postId },
    include: { board: { select: { slug: true } } },
  });
  if (!existing) throw new Error("Not found");
  if (existing.authorId !== session.user.id) throw new Error("Forbidden");

  await prisma.post.delete({ where: { id: postId } });
  revalidateCommunity(existing.board.slug, postId);
  return { boardSlug: existing.board.slug };
}
