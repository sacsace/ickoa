import { prisma } from "@/lib/prisma";

export async function getNews(limit?: number) {
  return prisma.news.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    ...(limit ? { take: limit } : {}),
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

export async function getDashboardItems() {
  return prisma.dashboardItem.findMany({ orderBy: { type: "asc" } });
}

export async function getBoards() {
  return prisma.board.findMany({
    include: { _count: { select: { posts: true } } },
  });
}

export async function getEvents() {
  return prisma.event.findMany({
    include: { _count: { select: { registrations: true } } },
    orderBy: { date: "asc" },
  });
}

export async function getClubs() {
  return prisma.club.findMany({
    include: { _count: { select: { members: true } } },
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
