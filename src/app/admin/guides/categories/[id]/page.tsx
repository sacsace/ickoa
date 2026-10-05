import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminGuideCategoryForm } from "@/components/admin/admin-guide-category-form";

export const dynamic = "force-dynamic";

export default async function AdminGuideCategoryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.guideCategory.findUnique({ where: { id } });
  if (!category) notFound();

  return <AdminGuideCategoryForm mode="edit" category={category} />;
}
