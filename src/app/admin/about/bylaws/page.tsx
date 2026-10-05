import { AdminBylawsList } from "@/components/admin/admin-bylaws-list";
import { ensureAboutDefaults } from "@/lib/about-defaults";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminBylawsPage() {
  await ensureAboutDefaults();
  const items = await prisma.aboutDocument.findMany({
    where: { kind: "bylaws" },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return <AdminBylawsList items={items} />;
}
