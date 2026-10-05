import { prisma } from "@/lib/prisma";
import { AdminGalleryForm } from "@/components/admin/admin-gallery-form";

export const dynamic = "force-dynamic";

export default async function AdminGalleryNewPage() {
  const categories = await prisma.galleryCategory.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true },
  });
  return <AdminGalleryForm categories={categories} />;
}
