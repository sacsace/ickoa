import { AdminReportsAboutList } from "@/components/admin/admin-activity-reports-list";
import { ensureAboutDefaults } from "@/lib/about-defaults";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminActivityReportsPage() {
  await ensureAboutDefaults();
  const items = await prisma.activityReport.findMany({
    orderBy: [{ year: "desc" }, { order: "asc" }],
  });
  return <AdminReportsAboutList items={items} />;
}
