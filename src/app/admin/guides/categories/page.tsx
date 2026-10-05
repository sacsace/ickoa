import { prisma } from "@/lib/prisma";
import { AdminGuideCategoriesList } from "@/components/admin/admin-guide-categories-list";

export const dynamic = "force-dynamic";

export default async function AdminGuideCategoriesPage() {
  const categories = await prisma.guideCategory.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  const counts = await prisma.guide.groupBy({
    by: ["category"],
    _count: { _all: true },
  });
  const countMap = new Map(counts.map((c) => [c.category, c._count._all]));

  return (
    <AdminGuideCategoriesList
      categories={categories.map((c) => ({
        id: c.id,
        name: c.name,
        nameEn: c.nameEn,
        slug: c.slug,
        order: c.order,
        guideCount: countMap.get(c.name) ?? 0,
      }))}
    />
  );
}
