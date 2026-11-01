"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageLightbox } from "@/components/ui/image-lightbox";

export type RegistrationDoc = {
  key: string;
  title: string;
  description: string;
  src: string;
  fileName: string;
  width: number;
  height: number;
};

export function RegistrationDocsGallery({ docs }: { docs: RegistrationDoc[] }) {
  const [preview, setPreview] = useState<RegistrationDoc | null>(null);

  return (
    <>
      <div className="grid items-stretch gap-4 md:grid-cols-2">
        {docs.map((doc) => (
          <article
            key={doc.key}
            className="flex h-full flex-col overflow-hidden border border-border bg-background"
          >
            <button
              type="button"
              onClick={() => setPreview(doc)}
              className="flex h-72 shrink-0 cursor-zoom-in items-center justify-center bg-muted/40 px-4 py-6 transition-opacity hover:opacity-90 md:h-80"
              aria-label={`${doc.title} 크게 보기`}
            >
              <Image
                src={doc.src}
                alt={doc.title}
                width={doc.width}
                height={doc.height}
                className="max-h-full w-auto max-w-full object-contain"
              />
            </button>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="text-sm font-semibold text-foreground">{doc.title}</h3>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">
                {doc.description}
              </p>
              <a
                href={doc.src}
                download={doc.fileName}
                className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-brand px-3 text-xs font-semibold text-white hover:bg-brand-dark"
              >
                다운로드
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
