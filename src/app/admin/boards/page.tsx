import { prisma } from "@/lib/prisma";
import { AdminBoardsList } from "@/components/admin/admin-boards-list";

export const dynamic = "force-dynamic";

export default async function AdminBoardsPage() {
  const boards = await prisma.board.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <AdminBoardsList
      items={boards.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        order: 0,
        count: b._count.posts,
        extra: b.icon,
      }))}
    />
  );
}
