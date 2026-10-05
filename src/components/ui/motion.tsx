"use client";

import type { ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type FadeInProps = HTMLMotionProps<"div"> & {
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
};

export function FadeIn({
  children,
  className,
  delay = 0,
  direction = "up",
  ...props
}: FadeInProps) {
  const offset = {
    up: { y: 10 },
    down: { y: -10 },
    left: { x: 10 },
    right: { x: -10 },
    none: {},
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...offset[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-24px" }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  align = "left",
  label,
  className,
}: {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  label?: string;
  className?: string;
}) {
  return (
    <FadeIn className={cn("mb-5", align === "center" && "text-center", className)}>
      {label && (
        <p
          className={cn(
            "mb-1 text-[12px] font-semibold text-brand",
            align === "center" && "mx-auto",
          )}
        >
          {label}
        </p>
      )}
      <h2
        className={cn(
          "text-xl font-bold tracking-tight text-foreground md:text-2xl",
          align === "center" && "mx-auto",
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted-foreground",
            align === "center" && "mx-auto",
          )}
        >
          {subtitle}
        </p>
      )}
    </FadeIn>
  );
}

export function SectionShell({
  children,
  className,
  alt = false,
  id,
}: {
  children: ReactNode;
  className?: string;
  alt?: boolean;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn("relative py-6 md:py-8", alt ? "section-alt" : "bg-background", className)}
    >
      <div className="relative mx-auto max-w-[1356px] px-4">{children}</div>
    </section>
  );
}
