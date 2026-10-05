import { prisma } from "@/lib/prisma";
import { AdminGuidesList } from "@/components/admin/admin-guides-list";

export const dynamic = "force-dynamic";

export default async function AdminGuidesPage() {
  const guides = await prisma.guide.findMany({ orderBy: { order: "asc" } });
  return <AdminGuidesList guides={guides} />;
}
