import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminNewsForm } from "@/components/admin/admin-news-form";

export const dynamic = "force-dynamic";

export default async function AdminNewsEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = await prisma.news.findUnique({ where: { id } });
  if (!news) notFound();

  return (
    <AdminNewsForm
      initial={{
        id: news.id,
        title: news.title,
        content: news.content,
        category: news.category,
        region: news.region,
        image: news.image,
      }}
    />
  );
}
