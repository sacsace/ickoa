"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useLocale } from "@/components/providers/locale-provider";
import { Lightbox } from "@/components/gallery/photo-album";
import type { GalleryAlbum } from "@/data/gallery";

export function AlbumDetailClient({ album }: { album: GalleryAlbum }) {
  const { locale } = useLocale();
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const title = locale === "ko" ? album.title : album.titleEn;
  const desc = locale === "ko" ? album.description : album.descriptionEn;

  return (
    <div className="mx-auto max-w-6xl px-4 py-24 md:px-8">
      <Link
        href="/gallery"
        className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Gallery
      </Link>

      <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
      <p className="mt-3 text-muted-foreground">{desc}</p>

      <div className="mt-12 columns-2 gap-3 md:columns-3 md:gap-4">
        {album.photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => setLightboxIdx(i)}
            className="group mb-3 block w-full break-inside-avoid md:mb-4"
          >
            <div className={`relative w-full overflow-hidden rounded-xl md:rounded-2xl ${i % 3 === 0 ? "aspect-[3/4]" : "aspect-square"}`}>
              <Image
                src={photo.src}
                alt={photo.caption}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="(max-width:768px) 50vw, 33vw"
              />
            </div>
            <p className="mt-2 text-left text-xs text-muted-foreground">{photo.caption}</p>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {lightboxIdx !== null && (
          <Lightbox
            photos={album.photos}
            index={lightboxIdx}
            onClose={() => setLightboxIdx(null)}
            onPrev={() => setLightboxIdx((i) => (i! - 1 + album.photos.length) % album.photos.length)}
            onNext={() => setLightboxIdx((i) => (i! + 1) % album.photos.length)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
