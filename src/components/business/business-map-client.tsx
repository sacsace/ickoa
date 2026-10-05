"use client";

import { useState } from "react";
import { MapPin, Phone, Globe, ExternalLink } from "lucide-react";
import { GoogleBusinessMap } from "@/components/maps/google-business-map";
import { businessCategories } from "@/data/mock";

type Business = {
  id: string;
  name: string;
  category: string;
  region: string;
  address: string;
  phone: string | null;
  website: string | null;
  lat: number | null;
  lng: number | null;
};

export function BusinessMapClient({ businesses }: { businesses: Business[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = activeCategory
    ? businesses.filter((b) => b.category === activeCategory)
    : businesses;

  const selected = businesses.find((b) => b.id === selectedId);

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${!activeCategory ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}
        >
          All
        </button>
        {businessCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${activeCategory === cat ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <GoogleBusinessMap
            businesses={filtered}
            onSelect={setSelectedId}
            selectedId={selectedId ?? undefined}
          />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          {selected ? (
            <>
              <span className="rounded-lg bg-muted px-3 py-1 text-xs text-muted-foreground">
                {selected.category}
              </span>
              <h3 className="mt-2 text-xl font-bold">{selected.name}</h3>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  {selected.address}
                </div>
                {selected.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {selected.phone}
                  </div>
                )}
                {selected.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {selected.website}
                  </div>
                )}
              </div>
              <a
                href={`/business/${selected.id}`}
                className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background hover:opacity-90"
              >
                <ExternalLink className="h-4 w-4" />
                상세 정보
              </a>
            </>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              지도에서 기업을 선택하세요
            </p>
          )}
        </div>
      </div>
    </>
  );
}
