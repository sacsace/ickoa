import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { EventRegisterButton } from "@/components/events/event-register-button";
import { EventDeleteButton } from "@/components/events/event-delete-button";
import { createMetadata, truncateDescription } from "@/lib/seo";
import { isEventEnded } from "@/lib/event-status";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    return createMetadata({ title: "이벤트", path: "/events" });
  }
  return createMetadata({
    title: event.title,
    description: truncateDescription(event.description),
    path: `/events/${id}`,
    image: event.image,
  });
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [event, session] = await Promise.all([
    prisma.event.findUnique({
      where: { id },
      include: { _count: { select: { registrations: true } } },
    }),
    auth(),
  ]);
  if (!event) notFound();

  const canDelete =
    !!session?.user?.id && event.createdById === session.user.id;
  const ended = isEventEnded(event.date);

  return (
    <>
      <PageHeader title={event.title} backHref="/events" />
      <div className="mx-auto max-w-[1356px] px-4 py-8 md:px-6">
        {event.image ? (
          <div className="relative mb-6 aspect-[16/9] max-h-[420px] overflow-hidden border border-border">
            <Image
              src={event.image}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 1356px) 100vw, 1356px"
            />
            {ended ? (
              <span className="absolute left-4 top-4 rounded bg-foreground/80 px-2.5 py-1 text-xs font-medium text-background">
                종료된 행사
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-border bg-card px-4 py-3 text-sm">
          <div className="text-muted-foreground">
            {ended ? (
              <>
                <span className="mr-2 rounded bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                  종료
                </span>
              </>
            ) : null}
            <span>{event.date.toLocaleString("ko-KR")}</span>
            <span className="mx-2">·</span>
            <span>{event.location}</span>
            <span className="mx-2">·</span>
            <span>
              {event._count.registrations} / {event.maxAttendees}명 참가
            </span>
          </div>
          <div className="flex items-center gap-2">
            {canDelete ? (
              <EventDeleteButton eventId={event.id} title={event.title} />
            ) : null}
            <Link href="/events">
              <Button type="button" variant="outline" size="sm">
                목록
              </Button>
            </Link>
          </div>
        </div>

        <div className="border border-border bg-card p-5 md:p-6">
          <p className="whitespace-pre-wrap leading-relaxed">{event.description}</p>
        </div>

        <div className="mt-6 max-w-xs">
          <EventRegisterButton eventId={event.id} ended={ended} />
        </div>
      </div>
    </>
  );
}
