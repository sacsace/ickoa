import { prisma } from "@/lib/prisma";
import { AdminBannersList } from "@/components/admin/admin-banners-list";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({ orderBy: { order: "asc" } });
  return <AdminBannersList banners={banners} />;
}
