"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { FadeIn, SectionHeader } from "@/components/ui/motion";
import { businessCategories } from "@/data/mock";

type Business = {
  id: string;
  name: string;
  category: string;
  region: string;
  address: string;
};

export function BusinessDirectorySection({
  businesses,
}: {
  businesses: Business[];
}) {
  const { t } = useLocale();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const filtered = businesses.filter((b) => {
    const matchSearch =
      !search ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.region.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !category || b.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <section className="bg-muted/50 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <SectionHeader title={t.directory.title} subtitle={t.directory.subtitle} />

        <FadeIn>
          <div className="mb-8 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={t.directory.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm outline-none focus:border-foreground/30"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {businessCategories.slice(0, 5).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(category === cat ? null : cat)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    category === cat ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </FadeIn>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.slice(0, 6).map((biz, index) => (
            <FadeIn key={biz.id} delay={index * 0.05}>
              <Link
                href={`/business/${biz.id}`}
                className="hover-lift block rounded-2xl border border-border bg-card p-6 md:rounded-3xl"
              >
                <span className="rounded-lg bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {biz.category}
                </span>
                <h3 className="mt-2 text-lg font-bold">{biz.name}</h3>
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {biz.address}
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>

        <FadeIn className="mt-8 text-center">
          <Link href="/business" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline">
            {t.directory.viewAll}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
