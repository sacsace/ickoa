import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminGuidesDetail } from "@/components/admin/admin-guides-detail";

export const dynamic = "force-dynamic";

export default async function AdminGuideDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guide = await prisma.guide.findUnique({ where: { id } });
  if (!guide) notFound();

  return <AdminGuidesDetail guide={guide} />;
}
