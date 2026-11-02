"use client";

import dynamic from "next/dynamic";

const MagazinePdfCover = dynamic(
  () =>
    import("@/components/magazine/magazine-pdf-cover").then(
      (m) => m.MagazinePdfCover,
    ),
  { ssr: false },
);

type MagazinePdfCoverLazyProps = {
  pdfUrl?: string | null;
  fallbackSrc: string;
  alt: string;
  className?: string;
  sizes?: string;
  preferPdf?: boolean;
};

/** Client-only wrapper so pdf.js never evaluates during SSR/RSC. */
export function MagazinePdfCoverLazy(props: MagazinePdfCoverLazyProps) {
  return <MagazinePdfCover {...props} />;
}
