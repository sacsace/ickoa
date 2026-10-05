import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminBannersDetail } from "@/components/admin/admin-banners-detail";

export const dynamic = "force-dynamic";

export default async function AdminBannerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) notFound();

  return <AdminBannersDetail banner={banner} />;
}
