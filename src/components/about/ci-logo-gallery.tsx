"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageLightbox } from "@/components/ui/image-lightbox";

export type CiLogoVariant = {
  key: string;
  title: string;
  description: string;
  src: string;
  fileName: string;
  width: number;
  height: number;
  /** Wide logos span the full row so preview matches circular logo height. */
  wide?: boolean;
};

const checkerStyle = {
  backgroundColor: "#f3f4f6",
  backgroundImage:
    "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
} as const;

export function CiLogoGallery({ logos }: { logos: CiLogoVariant[] }) {
  const [preview, setPreview] = useState<CiLogoVariant | null>(null);

  return (
    <>
      <div className="mt-6 grid items-stretch gap-4 lg:grid-cols-2">
        {logos.map((logo) => (
          <article
            key={logo.key}
            className={`flex h-full flex-col overflow-hidden border border-border bg-background ${
              logo.wide ? "lg:col-span-2" : ""
            }`}
          >
            <button
              type="button"
              onClick={() => setPreview(logo)}
              className="relative flex h-56 shrink-0 cursor-zoom-in items-center justify-center overflow-hidden px-5 py-6 transition-opacity hover:opacity-90 md:h-64"
              style={checkerStyle}
              aria-label={`${logo.title} 크게 보기`}
            >
              {/* Avoid h-full + max-w-full together — that squashes wide logos. */}
              <Image
                src={logo.src}
                alt={logo.title}
                width={logo.width}
                height={logo.height}
                priority
                sizes={
                  logo.wide
                    ? "(max-width: 1024px) 92vw, 1100px"
                    : "(max-width: 1024px) 90vw, 520px"
                }
                className="h-auto max-h-full w-auto max-w-full object-contain"
                style={{ width: "auto", height: "auto" }}
              />
            </button>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="text-sm font-semibold text-foreground">{logo.title}</h3>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">
                {logo.description}
              </p>
              <a
                href={logo.src}
                download={logo.fileName}
                className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-brand px-3 text-xs font-semibold text-white hover:bg-brand-dark"
              >
                PNG 다운로드
              </a>
            </div>
          </article>
        ))}
      </div>

      {preview ? (
        <ImageLightbox
          src={preview.src}
          alt={preview.title}
          onClose={() => setPreview(null)}
        />
      ) : null}
    </>
  );
}
