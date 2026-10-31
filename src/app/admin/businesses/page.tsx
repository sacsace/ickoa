import { prisma } from "@/lib/prisma";
import { AdminBusinessesList } from "@/components/admin/admin-businesses-list";
import { getBusinessCategoryNames } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminBusinessesPage() {
  const [items, categories] = await Promise.all([
    prisma.business.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        category: true,
        region: true,
        address: true,
      },
    }),
    getBusinessCategoryNames(),
  ]);

  return <AdminBusinessesList items={items} categories={categories} />;
}
