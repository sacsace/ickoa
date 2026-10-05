"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function initialOf(name?: string | null) {
  const trimmed = name?.trim();
  if (!trimmed) return "U";
  return trimmed.charAt(0).toUpperCase();
}

export function UserAvatar({
  src,
  name,
  size = "sm",
  className,
}: {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "lg";
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const url = src?.trim() || "";
  const showImage = !!url && !failed;
  const sizeClass = size === "lg" ? "h-20 w-20 text-2xl" : "h-7 w-7 text-[11px]";

  useEffect(() => {
    setFailed(false);
  }, [url]);

  if (showImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className={cn("shrink-0 rounded-full object-cover", sizeClass, className)}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-brand font-bold text-white",
        sizeClass,
        className,
      )}
    >
      {initialOf(name)}
    </span>
  );
}
