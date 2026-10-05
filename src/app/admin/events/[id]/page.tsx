import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminEventsForm } from "@/components/admin/admin-events-form";

export const dynamic = "force-dynamic";

export default async function AdminEventEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) notFound();

  return (
    <AdminEventsForm
      initial={{
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        maxAttendees: event.maxAttendees,
        date: event.date,
      }}
    />
  );
}
