"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GUIDE_REGION, guideListPath } from "@/data/guide";
import { plainTextFromHtml, sanitizePostHtml } from "@/lib/sanitize-html";

async function resolveCategorySlug(categoryName: string) {
  const cat = await prisma.guideCategory.findFirst({
    where: { name: categoryName },
    select: { slug: true },
  });
  return cat?.slug ?? null;
}

async function revalidateGuides(category?: string, guideId?: string) {
  revalidatePath("/guide");
  revalidatePath("/");
  revalidatePath("/admin/guides");
  revalidatePath("/guide/guesthouse");
  revalidatePath("/guide/restaurants");

  if (category) {
    const slug = await resolveCategorySlug(category);
    revalidatePath(guideListPath(category, slug));
    if (slug) revalidatePath(`/guide/c/${slug}/new`);
  }
  if (guideId) {
    revalidatePath(`/guide/${guideId}`);
    revalidatePath(`/guide/${guideId}/edit`);
    revalidatePath(`/admin/guides/${guideId}`);
  }
}

async function requireSiteUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

async function requireGuideCategory(categoryName: string) {
  const category = await prisma.guideCategory.findFirst({
    where: { name: categoryName },
  });
  if (!category) throw new Error("존재하지 않는 카테고리입니다.");
  return category;
}

export async function createSiteGuide(data: {
  title: string;
  content: string;
  category: string;
  region?: string;
}) {
  const session = await requireSiteUser();
  const title = data.title.trim();
  const content = sanitizePostHtml(data.content.trim());
  const category = data.category.trim();
  const region = (data.region?.trim() || GUIDE_REGION).trim();

  if (!title || !plainTextFromHtml(content) || !category) {
    throw new Error("제목, 내용, 카테고리를 입력해 주세요.");
  }

  await requireGuideCategory(category);

  const maxOrder = await prisma.guide.aggregate({
    where: { category },
    _max: { order: true },
  });

  const guide = await prisma.guide.create({
    data: {
      title,
      content,
      category,
      region,
      order: (maxOrder._max.order ?? 0) + 1,
      createdById: session.user.id,
    },
  });

  await revalidateGuides(category, guide.id);
  return { id: guide.id, category };
}

export async function updateSiteGuide(
  id: string,
  data: { title: string; content: string; category: string; region?: string },
) {
  const session = await requireSiteUser();
  const existing = await prisma.guide.findUnique({ where: { id } });
  if (!existing) throw new Error("Not found");
  if (existing.createdById !== session.user.id) throw new Error("Forbidden");

  const title = data.title.trim();
  const content = sanitizePostHtml(data.content.trim());
  const category = data.category.trim();
  const region = (data.region?.trim() || existing.region).trim();

  if (!title || !plainTextFromHtml(content) || !category) {
    throw new Error("제목, 내용, 카테고리를 입력해 주세요.");
  }

  await requireGuideCategory(category);

  await prisma.guide.update({
    where: { id },
    data: { title, content, category, region },
  });

  await revalidateGuides(existing.category, id);
  await revalidateGuides(category, id);
  return { id, category };
}

export async function deleteSiteGuide(id: string) {
  const session = await requireSiteUser();
  const existing = await prisma.guide.findUnique({ where: { id } });
  if (!existing) throw new Error("Not found");
  if (existing.createdById !== session.user.id) throw new Error("Forbidden");

  await prisma.guide.delete({ where: { id } });
  await revalidateGuides(existing.category, id);
  return { category: existing.category };
}
