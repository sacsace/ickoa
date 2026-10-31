import { prisma } from "@/lib/prisma";

export async function getNews(limit?: number) {
  return prisma.news.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    ...(limit
      ? {
          take: limit,
          select: {
            id: true,
            title: true,
            category: true,
            region: true,
            image: true,
            createdAt: true,
          },
        }
      : {}),
  });
}

export async function getBusinesses(filters?: {
  category?: string;
  region?: string;
  q?: string;
}) {
  return prisma.business.findMany({
    where: {
      ...(filters?.category ? { category: filters.category } : {}),
      ...(filters?.region ? { region: filters.region } : {}),
      ...(filters?.q
        ? {
            OR: [
              { name: { contains: filters.q } },
              { address: { contains: filters.q } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
  });
}

export async function getBusinessCategories() {
  return prisma.businessCategory.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: { id: true, name: true, nameEn: true, slug: true, order: true },
  });
}

export async function getBusinessCategoryNames() {
  const categories = await getBusinessCategories();
  return categories.map((c) => c.name);
}

export async function getDashboardItems() {
  return prisma.dashboardItem.findMany({ orderBy: { type: "asc" } });
}

export async function getBoards(limit?: number) {
  return prisma.board.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { order: "asc" },
    ...(limit ? { take: limit } : {}),
  });
}

export async function getEvents(limit?: number) {
  return prisma.event.findMany({
    include: { _count: { select: { registrations: true } } },
    orderBy: { date: "asc" },
    ...(limit ? { take: limit } : {}),
  });
}

export async function getClubs(limit?: number) {
  return prisma.club.findMany({
    include: { _count: { select: { members: true } } },
    orderBy: { order: "asc" },
    ...(limit ? { take: limit } : {}),
  });
}

export async function getGuides(category?: string) {
  return prisma.guide.findMany({
    where: {
      region: "Chennai",
      ...(category ? { category } : {}),
    },
    orderBy: [{ order: "asc" }, { title: "asc" }],
  });
}

export async function getGuideCategories() {
  const [categories, counts] = await Promise.all([
    prisma.guideCategory.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
    prisma.guide.groupBy({
      by: ["category"],
      _count: { _all: true },
    }),
  ]);

  const countMap = new Map(counts.map((c) => [c.category, c._count._all]));

  return categories.map((cat) => ({
    ...cat,
    itemCount: countMap.get(cat.name) ?? 0,
  }));
}

export async function getGuideCategoryBySlug(slug: string) {
  return prisma.guideCategory.findUnique({ where: { slug } });
}

export async function getPostsByBoard(slug: string) {
  const board = await prisma.board.findUnique({
    where: { slug },
    include: {
      posts: {
        include: {
          author: { select: { id: true, name: true, image: true } },
          _count: { select: { comments: true, likes: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return board;
}

export async function getPost(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, image: true } },
      board: true,
      comments: {
        include: { author: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
      attachments: true,
      _count: { select: { likes: true } },
    },
  });
}
