import { prisma } from "@/lib/prisma";
import { AdminBusinessesList } from "@/components/admin/admin-businesses-list";

export const dynamic = "force-dynamic";

export default async function AdminBusinessesPage() {
  const items = await prisma.business.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      category: true,
      region: true,
      address: true,
    },
  });

  return <AdminBusinessesList items={items} />;
}
