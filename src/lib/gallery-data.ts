import { prisma } from "@/lib/prisma";
import {
  galleryAlbums as staticAlbums,
  type GalleryAlbum,
  type GalleryPhoto,
} from "@/data/gallery";

function mapAlbum(album: {
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
  return {
    id: album.slug,
    title: album.title,
    titleEn: album.titleEn,
    description: album.description,
    descriptionEn: album.descriptionEn,
    cover: album.cover,
    category: album.category as GalleryAlbum["category"],
    photos: album.photos
      .sort((a, b) => a.order - b.order)
      .map(
        (p): GalleryPhoto => ({
          id: p.id,
          src: p.src,
          caption: p.caption,
          date: p.date ?? undefined,
        }),
      ),
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

export async function getGalleryAlbumBySlug(slug: string): Promise<GalleryAlbum | null> {
  try {
    const album = await prisma.galleryAlbum.findUnique({
      where: { slug },
      include: { photos: true },
    });
    if (album) return mapAlbum(album);
  } catch {
    /* fallback */
  }
  return staticAlbums.find((a) => a.id === slug) ?? null;
}

export async function getAllGalleryAlbumsAdmin() {
  return prisma.galleryAlbum.findMany({
    include: { photos: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  });
}
