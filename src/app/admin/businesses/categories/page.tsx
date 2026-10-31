import { prisma } from "@/lib/prisma";
import { AdminBusinessCategoriesList } from "@/components/admin/admin-business-categories";

export const dynamic = "force-dynamic";

export default async function AdminBusinessCategoriesPage() {
  const categories = await prisma.businessCategory.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
  const counts = await prisma.business.groupBy({
    by: ["category"],
    _count: { _all: true },
  });
  const countMap = new Map(counts.map((c) => [c.category, c._count._all]));

  return (
    <AdminBusinessCategoriesList
      items={categories.map((c) => ({
        id: c.id,
        name: c.name,
        nameEn: c.nameEn,
        slug: c.slug,
        order: c.order,
        count: countMap.get(c.name) ?? 0,
      }))}
    />
  );
}
