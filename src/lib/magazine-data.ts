import { prisma } from "@/lib/prisma";
import {
  dynamicKoreanVol16,
  magazineIssues as staticIssues,
  type MagazineIssue,
} from "@/data/dynamic-korean";

type DbIssue = Awaited<ReturnType<typeof prisma.magazineIssue.findMany>>[number];

function mergeWithStaticContent(db: DbIssue): MagazineIssue {
  const staticIssue = staticIssues.find((s) => s.id === db.slug);
  return {
    id: db.slug,
    volume: db.volume,
    title: db.title,
    subtitle: db.subtitle,
    publishedAt: db.publishedAt,
    coverImage: db.coverImage,
    pdfUrl: db.pdfUrl,
    editorNote: db.editorNote ?? staticIssue?.editorNote,
    editorNoteEn: staticIssue?.editorNoteEn,
    sections: staticIssue?.sections ?? [],
  };
}

export async function getPublishedMagazineIssues(): Promise<MagazineIssue[]> {
  const dbIssues = await prisma.magazineIssue.findMany({
    where: { published: true },
    orderBy: { volume: "desc" },
  });

  if (dbIssues.length > 0) {
    return dbIssues.map(mergeWithStaticContent);
  }

  return staticIssues;
}

export async function getMagazineIssue(slug: string): Promise<MagazineIssue | null> {
  const db = await prisma.magazineIssue.findUnique({
    where: { slug },
  });

  if (db) {
    if (!db.published) return null;
    return mergeWithStaticContent(db);
  }

  const staticIssue = staticIssues.find((i) => i.id === slug);
  return staticIssue ?? null;
}

export async function getLatestMagazineIssue(): Promise<MagazineIssue | null> {
  const issues = await getPublishedMagazineIssues();
  return issues[0] ?? null;
}

export async function getAllMagazineIssuesAdmin() {
  return prisma.magazineIssue.findMany({
    orderBy: { volume: "desc" },
  });
}

export async function getFeaturedMagazineIssue(): Promise<MagazineIssue> {
  const latest = await getLatestMagazineIssue();
  return latest ?? dynamicKoreanVol16;
}
