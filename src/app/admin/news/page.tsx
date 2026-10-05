import { prisma } from "@/lib/prisma";
import { AdminNewsList } from "@/components/admin/admin-news-list";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  const news = await prisma.news.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      category: true,
      region: true,
      createdAt: true,
    },
  });

  return <AdminNewsList news={news} />;
}
