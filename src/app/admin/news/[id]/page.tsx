import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminNewsDetail } from "@/components/admin/admin-news-detail";

export const dynamic = "force-dynamic";

export default async function AdminNewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = await prisma.news.findUnique({ where: { id } });
  if (!news) notFound();

  return <AdminNewsDetail news={news} />;
}
