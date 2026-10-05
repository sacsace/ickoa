import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminGalleryCategoryForm } from "@/components/admin/admin-gallery-category-form";

export const dynamic = "force-dynamic";

export default async function AdminGalleryCategoryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.galleryCategory.findUnique({ where: { id } });
  if (!category) notFound();
  return <AdminGalleryCategoryForm mode="edit" category={category} />;
}
