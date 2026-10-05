import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";
import { mainNavigation } from "@/data/navigation";

export const dynamic = "force-dynamic";

const ABOUT_SLUGS = ["history", "leadership", "bylaws", "reports", "finance", "sponsors", "ci"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPaths = new Set<string>([
    "/",
    "/about",
    "/magazine",
    "/gallery",
    "/community",
    "/events",
    "/clubs",
    "/guide",
    "/guide/guesthouse",
    "/guide/restaurants",
    "/news",
    "/business",
    "/business/map",
    "/network",
    "/donate",
    ...ABOUT_SLUGS.map((slug) => `/about/${slug}`),
    ...mainNavigation.flatMap((item) => [
      item.href,
      ...item.children.map((child) => child.href.split("?")[0]),
    ]),
  ]);

  const [news, events, guides, magazines, albums, boards, clubs, businesses] =
    await Promise.all([
      prisma.news.findMany({ select: { id: true, updatedAt: true } }),
      prisma.event.findMany({ select: { id: true, updatedAt: true } }),
      prisma.guide.findMany({ select: { id: true, updatedAt: true } }),
      prisma.magazineIssue.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.galleryAlbum.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.board.findMany({ select: { slug: true } }),
      prisma.club.findMany({ select: { slug: true, createdAt: true } }),
      prisma.business.findMany({ select: { id: true, updatedAt: true } }),
    ]);

  const posts = await prisma.post.findMany({
    select: { id: true, board: { select: { slug: true } }, updatedAt: true },
    take: 500,
    orderBy: { updatedAt: "desc" },
  });

  const entries: MetadataRoute.Sitemap = Array.from(staticPaths).map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));

  for (const item of news) {
    entries.push({
      url: absoluteUrl(`/news/${item.id}`),
      lastModified: item.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  for (const item of events) {
    entries.push({
      url: absoluteUrl(`/events/${item.id}`),
      lastModified: item.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  for (const item of guides) {
    entries.push({
      url: absoluteUrl(`/guide/${item.id}`),
      lastModified: item.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const issue of magazines) {
    entries.push({
      url: absoluteUrl(`/magazine/${issue.slug}`),
      lastModified: issue.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  for (const club of clubs) {
    entries.push({
      url: absoluteUrl(`/clubs/${club.slug}`),
      lastModified: club.createdAt,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const business of businesses) {
    entries.push({
      url: absoluteUrl(`/business/${business.id}`),
      lastModified: business.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const album of albums) {
    entries.push({
      url: absoluteUrl(`/gallery/${album.slug}`),
      lastModified: album.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const board of boards) {
    entries.push({
      url: absoluteUrl(`/community/${board.slug}`),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6,
    });
  }

  for (const post of posts) {
    entries.push({
      url: absoluteUrl(`/community/${post.board.slug}/${post.id}`),
      lastModified: post.updatedAt,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  return entries;
}
