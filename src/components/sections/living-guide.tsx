"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { FadeIn, SectionHeader, SectionShell } from "@/components/ui/motion";
import { guideTopicLinks } from "@/data/guide";

type Guide = {
  id: string;
  category: string;
  region: string;
  title: string;
};

export function LivingGuideSection({ guides }: { guides: Guide[] }) {
  const { t } = useLocale();

  return (
    <SectionShell id="guide" alt>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader title={t.guide.title} subtitle={t.guide.subtitle} label={t.nav.guide} className="mb-0" />
        <Link
          href="/guide"
          className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-brand hover:underline"
        >
          {t.guide.viewAll}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <FadeIn className="mb-8 flex flex-wrap gap-x-4 gap-y-2 border-b border-border pb-5">
        {guideTopicLinks.slice(1).map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="text-sm text-muted-foreground transition-colors hover:text-brand"
          >
            {item.labelKo}
          </Link>
        ))}
      </FadeIn>

      <div className="border-t border-border">
        {guides.slice(0, 8).map((guide, index) => (
          <FadeIn key={guide.id} delay={index * 0.03}>
            <Link
              href={`/guide/${guide.id}`}
              className="group flex items-baseline justify-between gap-4 border-b border-border py-4"
            >
              <div className="min-w-0">
                <h3 className="font-medium group-hover:text-brand">{guide.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{guide.region}</p>
              </div>
              <span className="shrink-0 text-xs tracking-wide text-muted-foreground uppercase">
                {guide.category}
              </span>
            </Link>
          </FadeIn>
        ))}
      </div>
    </SectionShell>
  );
}
