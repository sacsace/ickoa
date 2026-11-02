"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AdminDialogVariant = "default" | "destructive" | "success";

const MAX_WIDTH: Record<"md" | "lg" | "xl" | "2xl", string> = {
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

type AdminDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  variant?: AdminDialogVariant;
  maxWidth?: keyof typeof MAX_WIDTH;
  /** Scrollable body for long content */
  scrollBody?: boolean;
  children?: ReactNode;
  footer?: ReactNode;
  /** Focus this element when open (defaults to first focusable in footer) */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
};

export function AdminDialog({
  open,
  onClose,
  title,
  description,
  variant = "default",
  maxWidth = "md",
  scrollBody = false,
  children,
  footer,
  initialFocusRef,
}: AdminDialogProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const focusTarget =
      initialFocusRef?.current ??
      panelRef.current?.querySelector<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      );
    focusTarget?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, initialFocusRef]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/45" aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={cn(
          "relative w-full border border-border bg-white p-6 shadow-xl",
          MAX_WIDTH[maxWidth],
          scrollBody && "flex max-h-[85vh] flex-col",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={cn(
            "mb-4 h-1 w-12 shrink-0",
            variant === "destructive"
              ? "bg-red-600"
              : variant === "success"
                ? "bg-emerald-600"
                : "bg-[#1b2f44]",
          )}
        />
        <h2
          id={titleId}
          className="shrink-0 text-base font-semibold tracking-tight text-foreground"
        >
          {title}
        </h2>
        {description ? (
          <p
            id={descId}
            className="mt-2 shrink-0 text-sm leading-relaxed text-muted-foreground"
          >
            {description}
          </p>
        ) : null}
        {children ? (
          <div className={cn(scrollBody && "mt-4 min-h-0 flex-1 overflow-y-auto")}>
            {children}
          </div>
        ) : null}
        {footer ? <div className="mt-6 flex shrink-0 justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}
