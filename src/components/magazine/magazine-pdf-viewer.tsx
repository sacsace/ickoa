"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Document, Page, pdfjs } from "react-pdf";
import type { PDFPageProxy } from "pdfjs-dist";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize2,
  Minimize2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

type MagazinePdfViewerProps = {
  file: string;
  title: string;
  backHref: string;
  initialPage?: number;
};

const VIEWER_PADDING = 32;

function getFitScale(
  viewerWidth: number,
  viewerHeight: number,
  pageWidth: number,
  pageHeight: number,
) {
  if (!viewerWidth || !viewerHeight || !pageWidth || !pageHeight) return 1;

  const availW = Math.max(viewerWidth - VIEWER_PADDING, 1);
  const availH = Math.max(viewerHeight - VIEWER_PADDING, 1);

  return Math.min(availW / pageWidth, availH / pageHeight);
}

export function MagazinePdfViewer({
  file,
  title,
  backHref,
  initialPage = 1,
}: MagazinePdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(Math.max(1, initialPage));
  const [userZoom, setUserZoom] = useState(1);
  const [viewerSize, setViewerSize] = useState({ width: 0, height: 0 });
  const [pageNaturalSize, setPageNaturalSize] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  const fitScale = useMemo(
    () =>
      getFitScale(
        viewerSize.width,
        viewerSize.height,
        pageNaturalSize.width,
        pageNaturalSize.height,
      ),
    [viewerSize, pageNaturalSize],
  );

  const pageWidth =
    pageNaturalSize.width > 0
      ? pageNaturalSize.width * fitScale * userZoom
      : undefined;

  useEffect(() => {
    setPage(Math.max(1, initialPage));
  }, [initialPage, file]);

  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;

    const update = () => {
      setViewerSize({ width: el.clientWidth, height: el.clientHeight });
    };
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fullscreen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setPage((p) => Math.max(1, p - 1));
      if (e.key === "ArrowRight") setPage((p) => (numPages ? Math.min(numPages, p + 1) : p));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [numPages]);

  const onLoadSuccess = useCallback(({ numPages: total }: { numPages: number }) => {
    setNumPages(total);
    setPage((p) => Math.min(Math.max(1, p), total));
    setLoading(false);
    setError(null);
  }, []);

  const onLoadError = useCallback(() => {
    setLoading(false);
    setError("PDF를 불러오지 못했습니다. 다운로드 링크를 이용해 주세요.");
  }, []);

  const onPageLoadSuccess = useCallback((pdfPage: PDFPageProxy) => {
    const viewport = pdfPage.getViewport({ scale: 1 });
    setPageNaturalSize({ width: viewport.width, height: viewport.height });
  }, []);

  const goToPage = (next: number) => {
    if (numPages === 0) return;
    setPage(Math.min(numPages, Math.max(1, next)));
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen?.();
      setFullscreen(true);
    } else {
      await document.exitFullscreen();
      setFullscreen(false);
    }
  };

  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const zoomLabel =
    userZoom === 1 ? "화면 맞춤" : `${Math.round(userZoom * 100)}%`;

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex h-[calc(100svh-4rem)] flex-col bg-muted/50 pt-16 md:h-[calc(100svh-4.25rem)] md:pt-[4.25rem]",
        fullscreen && "h-screen bg-muted pt-0",
      )}
    >
      <div className="sticky top-16 z-20 shrink-0 border-b border-border bg-background/95 backdrop-blur-md md:top-[4.25rem]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3 md:gap-3">
          <Link
            href={backHref}
            className="text-sm text-muted-foreground hover:text-brand md:mr-2"
          >
            ← 목차
          </Link>
          <span className="hidden font-display text-sm font-semibold sm:inline">{title}</span>

          <div className="ml-auto flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted disabled:opacity-40"
              aria-label="이전 페이지"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <form
              className="flex items-center gap-1 text-sm"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const n = parseInt(String(fd.get("page")), 10);
                if (!Number.isNaN(n)) goToPage(n);
              }}
            >
              <input
                name="page"
                type="number"
                min={1}
                max={numPages || 1}
                value={page}
                onChange={(e) => goToPage(parseInt(e.target.value, 10) || 1)}
                className="h-9 w-14 rounded-lg border border-border bg-card text-center text-sm outline-none focus:border-brand"
              />
              <span className="text-muted-foreground">/ {numPages || "—"}</span>
            </form>

            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={numPages === 0 || page >= numPages}
              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted disabled:opacity-40"
              aria-label="다음 페이지"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <span className="mx-1 hidden h-6 w-px bg-border sm:inline" />

            <button
              type="button"
              onClick={() => setUserZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted"
              aria-label="축소"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setUserZoom(1)}
              className="min-w-[4.5rem] rounded-lg px-2 py-1 text-center text-xs text-muted-foreground hover:bg-muted"
              title="화면에 맞춤"
            >
              {zoomLabel}
            </button>
            <button
              type="button"
              onClick={() => setUserZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted"
              aria-label="확대"
            >
              <ZoomIn className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="hidden h-9 w-9 items-center justify-center rounded-lg hover:bg-muted sm:flex"
              aria-label="전체 화면"
            >
              {fullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>

            <a
              href={file}
              download
              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted"
              aria-label="다운로드"
            >
              <Download className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div
        ref={viewerRef}
        className="flex min-h-0 flex-1 items-start justify-center overflow-auto px-4 py-4"
      >
        <div className="w-full max-w-5xl">
          {loading && !error && (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
              <p className="text-sm">한인회보 PDF 불러오는 중…</p>
            </div>
          )}

          {error && (
            <div className="community-card mx-auto max-w-md p-8 text-center">
              <p className="text-sm text-muted-foreground">{error}</p>
              <a
                href={file}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
              >
                <Download className="h-4 w-4" />
                PDF 다운로드
              </a>
            </div>
          )}

          <Document
            file={file}
            onLoadSuccess={onLoadSuccess}
            onLoadError={onLoadError}
            loading={null}
            className={cn(error && "hidden")}
          >
            {pageWidth && numPages > 0 && (
              <Page
                key={`${file}-${page}`}
                pageNumber={page}
                width={pageWidth}
                onLoadSuccess={onPageLoadSuccess}
                className="mx-auto shadow-xl shadow-black/10"
                renderTextLayer
                renderAnnotationLayer
              />
            )}
          </Document>
        </div>
      </div>
    </div>
  );
}
