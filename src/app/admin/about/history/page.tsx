import { AdminHistoryList } from "@/components/admin/admin-history-list";
import { ensureAboutDefaults } from "@/lib/about-defaults";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminHistoryPage() {
  await ensureAboutDefaults();
  const items = await prisma.historyEntry.findMany({
    orderBy: [{ order: "asc" }, { year: "asc" }],
  });
  return <AdminHistoryList items={items} />;
}
