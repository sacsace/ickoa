import { prisma } from "@/lib/prisma";
import { AdminClubRequestsList } from "@/components/admin/admin-club-requests-list";

export const dynamic = "force-dynamic";

export default async function AdminClubRequestsPage() {
  const requests = await prisma.clubRequest.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminClubRequestsList
      items={requests.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        reason: r.reason,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        requesterName: r.user.name,
      }))}
    />
  );
}
