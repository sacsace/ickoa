"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

export function Logo({ size = 36, forceDark }: { size?: number; forceDark?: boolean }) {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <div
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full bg-muted"
      />
    );
  }

  const src =
    forceDark || resolvedTheme === "dark" ? "/logo-dark.png" : "/logo.png";

  return (
    <span
      style={{ width: size, height: size }}
      className="relative inline-block shrink-0 overflow-hidden rounded-full bg-white"
    >
      <Image
        src={src}
        alt="첸나이 한인회 ICKOA"
        width={size}
        height={size}
        className="h-full w-full object-cover"
        priority
      />
    </span>
  );
}

export function LogoWithText({
  compact = false,
  inverted = false,
}: {
  compact?: boolean;
  inverted?: boolean;
}) {
  return (
    <Link href="/" className="group flex items-center gap-2">
      <Logo size={compact ? 32 : 36} forceDark={inverted} />
      {!compact && (
        <div className="hidden min-w-0 sm:block">
          <p
            className={cn(
              "text-[18px] font-bold leading-none tracking-tight",
              inverted ? "text-white" : "text-brand",
            )}
          >
            첸나이한인회
          </p>
          <p
            className={cn(
              "mt-1 text-[11px] font-medium tracking-tight",
              inverted ? "text-white/70" : "text-muted-foreground",
            )}
          >
            ICKOA
          </p>
        </div>
      )}
    </Link>
  );
}
