"use client";

import { useState } from "react";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { isHtmlContent, sanitizePostHtml } from "@/lib/sanitize-html";
import { cn } from "@/lib/utils";

const defaultClassName =
  "text-sm leading-relaxed text-foreground [&_a]:text-brand [&_a]:underline [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-bold [&_img]:my-3 [&_img]:h-auto [&_img]:max-w-full [&_img]:cursor-zoom-in [&_img]:rounded-lg [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5";

export function RichHtmlBody({
  content,
  className,
  plainClassName,
}: {
  content: string;
  className?: string;
  plainClassName?: string;
}) {
  const [preview, setPreview] = useState<{ src: string; alt: string } | null>(
    null,
  );

  if (!isHtmlContent(content)) {
    return (
      <p
        className={
          plainClassName ?? "whitespace-pre-wrap leading-relaxed text-foreground"
        }
      >
        {content}
      </p>
    );
  }

  return (
    <>
      <div
        className={cn(defaultClassName, className)}
        dangerouslySetInnerHTML={{ __html: sanitizePostHtml(content) }}
        onClick={(e) => {
          const target = e.target;
          if (!(target instanceof HTMLImageElement)) return;
          const src = target.currentSrc || target.src;
          if (!src) return;
          e.preventDefault();
          setPreview({
            src,
            alt: target.alt || "이미지 미리보기",
          });
        }}
      />
      {preview ? (
        <ImageLightbox
          src={preview.src}
          alt={preview.alt}
          onClose={() => setPreview(null)}
        />
      ) : null}
    </>
  );
}
