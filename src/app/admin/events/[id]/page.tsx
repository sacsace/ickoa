import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminEventsDetail } from "@/components/admin/admin-events-detail";

export const dynamic = "force-dynamic";

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { _count: { select: { registrations: true } } },
  });
  if (!event) notFound();

  return <AdminEventsDetail event={event} />;
}
