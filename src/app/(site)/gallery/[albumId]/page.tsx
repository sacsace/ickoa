import { notFound } from "next/navigation";
import { getGalleryAlbumBySlug } from "@/lib/gallery-data";
import { AlbumDetailClient } from "@/components/gallery/album-detail";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ albumId: string }>;
}) {
  const { albumId } = await params;
  const album = await getGalleryAlbumBySlug(albumId);
  if (!album) {
    return createMetadata({ title: "갤러리", path: "/gallery" });
  }
  return createMetadata({
    title: album.title,
    description: album.description || `${album.title} — ICKOA 포토 갤러리`,
    path: `/gallery/${albumId}`,
    image: album.cover,
  });
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ albumId: string }>;
}) {
  const { albumId } = await params;
  const album = await getGalleryAlbumBySlug(albumId);
  if (!album) notFound();

  return <AlbumDetailClient album={album} />;
}
