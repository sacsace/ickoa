import { prisma } from "@/lib/prisma";
import { AdminClubsList } from "@/components/admin/admin-clubs-list";

export const dynamic = "force-dynamic";

export default async function AdminClubsPage() {
  const clubs = await prisma.club.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { members: true, notices: true } },
    },
  });

  return (
    <AdminClubsList
      items={clubs.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        order: c.order,
        count: c._count.members,
        extra: c.description,
      }))}
    />
  );
}
