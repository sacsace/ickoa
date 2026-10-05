import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminGalleryDetail } from "@/components/admin/admin-gallery-detail";

export const dynamic = "force-dynamic";

export default async function AdminGalleryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const album = await prisma.galleryAlbum.findUnique({
    where: { id },
    include: { photos: { orderBy: { order: "asc" } } },
  });
  if (!album) notFound();

  return <AdminGalleryDetail album={album} />;
}
