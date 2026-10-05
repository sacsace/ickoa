import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminMagazineDetail } from "@/components/admin/admin-magazine-detail";

export const dynamic = "force-dynamic";

export default async function AdminMagazineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const issue = await prisma.magazineIssue.findUnique({ where: { id } });
  if (!issue) notFound();

  return <AdminMagazineDetail issue={issue} />;
}
