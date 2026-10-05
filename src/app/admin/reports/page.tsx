import { prisma } from "@/lib/prisma";
import { AdminReportsList } from "@/components/admin/admin-reports-list";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    include: {
      post: { select: { title: true } },
      reporter: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return <AdminReportsList reports={reports} />;
}
