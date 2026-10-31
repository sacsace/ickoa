import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/ui/page-header";
import { AuthWriteLink } from "@/components/ui/auth-write-link";
import { getEvents } from "@/lib/data";
import { EventRegisterButton } from "@/components/events/event-register-button";
import { createMetadata } from "@/lib/seo";
import { isEventEnded } from "@/lib/event-status";
import { cn } from "@/lib/utils";

export const metadata = createMetadata({
  title: "이벤트 캘린더",
  description: "첸나이 한인회 행사, 모임, 커뮤니티 이벤트 일정",
  path: "/events",
});

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await getEvents();
  const upcoming = events.filter((e) => !isEventEnded(e.date));
  const ended = events.filter((e) => isEventEnded(e.date));
  const ordered = [...upcoming, ...ended];

  return (
    <>
      <PageHeader title="행사 & 캘린더" subtitle="한인회 행사 및 커뮤니티 이벤트" />
      <div className="mx-auto max-w-[1356px] px-4 py-8 md:px-6">
        <div className="mb-4 flex justify-end">
          <AuthWriteLink href="/events/new" label="행사 등록" />
        </div>

        {ordered.length === 0 ? (
          <p className="border border-border bg-card py-16 text-center text-sm text-muted-foreground">
            등록된 행사가 없습니다.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ordered.map((event) => {
              const endedEvent = isEventEnded(event.date);
              return (
                <div
                  key={event.id}
                  className={cn(
                    "overflow-hidden border border-border bg-card",
                    endedEvent && "opacity-75",
                  )}
                >
                  {event.image ? (
                    <div className="relative aspect-[16/9]">
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className={cn("object-cover", endedEvent && "grayscale-[30%]")}
                        sizes="33vw"
                      />
                      {endedEvent ? (
                        <span className="absolute left-3 top-3 rounded bg-foreground/80 px-2 py-1 text-[11px] font-medium text-background">
                          종료
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div className="relative flex aspect-[16/9] items-center justify-center bg-accent text-sm text-muted-foreground">
                      No Image
                      {endedEvent ? (
                        <span className="absolute left-3 top-3 rounded bg-foreground/80 px-2 py-1 text-[11px] font-medium text-background">
                          종료
                        </span>
                      ) : null}
                    </div>
                  )}
                  <div className="p-5">
                    <Link
                      href={`/events/${event.id}`}
                      title={event.title}
                      className="block truncate text-[15px] font-bold hover:text-brand"
                    >
                      {event.title}
                    </Link>
                    <p className="mt-2 truncate text-sm text-muted-foreground">
                      {event.location}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {event.date.toLocaleDateString("ko-KR")} ·{" "}
                      {event._count.registrations}/{event.maxAttendees}명
                      {endedEvent ? " · 종료" : ""}
                    </p>
                    <div className="mt-3 h-1.5 overflow-hidden bg-muted">
                      <div
                        className={cn("h-full", endedEvent ? "bg-muted-foreground/40" : "bg-brand")}
                        style={{
                          width: `${Math.min(
                            100,
                            (event._count.registrations / Math.max(event.maxAttendees, 1)) *
                              100,
                          )}%`,
                        }}
                      />
                    </div>
                    <EventRegisterButton
                      eventId={event.id}
                      ended={endedEvent}
                      className="mt-4 w-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
