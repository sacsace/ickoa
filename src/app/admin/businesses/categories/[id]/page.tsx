import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminBusinessCategoryForm } from "@/components/admin/admin-business-category-form";

export const dynamic = "force-dynamic";

export default async function AdminBusinessCategoryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.businessCategory.findUnique({ where: { id } });
  if (!category) notFound();
  return <AdminBusinessCategoryForm mode="edit" category={category} />;
}
