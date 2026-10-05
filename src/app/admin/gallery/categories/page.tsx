import { prisma } from "@/lib/prisma";
import { AdminGalleryCategoriesList } from "@/components/admin/admin-gallery-categories";

export const dynamic = "force-dynamic";

export default async function AdminGalleryCategoriesPage() {
  const categories = await prisma.galleryCategory.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
  const counts = await prisma.galleryAlbum.groupBy({
    by: ["category"],
    _count: { _all: true },
  });
  const countMap = new Map(counts.map((c) => [c.category, c._count._all]));

  return (
    <AdminGalleryCategoriesList
      items={categories.map((c) => ({
        id: c.id,
        name: c.name,
        nameEn: c.nameEn,
        slug: c.slug,
        order: c.order,
        count: countMap.get(c.slug) ?? 0,
      }))}
    />
  );
}
