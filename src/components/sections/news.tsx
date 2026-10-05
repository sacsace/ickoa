"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { FadeIn, SectionHeader, SectionShell } from "@/components/ui/motion";
import { newsCategories } from "@/data/mock";
import { cn } from "@/lib/utils";

type NewsItem = {
  id: string;
  title: string;
  category: string;
  region: string;
  image: string | null;
  createdAt: Date;
};

export function NewsSection({ items }: { items: NewsItem[] }) {
  const { t } = useLocale();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredNews = activeCategory
    ? items.filter((item) => item.category === activeCategory)
    : items;

  const [lead, ...rest] = filteredNews;

  return (
    <SectionShell id="news">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader title={t.news.title} subtitle={t.news.subtitle} label={t.nav.news} className="mb-0" />
        <Link
          href="/news"
          className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-brand hover:underline"
        >
          {t.news.viewAll}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mb-8 flex flex-wrap gap-x-1 gap-y-2 border-b border-border pb-4">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            "px-3 py-1.5 text-sm transition-colors",
            activeCategory === null
              ? "border-b-2 border-brand font-medium text-brand"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          전체
        </button>
        {newsCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-3 py-1.5 text-sm transition-colors",
              activeCategory === cat
                ? "border-b-2 border-brand font-medium text-brand"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {lead && (
        <FadeIn className="mb-2">
          <Link href={`/news/${lead.id}`} className="group grid gap-6 border border-border bg-card md:grid-cols-12">
            {lead.image && (
              <div className="relative aspect-[16/10] md:col-span-7 md:aspect-auto md:min-h-[280px]">
                <Image
                  src={lead.image}
                  alt={lead.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  sizes="(max-width:1024px) 100vw, 58vw"
                />
              </div>
            )}
            <div className={cn("flex flex-col justify-end p-6 md:p-8", lead.image ? "md:col-span-5" : "md:col-span-12")}>
              <p className="text-xs font-medium tracking-[0.12em] text-brand uppercase">
                {lead.category} · {lead.region}
              </p>
              <h3 className="mt-3 font-display text-2xl font-semibold leading-snug group-hover:text-brand md:text-3xl">
                {lead.title}
              </h3>
              <p className="mt-4 text-sm text-muted-foreground">
                {lead.createdAt.toLocaleDateString("ko-KR")}
              </p>
            </div>
          </Link>
        </FadeIn>
      )}

      <div className="border-t border-border">
        {rest.map((item, index) => (
          <FadeIn key={item.id} delay={index * 0.03}>
            <Link
              href={`/news/${item.id}`}
              className="group grid grid-cols-[1fr_auto] items-center gap-4 border-b border-border py-4 md:grid-cols-[7rem_1fr_auto] md:gap-6"
            >
              <p className="hidden text-sm text-muted-foreground md:block">
                {item.createdAt.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" })}
              </p>
              <div className="min-w-0">
                <h3 className="truncate font-medium group-hover:text-brand">{item.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground md:hidden">
                  {item.category} · {item.createdAt.toLocaleDateString("ko-KR")}
                </p>
              </div>
              <p className="hidden text-sm text-muted-foreground md:block">{item.category}</p>
            </Link>
          </FadeIn>
        ))}
      </div>
    </SectionShell>
  );
}
