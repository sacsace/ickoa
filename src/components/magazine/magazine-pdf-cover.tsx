"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { pdfjs } from "react-pdf";
import { cn } from "@/lib/utils";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

type MagazinePdfCoverProps = {
  pdfUrl?: string | null;
  fallbackSrc: string;
  alt: string;
  className?: string;
  /** Next/Image sizes for the fallback */
  sizes?: string;
  /** Prefer PDF page 1 when pdfUrl exists (default true). */
  preferPdf?: boolean;
};

/**
 * Renders the first page of a magazine PDF as the cover.
 * Falls back to coverImage while loading or if PDF rendering fails.
 */
export function MagazinePdfCover({
  pdfUrl,
  fallbackSrc,
  alt,
  className,
  sizes = "320px",
  preferPdf = true,
}: MagazinePdfCoverProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!preferPdf || !pdfUrl) {
      setReady(false);
      setFailed(true);
      return;
    }

    let cancelled = false;
    setReady(false);
    setFailed(false);

    (async () => {
      try {
        const loadingTask = pdfjs.getDocument({
          url: pdfUrl,
          withCredentials: false,
        });
        const doc = await loadingTask.promise;
        if (cancelled) return;
        const page = await doc.getPage(1);
        if (cancelled) return;

        const base = page.getViewport({ scale: 1 });
        // Target ~900px wide for crisp covers
        const scale = Math.min(2.2, 900 / base.width);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("canvas unavailable");

        const renderTask = page.render({
          canvasContext: ctx,
          viewport,
        } as Parameters<typeof page.render>[0]);
        await renderTask.promise;

        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) {
          setFailed(true);
          setReady(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl, preferPdf]);

  const showFallback = !preferPdf || !pdfUrl || failed || !ready;

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-muted", className)}>
      {showFallback ? (
        <Image
          src={fallbackSrc}
          alt={alt}
          fill
          className="object-cover object-top"
          sizes={sizes}
        />
      ) : null}
      {preferPdf && pdfUrl ? (
        <canvas
          ref={canvasRef}
          aria-label={alt}
          className={cn(
            "pointer-events-none absolute inset-0 h-full w-full object-cover object-top",
            ready ? "opacity-100" : "opacity-0",
          )}
        />
      ) : null}
    </div>
  );
}
