"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function BusinessSearch({ categories }: { categories: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (q) params.set("q", q);
    else params.delete("q");
    router.push(`/business?${params.toString()}`);
  }

  const activeCategory = searchParams.get("category");

  function filterCategory(cat: string | null) {
    const params = new URLSearchParams(searchParams);
    if (!cat) params.delete("category");
    else params.set("category", cat);
    router.push(`/business?${params.toString()}`);
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="기업명, 업종, 지역 검색..."
          className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm outline-none focus:border-foreground/30"
          autoComplete="off"
          suppressHydrationWarning
        />
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => filterCategory(null)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            !activeCategory
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          전체
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => filterCategory(cat)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeCategory === cat
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
