"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { FadeIn, SectionHeader, SectionShell } from "@/components/ui/motion";

type Club = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  _count: { members: number };
};

export function ClubsSection({ clubs }: { clubs: Club[] }) {
  const { t } = useLocale();

  return (
    <SectionShell id="clubs">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader title={t.clubs.title} subtitle={t.clubs.subtitle} label={t.nav.clubs} className="mb-0" />
        <Link
          href="/clubs"
          className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-brand hover:underline"
        >
          {t.clubs.viewAll}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {clubs.map((club, index) => (
          <FadeIn key={club.id} delay={index * 0.03} className="bg-card">
            <Link href={`/clubs/${club.slug}`} className="group block p-6 md:p-7">
              <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                Club
              </p>
              <h3 className="mt-3 font-display text-xl font-semibold tracking-tight group-hover:text-brand">
                {club.name}
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">{club._count.members}명</p>
            </Link>
          </FadeIn>
        ))}
      </div>
    </SectionShell>
  );
}
