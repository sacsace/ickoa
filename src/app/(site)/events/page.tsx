import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/ui/page-header";
import { AuthWriteLink } from "@/components/ui/auth-write-link";
import { getEvents } from "@/lib/data";
import { EventRegisterButton } from "@/components/events/event-register-button";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "이벤트 캘린더",
  description: "첸나이 한인회 행사, 모임, 커뮤니티 이벤트 일정",
  path: "/events",
});

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <>
      <PageHeader title="행사 & 캘린더" subtitle="한인회 행사 및 커뮤니티 이벤트" />
      <div className="mx-auto max-w-[1356px] px-4 py-8 md:px-6">
        <div className="mb-4 flex justify-end">
          <AuthWriteLink href="/events/new" label="행사 등록" />
        </div>

        {events.length === 0 ? (
          <p className="border border-border bg-card py-16 text-center text-sm text-muted-foreground">
            등록된 행사가 없습니다.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="overflow-hidden border border-border bg-card"
              >
                {event.image ? (
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover"
                      sizes="33vw"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[16/9] items-center justify-center bg-accent text-sm text-muted-foreground">
                    No Image
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
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden bg-muted">
                    <div
                      className="h-full bg-brand"
                      style={{
                        width: `${Math.min(
                          100,
                          (event._count.registrations / Math.max(event.maxAttendees, 1)) *
                            100,
                        )}%`,
                      }}
                    />
                  </div>
                  <EventRegisterButton eventId={event.id} className="mt-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
