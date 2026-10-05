import { prisma } from "@/lib/prisma";
import { AdminClubsList } from "@/components/admin/admin-clubs-list";

export const dynamic = "force-dynamic";

export default async function AdminClubsPage() {
  const clubs = await prisma.club.findMany({
    include: { _count: { select: { members: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <AdminClubsList
      items={clubs.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        order: 0,
        count: c._count.members,
        extra: c.description,
      }))}
    />
  );
}
