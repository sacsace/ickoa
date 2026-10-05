import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminReportsDetail } from "@/components/admin/admin-reports-detail";

export const dynamic = "force-dynamic";

export default async function AdminReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      post: { select: { id: true, title: true, board: { select: { slug: true } } } },
      reporter: { select: { name: true } },
    },
  });
  if (!report) notFound();

  return <AdminReportsDetail report={report} />;
}
