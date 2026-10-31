import Image from "next/image";
import { cn } from "@/lib/utils";

/** 로컬/업로드 경로 또는 외부 URL 썸네일 */
export function EventCoverImage({
  src,
  alt,
  className,
  sizes = "33vw",
  ended = false,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  ended?: boolean;
}) {
  const isLocal = src.startsWith("/") && !src.startsWith("//");
  const isData = src.startsWith("data:");

  if (isData) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={cn(
          "absolute inset-0 h-full w-full object-cover",
          ended && "grayscale-[30%]",
          className,
        )}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized={!isLocal}
      className={cn("object-cover", ended && "grayscale-[30%]", className)}
      sizes={sizes}
    />
  );
}
