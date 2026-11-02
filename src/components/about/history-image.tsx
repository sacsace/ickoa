"use client";

import { useState } from "react";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { cn } from "@/lib/utils";

export function HistoryImage({
  src,
  alt,
  wrapClassName,
}: {
  src: string;
  alt: string;
  wrapClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);

  if (!src || failed) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${alt} 크게 보기`}
        className={cn(
          "block w-[86px] shrink-0 overflow-hidden border border-border bg-muted text-left transition-opacity hover:opacity-90 sm:w-[101px]",
          wrapClassName,
        )}
      >
        <span className="relative block aspect-[3/4] w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="absolute inset-0 h-full w-full object-contain p-0.5"
            onError={() => setFailed(true)}
          />
        </span>
      </button>
      {open ? (
        <ImageLightbox src={src} alt={alt} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}
