import { AdminLeadershipList } from "@/components/admin/admin-leadership-list";
import { ensureAboutDefaults } from "@/lib/about-defaults";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminLeadershipPage() {
  await ensureAboutDefaults();
  const items = await prisma.leadershipMember.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return <AdminLeadershipList items={items} />;
}
