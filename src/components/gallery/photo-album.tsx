"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { SectionHeader, FadeIn, SectionShell } from "@/components/ui/motion";
import { galleryAlbums as defaultAlbums, type GalleryAlbum } from "@/data/gallery";
import { cn } from "@/lib/utils";

const categoryLabels = {
  ko: { life: "Chennai", korea: "Korea", ickoa: "ICKOA", clubs: "Clubs" },
  en: { life: "Chennai", korea: "Korea", ickoa: "ICKOA", clubs: "Clubs" },
};

const bentoSpans = [
  "md:col-span-2 md:row-span-2",
  "md:col-span-1 md:row-span-1",
  "md:col-span-1 md:row-span-2",
  "md:col-span-2 md:row-span-1",
];

function AlbumTile({ album, locale, span }: { album: GalleryAlbum; locale: "ko" | "en"; span: string }) {
  const title = locale === "ko" ? album.title : album.titleEn;

  return (
    <Link href={`/gallery/${album.id}`} className={cn("group block min-h-[200px]", span)}>
      <div className="relative h-full min-h-[200px] overflow-hidden border border-border">
        <Image
          src={album.cover}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
          <p className="text-[11px] font-medium tracking-[0.14em] text-white/65 uppercase">
            {categoryLabels[locale][album.category]}
          </p>
          <h3 className="mt-2 font-display text-lg font-semibold text-white md:text-xl">{title}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-white/70">
            {album.photos.length} photos
            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </p>
        </div>
      </div>
    </Link>
  );
}

function Lightbox({
  photos,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  photos: GalleryAlbum["photos"];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const photo = photos[index]!;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute right-6 top-6 text-white/60 hover:text-white">
        <X className="h-6 w-6" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 p-3 text-white/60 hover:text-white md:left-8">
        <ChevronLeft className="h-6 w-6" />
      </button>
      <div className="relative max-h-[85vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
          <Image src={photo.src} alt={photo.caption} fill className="object-contain" sizes="100vw" />
        </div>
        <p className="mt-4 text-center text-sm text-white/80">{photo.caption}</p>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 p-3 text-white/60 hover:text-white md:right-8">
        <ChevronRight className="h-6 w-6" />
      </button>
    </motion.div>
  );
}

export function PhotoAlbumSection({ albums = defaultAlbums }: { albums?: GalleryAlbum[] }) {
  const { locale, t } = useLocale();
  const [lightboxAlbum, setLightboxAlbum] = useState<GalleryAlbum | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  return (
    <SectionShell id="gallery">
      <SectionHeader
        title={t.gallery.title}
        subtitle={t.gallery.subtitle}
        label="Gallery"
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:grid-rows-2 md:gap-4">
        {albums.map((album, i) => (
          <FadeIn key={album.id} delay={i * 0.08}>
            <AlbumTile album={album} locale={locale} span={bentoSpans[i] ?? ""} />
          </FadeIn>
        ))}
      </div>

      <FadeIn className="mt-10">
        <p className="mb-4 font-display text-sm font-semibold text-foreground">
          Recent moments
        </p>
        <div className="flex gap-3 overflow-x-auto snap-x-mandatory pb-2">
          {albums.flatMap((a) => a.photos.slice(0, 2)).map((photo, i) => (
            <button
              key={`${photo.id}-${i}`}
              onClick={() => {
                const album = albums.find((a) => a.photos.some((p) => p.id === photo.id));
                if (album) {
                  setLightboxAlbum(album);
                  setLightboxIdx(album.photos.findIndex((p) => p.id === photo.id));
                }
              }}
              className="snap-start shrink-0 overflow-hidden border border-border transition-[opacity] hover:opacity-90"
            >
              <div className="relative h-44 w-36 md:h-48 md:w-40">
                <Image src={photo.src} alt={photo.caption} fill className="object-cover" sizes="160px" />
              </div>
            </button>
          ))}
        </div>
      </FadeIn>

      <div className="mt-10">
        <Link href="/gallery" className="group inline-flex items-center gap-2 text-sm font-medium text-brand">
          {t.gallery.viewAll}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>

      <AnimatePresence>
        {lightboxAlbum && (
          <Lightbox
            photos={lightboxAlbum.photos}
            index={lightboxIdx}
            onClose={() => setLightboxAlbum(null)}
            onPrev={() => setLightboxIdx((i) => (i - 1 + lightboxAlbum.photos.length) % lightboxAlbum.photos.length)}
            onNext={() => setLightboxIdx((i) => (i + 1) % lightboxAlbum.photos.length)}
          />
        )}
      </AnimatePresence>
    </SectionShell>
  );
}

export function GalleryPageClient({ albums = defaultAlbums }: { albums?: GalleryAlbum[] }) {
  const { locale } = useLocale();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const filtered = activeCategory
    ? albums.filter((a) => a.category === activeCategory)
    : albums;
  const cats = ["life", "ickoa", "clubs"] as const;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
      <div className="mb-10 flex flex-wrap gap-x-1 gap-y-2 border-b border-border pb-4">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            "px-3 py-1.5 text-sm transition-colors",
            !activeCategory
              ? "border-b-2 border-brand font-medium text-brand"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          All
        </button>
        {cats.map((cat) => (
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
            {categoryLabels[locale][cat]}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((album, i) => (
          <FadeIn key={album.id} delay={i * 0.06}>
            <AlbumTile album={album} locale={locale} span="" />
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

export { Lightbox };
