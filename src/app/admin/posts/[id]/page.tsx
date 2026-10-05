import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPostsDetail } from "@/components/admin/admin-posts-detail";

export const dynamic = "force-dynamic";

export default async function AdminPostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { name: true } },
      board: { select: { name: true, slug: true } },
    },
  });
  if (!post) notFound();

  return <AdminPostsDetail post={post} />;
}
