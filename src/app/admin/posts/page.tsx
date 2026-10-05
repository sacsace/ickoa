import { prisma } from "@/lib/prisma";
import { AdminPostsList } from "@/components/admin/admin-posts-list";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    include: {
      author: { select: { name: true } },
      board: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return <AdminPostsList posts={posts} />;
}
