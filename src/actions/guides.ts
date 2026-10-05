"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GUIDE_REGION } from "@/data/guide";

function revalidateGuides(category?: string, guideId?: string) {
  revalidatePath("/guide");
  revalidatePath("/");
  revalidatePath("/admin/guides");
  if (category) {
    revalidatePath(`/guide/c/${encodeURIComponent(category)}`);
  }
  if (guideId) {
    revalidatePath(`/guide/${guideId}`);
    revalidatePath(`/admin/guides/${guideId}`);
  }
}

async function requireSiteUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

export async function createSiteGuide(data: {
  title: string;
  content: string;
  category: string;
  region?: string;
}) {
  const session = await requireSiteUser();
  const title = data.title.trim();
  const content = data.content.trim();
  const category = data.category.trim();
  const region = (data.region?.trim() || GUIDE_REGION).trim();

  if (!title || !content || !category) {
    throw new Error("제목, 내용, 카테고리를 입력해 주세요.");
  }

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

  revalidateGuides(category, guide.id);
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
  const content = data.content.trim();
  const category = data.category.trim();
  const region = (data.region?.trim() || existing.region).trim();

  if (!title || !content || !category) {
    throw new Error("제목, 내용, 카테고리를 입력해 주세요.");
  }

  await prisma.guide.update({
    where: { id },
    data: { title, content, category, region },
  });

  revalidateGuides(existing.category, id);
  revalidateGuides(category, id);
  return { id, category };
}

export async function deleteSiteGuide(id: string) {
  const session = await requireSiteUser();
  const existing = await prisma.guide.findUnique({ where: { id } });
  if (!existing) throw new Error("Not found");
  if (existing.createdById !== session.user.id) throw new Error("Forbidden");

  await prisma.guide.delete({ where: { id } });
  revalidateGuides(existing.category, id);
  return { category: existing.category };
}
