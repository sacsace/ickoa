"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function HistoryImage({
  src,
  alt,
  className,
  wrapClassName,
}: {
  src: string;
  alt: string;
  className?: string;
  wrapClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;

  return (
    <div className={cn("overflow-hidden border border-border", wrapClassName)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={cn("object-cover", className)}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
