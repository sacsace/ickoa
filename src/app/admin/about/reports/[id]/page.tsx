import { notFound } from "next/navigation";
import { AdminActivityReportForm } from "@/components/admin/admin-activity-report-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminActivityReportEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await prisma.activityReport.findUnique({ where: { id } });
  if (!report) notFound();
  return <AdminActivityReportForm initial={report} />;
}
