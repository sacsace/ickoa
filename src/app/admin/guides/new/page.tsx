import { prisma } from "@/lib/prisma";
import { AdminGuidesForm } from "@/components/admin/admin-guides-form";

export const dynamic = "force-dynamic";

export default async function AdminGuidesNewPage() {
  const categories = await prisma.guideCategory.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });
  return <AdminGuidesForm categories={categories} />;
}
