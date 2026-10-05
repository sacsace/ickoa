"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeroSlideData } from "@/data/hero";

const AUTOPLAY_MS = 6000;

type HeroSliderProps = {
  slides: HeroSlideData[];
  onSlideChange?: (index: number) => void;
  /** Fit image tightly inside a portal content box */
  variant?: "full" | "portal";
};

function HeroSlideMedia({
  slide,
  active,
  priority,
  variant,
}: {
  slide: HeroSlideData;
  active: boolean;
  priority?: boolean;
  variant: "full" | "portal";
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [active]);

  const fitClass =
    variant === "portal"
      ? "object-cover object-center"
      : "object-cover object-[center_35%]";

  if (slide.mediaType === "VIDEO") {
    return (
      <video
        ref={videoRef}
        src={slide.mediaUrl}
        muted
        loop
        playsInline
        className={cn("absolute inset-0 h-full w-full", fitClass)}
      />
    );
  }

  return (
    <Image
      src={slide.mediaUrl}
      alt={slide.caption ?? "KAIC hero"}
      fill
      priority={priority}
      className={fitClass}
      quality={90}
      sizes={variant === "portal" ? "(max-width:1024px) 100vw, 820px" : "100vw"}
      unoptimized={slide.mediaUrl.startsWith("http")}
    />
  );
}

export function HeroSlider({
  slides,
  onSlideChange,
  variant = "full",
}: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const isPortal = variant === "portal";

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return;
      const nextIndex = ((index % count) + count) % count;
      setCurrent(nextIndex);
      onSlideChange?.(nextIndex);
    },
    [count, onSlideChange],
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [count, paused, next]);

  if (count === 0) return null;

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-muted"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-500 ease-in-out",
            i === current ? "opacity-100" : "opacity-0",
          )}
          aria-hidden={i !== current}
        >
          {slide.link ? (
            <Link href={slide.link} className="absolute inset-0 z-[1]">
              <span className="sr-only">{slide.caption ?? "슬라이드 링크"}</span>
            </Link>
          ) : null}
          <HeroSlideMedia
            slide={slide}
            active={i === current}
            priority={i === 0}
            variant={variant}
          />
        </div>
      ))}

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className={cn(
              "absolute top-1/2 z-20 -translate-y-1/2 bg-black/35 text-white transition hover:bg-black/55",
              isPortal ? "left-2 p-1.5" : "left-3 p-2.5 md:left-6",
            )}
            aria-label="이전 슬라이드"
          >
            <ChevronLeft className={isPortal ? "h-4 w-4" : "h-5 w-5"} />
          </button>
          <button
            type="button"
            onClick={next}
            className={cn(
              "absolute top-1/2 z-20 -translate-y-1/2 bg-black/35 text-white transition hover:bg-black/55",
              isPortal ? "right-2 p-1.5" : "right-3 p-2.5 md:right-6",
            )}
            aria-label="다음 슬라이드"
          >
            <ChevronRight className={isPortal ? "h-4 w-4" : "h-5 w-5"} />
          </button>

          <div
            className={cn(
              "absolute z-20 flex gap-1.5",
              isPortal ? "bottom-3 right-3" : "bottom-8 right-4 md:bottom-10 md:right-8",
            )}
          >
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(i)}
                className={cn(
                  "transition-all",
                  isPortal ? "h-1.5 rounded-full" : "h-px",
                  i === current
                    ? isPortal
                      ? "w-5 bg-white"
                      : "w-8 bg-white"
                    : isPortal
                      ? "w-1.5 bg-white/55 hover:bg-white/80"
                      : "w-4 bg-white/45 hover:bg-white/70",
                )}
                aria-label={`슬라이드 ${i + 1}`}
                aria-current={i === current}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
