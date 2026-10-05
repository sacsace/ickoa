import { prisma } from "@/lib/prisma";
import { AdminEventsList } from "@/components/admin/admin-events-list";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    include: { _count: { select: { registrations: true } } },
    orderBy: { date: "desc" },
  });
  return <AdminEventsList events={events} />;
}
