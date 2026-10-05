"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowRight } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { FadeIn, SectionHeader, SectionShell } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";

type EventItem = {
  id: string;
  title: string;
  date: Date;
  location: string;
  image: string | null;
  maxAttendees: number;
  _count: { registrations: number };
};

export function EventsSection({ events }: { events: EventItem[] }) {
  const { t } = useLocale();
  const [featured, ...rest] = events;

  return (
    <SectionShell id="events" alt>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          title={t.events.title}
          subtitle={t.events.subtitle}
          label={t.nav.events}
          className="mb-0"
        />
        <Link
          href="/events"
          className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-brand hover:underline"
        >
          {t.events.viewAll}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {featured && (
        <FadeIn className="mb-2 border border-border bg-card">
          <div className="grid md:grid-cols-2">
            {featured.image && (
              <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[300px]">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              </div>
            )}
            <div className="flex flex-col justify-center p-6 md:p-10">
              <p className="text-xs font-medium tracking-[0.12em] text-brand uppercase">
                {featured.date.toLocaleDateString("ko-KR")}
              </p>
              <Link
                href={`/events/${featured.id}`}
                className="mt-3 font-display text-2xl font-semibold leading-snug hover:text-brand md:text-3xl"
              >
                {featured.title}
              </Link>
              <div className="mt-5 space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {featured.location}
                </p>
                <p>
                  {featured._count.registrations}/{featured.maxAttendees}명 참가
                </p>
              </div>
              <Link href={`/events/${featured.id}`} className="mt-8">
                <Button>{t.events.register}</Button>
              </Link>
            </div>
          </div>
        </FadeIn>
      )}

      <div className="border-t border-border">
        {rest.map((event, index) => (
          <FadeIn key={event.id} delay={index * 0.04}>
            <Link
              href={`/events/${event.id}`}
              className="group grid grid-cols-[4.5rem_1fr] items-start gap-4 border-b border-border py-5 md:grid-cols-[6rem_1fr_auto] md:items-center md:gap-8"
            >
              <div className="pt-0.5">
                <p className="font-display text-2xl font-semibold leading-none text-brand">
                  {event.date.getDate()}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {event.date.toLocaleDateString("ko-KR", { month: "short" })}
                </p>
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-lg font-semibold tracking-tight group-hover:text-brand">
                  {event.title}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {event.location}
                </p>
              </div>
              <p className="col-start-2 text-xs text-muted-foreground md:col-start-auto md:text-sm">
                {event._count.registrations}/{event.maxAttendees}명
              </p>
            </Link>
          </FadeIn>
        ))}
      </div>
    </SectionShell>
  );
}
