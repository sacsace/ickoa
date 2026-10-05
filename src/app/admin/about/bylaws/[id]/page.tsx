import { notFound } from "next/navigation";
import { AdminBylawForm } from "@/components/admin/admin-bylaw-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminBylawEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = await prisma.aboutDocument.findUnique({ where: { id } });
  if (!doc || doc.kind !== "bylaws") notFound();
  return <AdminBylawForm initial={doc} />;
}
