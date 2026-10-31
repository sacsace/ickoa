import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { EventForm } from "@/components/events/event-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteUser } from "@/lib/session-kind";
import { canManageSiteResource } from "@/lib/site-permissions";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    select: { title: true },
  });
  return createMetadata({
    title: event ? `${event.title} 수정` : "행사 수정",
    path: `/events/${id}/edit`,
    noIndex: true,
  });
}

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const siteUser = getSiteUser(session);
  if (!siteUser) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/events/${id}/edit`)}`);
  }

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) notFound();
  if (!canManageSiteResource(siteUser, event.createdById)) {
    redirect(`/events/${id}`);
  }

  return (
    <>
      <PageHeader
        title="행사 수정"
        subtitle={event.title}
        backHref={`/events/${event.id}`}
      />
      <div className="mx-auto max-w-[1356px] px-4 py-8 md:px-6">
        <EventForm
          mode="edit"
          initial={{
            id: event.id,
            title: event.title,
            description: event.description,
            location: event.location,
            mapsUrl: event.mapsUrl,
            date: event.date,
            maxAttendees: event.maxAttendees,
            image: event.image,
          }}
        />
      </div>
    </>
  );
}
