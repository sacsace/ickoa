"use client";

import { useMemo, useState } from "react";
import { MapPin, Phone, Globe, ExternalLink } from "lucide-react";
import { GoogleBusinessMap } from "@/components/maps/google-business-map";

type Business = {
  id: string;
  name: string;
  category: string;
  region: string;
  address: string;
  phone: string | null;
  website: string | null;
  mapsUrl?: string | null;
  lat: number | null;
  lng: number | null;
};

export function BusinessMapClient({
  businesses,
  categories,
}: {
  businesses: Business[];
  categories: string[];
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const byCategory = activeCategory
      ? businesses.filter((b) => b.category === activeCategory)
      : businesses;
    return byCategory;
  }, [businesses, activeCategory]);

  const mappable = useMemo(
    () => filtered.filter((b) => b.lat != null && b.lng != null),
    [filtered],
  );

  const selected = businesses.find((b) => b.id === selectedId);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${!activeCategory ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${activeCategory === cat ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          지도 표시 {mappable.length}곳
          {filtered.length !== mappable.length
            ? ` · 좌표 없음 ${filtered.length - mappable.length}곳`
            : ""}
        </p>
      </div>

      <div className="w-full space-y-4">
        <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-border">
          <GoogleBusinessMap
            businesses={mappable}
            onSelect={setSelectedId}
            selectedId={selectedId ?? undefined}
          />
        </div>

        <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-border bg-card p-5 md:p-6">
          {selected ? (
            <div className="min-w-0">
              <span className="inline-block max-w-full truncate rounded-lg bg-muted px-3 py-1 text-xs text-muted-foreground">
                {selected.category}
              </span>
              <h3 className="mt-2 break-words text-xl font-bold leading-snug">
                {selected.name}
              </h3>
              <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-start gap-2 sm:col-span-2 lg:col-span-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="min-w-0 break-all">{selected.address}</span>
                </div>
                {selected.phone ? (
                  <div className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="min-w-0 break-all">{selected.phone}</span>
                  </div>
                ) : null}
                {selected.website ? (
                  <div className="flex items-start gap-2">
                    <Globe className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="min-w-0 break-all">{selected.website}</span>
                  </div>
                ) : null}
                {selected.mapsUrl ? (
                  <a
                    href={selected.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-brand hover:underline"
                  >
                    <ExternalLink className="h-4 w-4 shrink-0" />
                    구글맵 열기
                  </a>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {mappable.length === 0
                ? "표시할 지도 위치가 없습니다. 기업 등록 시 구글맵 링크를 입력해 주세요."
                : "지도에서 기업을 선택하세요"}
            </p>
          )}
        </div>
      </div>

      {filtered.length > 0 && mappable.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          등록된 구글맵 링크에서 좌표를 읽지 못했습니다. 공유 링크에 위치가 포함된 URL을
          사용하거나, 기업 정보를 다시 저장해 주세요.
        </p>
      ) : null}
    </>
  );
}
