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
import { absoluteUrl } from "@/lib/seo";
import { getOrCreateMailSetting, sendSiteMail } from "@/lib/mail";

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function notifyPostAuthorOfComment(options: {
  postId: string;
  commenterId: string;
  commenterName: string;
  commentContent: string;
}) {
  const post = await prisma.post.findUnique({
    where: { id: options.postId },
    select: {
      id: true,
      title: true,
      authorId: true,
      author: { select: { id: true, name: true, email: true } },
      board: { select: { slug: true, name: true } },
    },
  });
  if (!post) return;
  // 본인 글에 본인이 댓글 단 경우 알림 생략
  if (post.authorId === options.commenterId) return;

  const link = `/community/${post.board.slug}/${post.id}`;
  const preview =
    options.commentContent.trim().slice(0, 200) +
    (options.commentContent.trim().length > 200 ? "…" : "");
  const title = "새 댓글 알림";
  const body = `${options.commenterName}님이 「${post.title}」에 댓글을 남겼습니다.`;

  await prisma.notification.create({
    data: {
      userId: post.authorId,
      title,
      body,
      link,
    },
  });

  const authorEmail = post.author.email?.trim();
  if (!authorEmail) return;

  const setting = await getOrCreateMailSetting();
  if (!setting.enabled) return;

  const postUrl = absoluteUrl(link);
  try {
    await sendSiteMail({
      to: authorEmail,
      subject: `[KAIC] ${body}`,
      text: [
        body,
        "",
        `게시판: ${post.board.name}`,
        `게시글: ${post.title}`,
        `댓글 작성자: ${options.commenterName}`,
        "",
        preview,
        "",
        `바로가기: ${postUrl}`,
      ].join("\n"),
      html: [
        `<p>${escapeHtml(body)}</p>`,
        `<p><strong>게시판</strong>: ${escapeHtml(post.board.name)}</p>`,
        `<p><strong>게시글</strong>: ${escapeHtml(post.title)}</p>`,
        `<p><strong>댓글 작성자</strong>: ${escapeHtml(options.commenterName)}</p>`,
        `<blockquote style="margin:16px 0;padding:12px 16px;border-left:3px solid #1b2f44;background:#f5f7fa;">${escapeHtml(preview)}</blockquote>`,
        `<p><a href="${postUrl}">게시글 보기</a></p>`,
      ].join(""),
    });
  } catch {
    // 댓글 등록은 유지하고 메일 실패는 무시
  }
}

export async function createComment(postId: string, content: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const text = content.trim();
  if (!text) throw new Error("댓글 내용을 입력해 주세요.");

  const comment = await prisma.comment.create({
    data: {
      postId,
      authorId: session.user.id,
      content: text,
    },
    include: { author: { select: { id: true, name: true, image: true } } },
  });

  try {
    await notifyPostAuthorOfComment({
      postId,
      commenterId: session.user.id,
      commenterName: comment.author.name?.trim() || "회원",
      commentContent: text,
    });
  } catch {
    // 댓글은 유지하고 알림/메일 실패는 무시
  }

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
