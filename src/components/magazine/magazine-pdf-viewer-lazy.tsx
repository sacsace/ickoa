"use client";

import dynamic from "next/dynamic";

const MagazinePdfViewer = dynamic(
  () =>
    import("@/components/magazine/magazine-pdf-viewer").then(
      (m) => m.MagazinePdfViewer,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        PDF 뷰어 준비 중…
      </div>
    ),
  },
);

type MagazinePdfViewerLazyProps = {
  file: string;
  title: string;
  backHref: string;
  initialPage?: number;
};

export function MagazinePdfViewerLazy(props: MagazinePdfViewerLazyProps) {
  return <MagazinePdfViewer {...props} />;
}
