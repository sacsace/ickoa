import { prisma } from "@/lib/prisma";
import {
  galleryAlbums as staticAlbums,
  type GalleryAlbum,
  type GalleryPhoto,
} from "@/data/gallery";
import {
  galleryAlbumPathId,
  isSafeGallerySlug,
  slugifyGallery,
} from "@/lib/gallery-slug";

export { galleryAlbumPathId, isSafeGallerySlug, slugifyGallery } from "@/lib/gallery-slug";

function decodeSlugParam(raw: string) {
  let value = raw;
  try {
    value = decodeURIComponent(raw);
  } catch {
    /* keep raw */
  }
  return value.normalize("NFC");
}

function mapAlbum(album: {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  cover: string;
  category: string;
  photos: {
    id: string;
    src: string;
    caption: string;
    captionEn: string;
    date: string | null;
    order: number;
  }[];
}): GalleryAlbum {
  const photos = album.photos
    .sort((a, b) => a.order - b.order)
    .map(
      (p): GalleryPhoto => ({
        id: p.id,
        src: p.src,
        caption: p.caption,
        date: p.date ?? undefined,
      }),
    );
  return {
    id: galleryAlbumPathId(album),
    title: album.title,
    titleEn: album.titleEn,
    description: album.description,
    descriptionEn: album.descriptionEn,
    // Prefer explicit cover; fall back to first photo so empty/broken covers don't blank the tile.
    cover: album.cover?.trim() || photos[0]?.src || "/image/hero-community.jpg",
    category: album.category as GalleryAlbum["category"],
    photos,
  };
}

export async function getGalleryAlbums(): Promise<GalleryAlbum[]> {
  try {
    const albums = await prisma.galleryAlbum.findMany({
      where: { published: true },
      include: { photos: true },
      orderBy: { order: "asc" },
    });
    if (albums.length === 0) return staticAlbums;
    return albums.map(mapAlbum);
  } catch {
    return staticAlbums;
  }
}

/** 홈용 — 앨범 표지 위주, 사진 전체 로드 안 함 */
export async function getGalleryAlbumPreviews(limit = 5): Promise<GalleryAlbum[]> {
  try {
    const albums = await prisma.galleryAlbum.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      take: limit,
      include: {
        photos: {
          orderBy: { order: "asc" },
          take: 1,
        },
      },
    });
    if (albums.length === 0) return staticAlbums.slice(0, limit);
    return albums.map(mapAlbum);
  } catch {
    return staticAlbums.slice(0, limit);
  }
}

export async function getGalleryAlbumBySlug(slug: string): Promise<GalleryAlbum | null> {
  const decoded = decodeSlugParam(slug);
  const variants = Array.from(
    new Set([slug, decoded, decoded.normalize("NFD"), decoded.replace(/\s+/g, " ").trim()]),
  );

  try {
    const album = await prisma.galleryAlbum.findFirst({
      where: {
        OR: [
          ...variants.map((s) => ({ slug: s })),
          ...variants.map((s) => ({ id: s })),
        ],
      },
      include: { photos: true },
    });
    if (album) return mapAlbum(album);
  } catch {
    /* fallback */
  }
  return staticAlbums.find((a) => a.id === slug || a.id === decoded) ?? null;
}

export async function getAllGalleryAlbumsAdmin() {
  return prisma.galleryAlbum.findMany({
    include: { photos: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  });
}

/** 한글/공백 등 불안전 슬러그를 ASCII로 교체 (기존 운영 앨범 복구) */
export async function ensureSafeGallerySlug(albumId: string) {
  const album = await prisma.galleryAlbum.findUnique({ where: { id: albumId } });
  if (!album) return null;
  if (isSafeGallerySlug(album.slug)) return album;

  const base = slugifyGallery(album.titleEn || album.title || album.slug);
  let candidate = base;
  let n = 2;
  for (;;) {
    const clash = await prisma.galleryAlbum.findFirst({
      where: { slug: candidate, NOT: { id: albumId } },
      select: { id: true },
    });
    if (!clash) break;
    candidate = `${base}-${n++}`;
  }

  return prisma.galleryAlbum.update({
    where: { id: albumId },
    data: { slug: candidate },
  });
}
