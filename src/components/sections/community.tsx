"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { FadeIn, SectionHeader, SectionShell } from "@/components/ui/motion";

type Board = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  _count: { posts: number };
};

export function CommunitySection({ boards }: { boards: Board[] }) {
  const { t } = useLocale();

  return (
    <SectionShell id="community" alt>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          title={t.community.title}
          subtitle={t.community.subtitle}
          label={t.nav.community}
          className="mb-0"
        />
        <Link
          href="/community"
          className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-brand hover:underline"
        >
          {t.community.viewAll}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="border-t border-border">
        {boards.map((board, index) => (
          <FadeIn key={board.id} delay={index * 0.03}>
            <Link
              href={`/community/${board.slug}`}
              className="group flex items-center justify-between gap-4 border-b border-border py-5"
            >
              <div>
                <h3 className="font-display text-lg font-semibold tracking-tight group-hover:text-brand md:text-xl">
                  {board.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {board._count.posts.toLocaleString()} posts
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-brand" />
            </Link>
          </FadeIn>
        ))}
      </div>
    </SectionShell>
  );
}
